export type SubscriptionTier = 'free' | 'pro' | 'pro-plus';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  promoCode?: string;
  institutionName?: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  priceUSD?: number;
  currency: string;
  interval: 'month' | 'year';
  recommendedFor?: 'students' | 'students-and-institutions' | 'institutions';
  features: string[];
  limits: {
    startupListings: number;
    mentorshipTokens: number;
    mentorshipDuration: number; // in minutes
  };
  requiresPromoCode?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'innovator' | 'mentor' | 'business' | 'investor';
  university?: string;
  field?: string;
  bio?: string;
  avatar?: string;
  subscriptionId?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  linkedin?: string;
  profile?: string;
}

export interface Startup {
  id: string;
  title: string;
  description: string;
  innovatorId: string;
  innovatorName: string;
  university?: string;
  companyName?: string;
  projectType?: 'uni' | 'individual' | 'company';
  category: string;
  stage: 'idea' | 'startup' | 'testing' | 'ready';
  growthStage?: 'pre-stage' | 'early-stage' | 'mid-stage' | 'late-stage';
  fundingNeeded: number;
  fundingReceived: number;
  images: string[];
  image?: string;
  videoUrl?: string;
  tags: string[];
  views?: number;
  likes?: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'funded' | 'completed';

  // Enhanced Details
  logo?: string;
  bannerImage?: string;
  problem?: string;
  solution?: string;
  targetCustomers?: string;
  demoVideoUrl?: string;

  // Profile Section
  profile?: {
    generalInfo?: {
      description?: string;
    };
    contactInfo?: {
      location?: string;
      url?: string;
      email?: string;
      phone?: string;
    };
    keyPeople?: TeamMember[];
    programmes?: string[];
    foundedYear?: number;
    legalName?: string;
    commercialName?: string;
    growthStage?: 'Early' | 'Mid' | 'Late';
    primaryHQ?: string;
    primaryIndustry?: string;
    otherIndustries?: string[];
    primaryTechnology?: string;
    otherTechnology?: string[];
    companySize?: string;
  };

  // Team Section
  team?: {
    companySize?: string;
    totalFounders?: number;
    totalTopManagement?: number;
    otherEmployees?: number;
    founders?: TeamMember[];
    topManagement?: TeamMember[];
    otherEmployeesList?: TeamMember[];
  };

  // Financials Section
  financials?: {
    totalDeals?: number;
    totalInvestors?: number;
    lastDealDetails?: {
      amount: string;
      currency: string;
      date: string;
    };
    totalFundraised?: string;
    latestValuation?: string;
    latestFundingRound?: string;
  };

  // Pitch Details
  pitchPdf?: string;

  // News Section
  news?: StartupNews[];
}

export interface StartupNews {
  id: string;
  startupId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  company?: string;
  expertise: string[];
  bio: string;
  experience: number;
  avatar?: string;
  image?: string;
  availability: 'available' | 'busy' | 'unavailable';
  isPremium?: boolean;
  mentorshipPrice?: number; // Price per session in MYR
  requiresPayment?: boolean;
}

export interface FundingOpportunity {
  id: string;
  title: string;
  description: string;
  providerId: string;
  providerName: string;
  amount: number;
  category: string;
  requirements: string[];
  deadline: string;
  status: 'open' | 'closed';
  applications: string[];
  featured?: boolean;
  officialUrl?: string;
  grantDuration?: string;
}

export interface Application {
  id: string;
  startupId: string;
  opportunityId: string;
  innovatorId: string;
  innovatorName: string;
  innovatorEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;

  // Enhanced application fields
  fullName?: string;
  icNumber?: string;
  phoneNumber?: string;
  country?: string;
  companyName?: string;
  companyWebsite?: string;
  companyDescription?: string;
  companyIncorporatedDate?: string;
  officeAddress?: string;
  hasOfficeInMalaysia?: 'yes' | 'no' | 'used-to-have' | 'thinking-about-it';
  companyStage?: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'late-stage' | 'post-valuation';
  postValuation?: string;
  annualRevenue?: string;
  focusArea?: string[];
  technologyArea?: string[];
  proposedActivities?: string[];
  industryFocus?: string[];
  hasRegisteredCompany?: boolean;
  businessProposalFile?: string;
  companyRegistrationFile?: string;
  companyProfileFile?: string;

  createdAt: string;
  updatedAt?: string;
}

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  mentorName: string;
  innovatorId: string;
  innovatorName: string;
  innovatorEmail: string;
  startupId?: string;
  startupTitle?: string;
  message: string;
  goals?: string;
  status: 'pending' | 'approved' | 'rejected';
  mentorResponse?: string;
  requiresPayment?: boolean;
  paymentAmount?: number;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface OnDemandPurchase {
  id: string;
  userId: string;
  type: 'startup_listing' | 'mentorship_token';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  expiresAt?: string;
}

export interface Programme {
  id: string;
  title: string;
  description: string;
  type: 'accelerator' | 'pre-accelerator' | 'hackathon' | 'workshop' | 'bootcamp' | 'competition';
  category: string;
  organizer: string;
  organizerId: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  location: string;
  format: 'online' | 'offline' | 'hybrid';
  maxParticipants?: number;
  currentParticipants: number;
  eligibility: string[];
  benefits: string[];
  requirements: string[];
  fee: number;
  grantAmount?: number;
  status: 'upcoming' | 'open' | 'closed' | 'ongoing' | 'completed';
  image?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'networking' | 'workshop' | 'seminar' | 'conference' | 'hackathon' | 'competition' | 'exhibition';
  organizer: string;
  organizerId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  format: 'online' | 'offline' | 'hybrid';
  maxAttendees?: number;
  currentAttendees: number;
  registrationRequired: boolean;
  registrationDeadline?: string;
  fee: number;
  status: 'upcoming' | 'open' | 'closed' | 'ongoing' | 'completed';
  image?: string;
  agenda?: string[];
  speakers?: Array<{ name: string; title: string; bio?: string }>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProgrammeRegistration {
  id: string;
  programmeId: string;
  innovatorId: string;
  innovatorName: string;
  innovatorEmail: string;
  startupId?: string;
  startupTitle?: string;
  applicationMessage?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'waitlisted';
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  attendeeId: string;
  attendeeName: string;
  attendeeEmail: string;
  status: 'registered' | 'attended' | 'cancelled';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'mentorship' | 'funding' | 'programme' | 'event' | 'comment' | 'like' | 'system';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  startupId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: 'startup_created' | 'startup_updated' | 'mentorship_requested' | 'funding_applied' | 'programme_registered' | 'event_registered' | 'comment_added' | 'like_added';
  title: string;
  description: string;
  link?: string;
  createdAt: string;
}

