import { storage } from './storage';
import { SubscriptionPlan, SubscriptionTier } from '@/types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceUSD: 0,
    currency: 'MYR',
    interval: 'month',
    recommendedFor: 'students',
    features: [
      '1 Startup Listing',
      '1 Mentorship Token (30 mins)',
      'Basic Analytics',
      'Community Access',
      'Email Support',
    ],
    limits: {
      startupListings: 1,
      mentorshipTokens: 1,
      mentorshipDuration: 30,
    },
  },
  {
    id: 'pro',
    name: 'Pro / Education',
    price: 149,
    priceUSD: 35,
    currency: 'MYR',
    interval: 'month',
    recommendedFor: 'students-and-institutions',
    features: [
      '5 Startup Listings',
      '5 Mentorship Tokens (30 mins each)',
      'Premium Workshop Access',
      'Priority Support',
      'Advanced Analytics',
      'Featured Listings',
      'Priority in Funding Applications',
      'Institution Promo Code Required',
    ],
    limits: {
      startupListings: 5,
      mentorshipTokens: 5,
      mentorshipDuration: 30,
    },
    requiresPromoCode: true,
  },
  {
    id: 'pro-plus',
    name: 'Pro+',
    price: 299,
    priceUSD: 69,
    currency: 'MYR',
    interval: 'month',
    recommendedFor: 'institutions',
    features: [
      '15 Startup Listings',
      '10 Mentorship Tokens (30 mins each)',
      'All Premium Workshops',
      'Priority Support (24/7)',
      'Advanced Analytics Dashboard',
      'Featured Listings (Priority)',
      'Priority in Funding Applications',
      'Custom Branding',
      'API Access',
      'Dedicated Account Manager',
    ],
    limits: {
      startupListings: 15,
      mentorshipTokens: 10,
      mentorshipDuration: 30,
    },
  },
];

export function getUserSubscriptionPlan(userId: string): SubscriptionPlan {
  const subscription = storage.getUserSubscription(userId);
  if (!subscription) {
    return SUBSCRIPTION_PLANS.find(p => p.id === 'free')!;
  }
  return SUBSCRIPTION_PLANS.find(p => p.id === subscription.tier) || SUBSCRIPTION_PLANS[0];
}

export function canCreateStartup(userId: string): { allowed: boolean; reason?: string; canPurchase?: boolean; purchasePrice?: number } {
  const plan = getUserSubscriptionPlan(userId);
  const startups = storage.getStartups();
  const purchases = storage.getOnDemandPurchases();
  
  const userStartups = startups.filter(s => s.innovatorId === userId && s.status === 'active');
  const userPurchases = purchases.filter(p => p.userId === userId && p.type === 'startup_listing' && p.status === 'completed');
  
  const totalLimit = plan.limits.startupListings + userPurchases.length;
  
  if (userStartups.length >= totalLimit) {
    const purchasePrice = getOnDemandPrice(userId, 'startup_listing');
    return {
      allowed: false,
      reason: `You have reached your limit of ${totalLimit} startup listing(s). You can purchase additional listings for RM ${purchasePrice} each.`,
      canPurchase: true,
      purchasePrice,
    };
  }
  
  return { allowed: true };
}

export function canRequestMentorship(userId: string, mentorRequiresPayment?: boolean, mentorPrice?: number): { allowed: boolean; reason?: string; tokensRemaining?: number; canPurchase?: boolean; purchasePrice?: number; requiresPayment?: boolean; paymentAmount?: number } {
  const plan = getUserSubscriptionPlan(userId);
  const requests = storage.getMentorshipRequests();
  const purchases = storage.getOnDemandPurchases();
  
  const userRequests = requests.filter(r => r.innovatorId === userId);
  const userPurchases = purchases.filter(p => p.userId === userId && p.type === 'mentorship_token' && p.status === 'completed');
  
  // Count used tokens (each request uses 1 token)
  const usedTokens = userRequests.length;
  const totalTokens = plan.limits.mentorshipTokens + userPurchases.length;
  
  // If mentor requires payment, check if user can pay
  if (mentorRequiresPayment && mentorPrice) {
    return {
      allowed: true,
      requiresPayment: true,
      paymentAmount: mentorPrice,
      tokensRemaining: totalTokens - usedTokens,
    };
  }
  
  if (usedTokens >= totalTokens) {
    const purchasePrice = getOnDemandPrice(userId, 'mentorship_token');
    return {
      allowed: false,
      reason: `You have used all ${totalTokens} mentorship token(s). You can purchase additional tokens for RM ${purchasePrice} each.`,
      tokensRemaining: 0,
      canPurchase: true,
      purchasePrice,
    };
  }
  
  return {
    allowed: true,
    tokensRemaining: totalTokens - usedTokens,
  };
}

export function getSubscriptionUsage(userId: string) {
  const plan = getUserSubscriptionPlan(userId);
  const startups = storage.getStartups();
  const requests = storage.getMentorshipRequests();
  const purchases = storage.getOnDemandPurchases();
  
  const userStartups = startups.filter(s => s.innovatorId === userId && s.status === 'active');
  const userRequests = requests.filter(r => r.innovatorId === userId);
  const userPurchases = purchases.filter(p => p.userId === userId && p.status === 'completed');
  
  // Count purchased listings and tokens
  const purchasedListings = userPurchases.filter(p => p.type === 'startup_listing').length;
  const purchasedTokens = userPurchases.filter(p => p.type === 'mentorship_token').length;
  
  return {
    plan: plan.name,
    tier: plan.id,
    startups: {
      used: userStartups.length,
      limit: plan.limits.startupListings + purchasedListings,
      remaining: Math.max(0, (plan.limits.startupListings + purchasedListings) - userStartups.length),
      purchased: purchasedListings,
    },
    mentorship: {
      used: userRequests.length,
      limit: plan.limits.mentorshipTokens + purchasedTokens,
      remaining: Math.max(0, (plan.limits.mentorshipTokens + purchasedTokens) - userRequests.length),
      purchased: purchasedTokens,
    },
  };
}

// On-demand purchase prices
export const ON_DEMAND_PRICES = {
  startup_listing: {
    free: 29, // RM 29 for free tier users
    pro: 19, // RM 19 for pro tier users
    'pro-plus': 15, // RM 15 for pro+ tier users
  },
  mentorship_token: {
    free: 99, // RM 99 for free tier users
    pro: 79, // RM 79 for pro tier users
    'pro-plus': 69, // RM 69 for pro+ tier users
  },
};

export function getOnDemandPrice(userId: string, type: 'startup_listing' | 'mentorship_token'): number {
  const plan = getUserSubscriptionPlan(userId);
  return ON_DEMAND_PRICES[type][plan.id];
}

export function purchaseOnDemand(userId: string, type: 'startup_listing' | 'mentorship_token'): { success: boolean; purchaseId?: string; error?: string } {
  const price = getOnDemandPrice(userId, type);
  
  // In a real system, this would process payment
  // For now, we'll just create the purchase record
  const purchase = {
    id: `purchase_${Date.now()}`,
    userId,
    type,
    amount: price,
    currency: 'MYR',
    status: 'completed' as const,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year validity
  };
  
  storage.createOnDemandPurchase(purchase);
  
  return { success: true, purchaseId: purchase.id };
}

