'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Sparkles, Zap, Crown, GraduationCap, AlertCircle, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { SubscriptionPlan, SubscriptionTier } from '@/types';
import { SUBSCRIPTION_PLANS, getOnDemandPrice } from '@/lib/subscription';
import OnDemandPurchaseDialog from '@/components/OnDemandPurchaseDialog';

const plans: SubscriptionPlan[] = SUBSCRIPTION_PLANS;

export default function SubscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoValid, setPromoValid] = useState<any>(null);
  const [institutionName, setInstitutionName] = useState('');
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'startup_listing' | 'mentorship_token' | null>(null);

  useEffect(() => {
    const session = storage.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUser(session);

    const subscription = storage.getUserSubscription(session.id);
    setCurrentSubscription(subscription);
  }, [router]);

  const handlePromoCodeCheck = () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      setPromoValid(null);
      return;
    }

    const validated = storage.validatePromoCode(promoCode);
    if (validated) {
      setPromoValid(validated);
      setPromoError('');
      setInstitutionName(validated.institutionName || '');
    } else {
      setPromoValid(null);
      setPromoError('Invalid or expired promo code');
    }
  };

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if Pro plan requires promo code
    if (plan.id === 'pro' && plan.requiresPromoCode) {
      if (!promoValid) {
        setPromoError('Please enter a valid promo code for Education plan');
        setSelectedPlan('pro');
        return;
      }
    }

    // Create subscription
    const subscription = {
      id: `sub_${Date.now()}`,
      userId: user.id,
      tier: plan.id,
      status: 'active' as const,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      promoCode: promoValid?.code || undefined,
      institutionName: institutionName || undefined,
      autoRenew: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.createSubscription(subscription);

    // Update user with subscription ID
    const users = storage.getUsers();
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].subscriptionId = subscription.id;
      storage.saveUsers(users);
    }

    // Update session
    const updatedUser = { ...user, subscriptionId: subscription.id };
    storage.saveSession(updatedUser);

    alert(`Successfully subscribed to ${plan.name}! Redirecting to dashboard...`);
    router.push('/dashboard');
  };

  if (!user) {
    return null;
  }

  const getPlanIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return <Sparkles className="h-6 w-6" />;
      case 'pro':
        return <GraduationCap className="h-6 w-6" />;
      case 'pro-plus':
        return <Crown className="h-6 w-6" />;
    }
  };

  const getPlanColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return 'border-gray-300';
      case 'pro':
        return 'border-blue-500';
      case 'pro-plus':
        return 'border-purple-500';
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Choose Your Plan</h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Select the perfect subscription plan to unlock your innovation potential
          </p>
        </div>

        {currentSubscription && (
          <Card className="mb-8 border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">
                    {plans.find(p => p.id === currentSubscription.tier)?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Active until {new Date(currentSubscription.endDate || '').toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.tier === plan.id;
            const isPro = plan.id === 'pro';
            const showPromoInput = selectedPlan === 'pro' && isPro;

            return (
              <Card
                key={plan.id}
                className={`relative border-2 ${getPlanColor(plan.id)} ${isCurrentPlan ? 'bg-muted/50' : ''
                  }`}
              >
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="default">Current Plan</Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    {getPlanIcon(plan.id)}
                    <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
                  </div>
                  {plan.recommendedFor && (
                    <div className="mb-3">
                      <Badge
                        variant="secondary"
                        className={
                          plan.recommendedFor === 'students'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : plan.recommendedFor === 'students-and-institutions'
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : 'bg-purple-100 text-purple-800 border-purple-300'
                        }
                      >
                        {plan.recommendedFor === 'students' && 'Recommended for Students'}
                        {plan.recommendedFor === 'students-and-institutions' && 'Recommended for Students and Institutions'}
                        {plan.recommendedFor === 'institutions' && 'Recommended for Institutions'}
                      </Badge>
                    </div>
                  )}
                  <div className="space-y-1">
                    {plan.price > 0 && plan.priceUSD ? (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl sm:text-5xl font-bold text-primary">
                            ${plan.priceUSD}
                          </span>
                          <span className="text-base sm:text-lg text-muted-foreground">USD</span>
                          {plan.interval && (
                            <span className="text-muted-foreground text-sm sm:text-base">/{plan.interval}</span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base sm:text-lg text-muted-foreground">
                            RM {plan.price}
                          </span>
                          <span className="text-xs sm:text-sm text-muted-foreground">MYR</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-bold">
                          Free
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isPro && (
                    <div className="mb-4 space-y-2">
                      <Label htmlFor={`promo-${plan.id}`}>Institution Promo Code</Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          id={`promo-${plan.id}`}
                          placeholder="Enter promo code"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value);
                            setPromoError('');
                            setPromoValid(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handlePromoCodeCheck();
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePromoCodeCheck}
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          Verify
                        </Button>
                      </div>
                      {promoError && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {promoError}
                        </p>
                      )}
                      {promoValid && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <Check className="h-4 w-4" />
                          Valid code for {promoValid.institutionName}
                        </p>
                      )}
                      {showPromoInput && !promoValid && (
                        <p className="text-xs text-muted-foreground">
                          Contact your institution for a promo code
                        </p>
                      )}
                    </div>
                  )}

                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? 'outline' : 'default'}
                    disabled={isCurrentPlan}
                    onClick={() => {
                      if (isPro) {
                        setSelectedPlan('pro');
                        if (!promoValid) {
                          setPromoError('Please verify your promo code first');
                        } else {
                          handleSubscribe(plan);
                        }
                      } else {
                        handleSubscribe(plan);
                      }
                    }}
                  >
                    {isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Get Started' : 'Subscribe'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-4 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
          <CardHeader className="bg-primary/10 border-b-2 border-primary/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="p-2 bg-primary rounded-lg flex-shrink-0">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl sm:text-3xl flex flex-wrap items-center gap-2">
                  On-Demand Purchases
                  <Badge variant="default" className="bg-primary text-primary-foreground">
                    Available Now
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-2">
                  Need more? Purchase individual items without upgrading your subscription
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border-2 border-primary/30 rounded-xl bg-card hover:border-primary/50 transition-all shadow-md hover:shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold">Additional Startup Listing</h3>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl sm:text-4xl font-bold text-primary">
                      ${user ? Math.round(getOnDemandPrice(user.id, 'startup_listing') / 4.2) : 7}
                    </span>
                    <span className="text-base sm:text-lg text-muted-foreground">USD</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl text-muted-foreground">
                      RM {user ? getOnDemandPrice(user.id, 'startup_listing') : 29}
                    </span>
                    <span className="text-sm text-muted-foreground">MYR</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Purchase an additional startup listing. Valid for 1 year. Price varies by subscription tier.
                </p>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  onClick={() => {
                    setPurchaseType('startup_listing');
                    setShowPurchaseDialog(true);
                  }}
                >
                  Purchase Now
                </Button>
              </div>
              <div className="p-6 border-2 border-primary/30 rounded-xl bg-card hover:border-primary/50 transition-all shadow-md hover:shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold">Additional Mentorship Token</h3>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl sm:text-4xl font-bold text-primary">
                      ${user ? Math.round(getOnDemandPrice(user.id, 'mentorship_token') / 4.2) : 12}
                    </span>
                    <span className="text-base sm:text-lg text-muted-foreground">USD</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl text-muted-foreground">
                      RM {user ? getOnDemandPrice(user.id, 'mentorship_token') : 49}
                    </span>
                    <span className="text-sm text-muted-foreground">MYR</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Purchase an additional mentorship token (30 minutes). Valid for 1 year. Price varies by subscription tier.
                </p>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  onClick={() => {
                    setPurchaseType('mentorship_token');
                    setShowPurchaseDialog(true);
                  }}
                >
                  Purchase Now
                </Button>
              </div>
            </div>
            <div className="mt-6 p-4 bg-primary/5 border-2 border-primary/20 rounded-lg">
              <p className="text-sm text-foreground">
                <strong className="text-primary">Note:</strong> On-demand purchases are available for all subscription tiers. Premium mentors may require additional payment per session, which is separate from mentorship tokens.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Subscription Benefits</CardTitle>
            <CardDescription>What you get with each plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Startup Listings</h3>
                <p className="text-sm text-muted-foreground">
                  Showcase your innovative projects and get discovered by mentors, investors, and partners.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Mentorship Tokens</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with experienced mentors for 30-minute sessions to get guidance on your startup journey.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Premium Features</h3>
                <p className="text-sm text-muted-foreground">
                  Access exclusive workshops, priority support, advanced analytics, and more based on your plan.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="inline-flex items-center justify-center border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            Back to Dashboard
          </Link>
        </div>

        {user && purchaseType && (
          <OnDemandPurchaseDialog
            open={showPurchaseDialog}
            onOpenChange={(open) => {
              setShowPurchaseDialog(open);
              if (!open) setPurchaseType(null);
            }}
            type={purchaseType}
            price={getOnDemandPrice(user.id, purchaseType)}
            userId={user.id}
            onSuccess={() => {
              // Refresh subscription usage
              const subscription = storage.getUserSubscription(user.id);
              setCurrentSubscription(subscription);
            }}
          />
        )}
      </div>
    </div>
  );
}

