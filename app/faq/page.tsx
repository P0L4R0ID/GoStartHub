'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, HelpCircle, BookOpen, CreditCard, Users, Rocket, DollarSign, MessageSquare, Calendar } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'How do I create my first startup listing?',
    answer: 'After signing up, go to your dashboard and click "Add Startup". Fill in your startup details including title, description, category, funding needs, and upload images. Once submitted, your startup will be visible in the catalog.',
  },
  {
    category: 'Getting Started',
    question: 'What information do I need to provide for my startup?',
    answer: 'You\'ll need: startup title, description, category, funding requirements, team information, prototype details, and images. The more complete your profile, the better your chances of attracting mentors and investors.',
  },
  {
    category: 'Getting Started',
    question: 'How do I get verified as a university student?',
    answer: 'University verification happens automatically when you select your university during registration. Your startup will be tagged with your university name and marked as a university project.',
  },
  {
    category: 'Subscriptions',
    question: 'What\'s included in the Free tier?',
    answer: 'The Free tier includes 1 startup listing and 1 mentorship token (30 minutes). This is perfect for students who want to test the platform and showcase their first innovation.',
  },
  {
    category: 'Subscriptions',
    question: 'What is the Pro/Education tier?',
    answer: 'Pro/Education is designed for students and institutions. It includes 5 startup listings, 5 mentorship tokens, and access to premium workshops. You need a promo code from your institution to access this tier.',
  },
  {
    category: 'Subscriptions',
    question: 'Can I purchase additional listings or tokens without upgrading?',
    answer: 'Yes! You can purchase additional startup listings or mentorship tokens on-demand from the Subscription page. Prices vary based on your current subscription tier.',
  },
  {
    category: 'Subscriptions',
    question: 'How do I get a promo code for the Education tier?',
    answer: 'Contact your university or institution\'s innovation office. They can provide you with a promo code that unlocks the Pro/Education tier at a discounted rate.',
  },
  {
    category: 'Mentorship',
    question: 'How does mentorship work?',
    answer: 'Browse available mentors, view their expertise and availability, then request a mentorship session. Free mentors use your mentorship tokens, while premium mentors require direct payment.',
  },
  {
    category: 'Mentorship',
    question: 'What is a mentorship token?',
    answer: 'A mentorship token gives you 30 minutes of mentorship time with a free mentor. You receive tokens based on your subscription tier, and can purchase additional tokens if needed.',
  },
  {
    category: 'Mentorship',
    question: 'Why do some mentors require payment?',
    answer: 'Premium mentors are industry experts who offer specialized guidance. They set their own rates and require direct payment as they are not part of the platform\'s free mentorship program.',
  },
  {
    category: 'Funding',
    question: 'How do I apply for funding?',
    answer: 'Browse available funding opportunities, review the requirements, and click "Apply for Funding". Fill out the application form with your startup details and submit. Businesses will review your application.',
  },
  {
    category: 'Funding',
    question: 'What happens after I apply for funding?',
    answer: 'Your application will be reviewed by the funding provider. You\'ll receive updates on the status (pending, approved, rejected) in your dashboard. Approved applications may require additional documentation.',
  },
  {
    category: 'Funding',
    question: 'How is funding tracked?',
    answer: 'Your funding progress is displayed on your startup profile. It shows how much you\'ve received versus your funding goal, helping investors see your progress.',
  },
  {
    category: 'Programmes & Events',
    question: 'How do I register for a programme?',
    answer: 'Browse available programmes, read the details and requirements, then click "Apply Now". Fill out the application form and submit. You\'ll receive confirmation and updates in your dashboard.',
  },
  {
    category: 'Programmes & Events',
    question: 'Can I register for multiple programmes?',
    answer: 'Yes, you can apply to multiple programmes. However, make sure you can commit to the requirements and schedules of each programme you apply to.',
  },
  {
    category: 'Programmes & Events',
    question: 'How do I register for events?',
    answer: 'Browse upcoming events, check the date and format (online/offline), then click "Register". You\'ll receive confirmation and event details in your dashboard.',
  },
  {
    category: 'Engagement',
    question: 'How do views and likes work?',
    answer: 'Views are automatically counted when someone visits your startup page. Likes are added when users click the heart button. These metrics help showcase your startup\'s popularity.',
  },
  {
    category: 'Engagement',
    question: 'What does the "Trending" badge mean?',
    answer: 'The Trending badge appears on startups with high engagement (200+ views and 20+ likes, or 500+ views, or 50+ likes). It helps highlight popular innovations on the platform.',
  },
  {
    category: 'Technical',
    question: 'What image formats are supported?',
    answer: 'We support common image formats including JPG, PNG, and WebP. For best results, use high-quality images with a recommended size of 1200x800 pixels.',
  },
  {
    category: 'Technical',
    question: 'Can I edit my startup after publishing?',
    answer: 'Yes, you can edit your startup details at any time from your dashboard. Changes will be reflected immediately on your startup profile.',
  },
  {
    category: 'Technical',
    question: 'How do I delete my account?',
    answer: 'Contact our support team to delete your account. Note that deleting your account will remove all your startups, applications, and data from the platform.',
  },
];

const categories = ['All', 'Getting Started', 'Subscriptions', 'Mentorship', 'Funding', 'Programmes & Events', 'Engagement', 'Technical'];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpen = new Set(openItems);
    if (newOpen.has(index)) {
      newOpen.delete(index);
    } else {
      newOpen.add(index);
    }
    setOpenItems(newOpen);
  };

  const filteredFAQs = selectedCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Getting Started':
        return <Rocket className="h-4 w-4" />;
      case 'Subscriptions':
        return <CreditCard className="h-4 w-4" />;
      case 'Mentorship':
        return <Users className="h-4 w-4" />;
      case 'Funding':
        return <DollarSign className="h-4 w-4" />;
      case 'Programmes & Events':
        return <Calendar className="h-4 w-4" />;
      case 'Engagement':
        return <MessageSquare className="h-4 w-4" />;
      case 'Technical':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <Badge variant="secondary" className="mb-3 sm:mb-4">Help Center</Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Frequently Asked Questions</h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Find answers to common questions about Go Start Hub
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-white border-primary'
                    : 'bg-background border-border hover:border-primary/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-all">
              <CardHeader
                className="cursor-pointer"
                onClick={() => toggleItem(index)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(faq.category)}
                      <Badge variant="outline" className="text-xs">
                        {faq.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-base sm:text-lg">{faq.question}</CardTitle>
                  </div>
                  <div className="flex-shrink-0">
                    {openItems.has(index) ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
              {openItems.has(index) && (
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="mt-12 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Still have questions?
            </CardTitle>
            <CardDescription>
              Can't find what you're looking for? Contact our support team for assistance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <p className="font-semibold mb-1">Email Support</p>
                <p className="text-muted-foreground">support@gostarthub.com</p>
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">Response Time</p>
                <p className="text-muted-foreground">Within 24 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

