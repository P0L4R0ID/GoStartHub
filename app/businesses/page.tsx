'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, DollarSign, TrendingUp, ArrowRight, UserCheck } from 'lucide-react';

export default function BusinessesPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">Business Network</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Connect with Businesses</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Partner with Malaysian businesses to support and invest in innovative student prototypes
          </p>
        </div>

        {/* Benefits for Businesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover-lift border-2 hover:border-primary/50">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <CardTitle>Early Access to Innovation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Discover cutting-edge prototypes and innovations from talented students before they hit the market
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-2 hover:border-primary/50">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 shadow-lg">
                <UserCheck className="h-7 w-7 text-white" />
              </div>
              <CardTitle>Build Partnerships</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Establish strategic partnerships with future entrepreneurs and build your talent pipeline
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-2 hover:border-primary/50">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
              <CardTitle>Investment Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Invest in promising innovations with potential for high returns and social impact
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works for Businesses */}
        <Card className="mb-12 border-2">
          <CardHeader>
            <CardTitle className="text-3xl mb-2">How It Works for Businesses</CardTitle>
            <CardDescription>Simple steps to get involved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Register Your Business</h3>
                <p className="text-muted-foreground">
                  Create a business profile and specify your areas of interest
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Browse Innovations</h3>
                <p className="text-muted-foreground">
                  Explore student prototypes and innovations that align with your business goals
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect & Invest</h3>
                <p className="text-muted-foreground">
                  Connect with innovators, offer funding, or become a mentor
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-primary/10 to-purple-600/10 border-2 border-primary/20">
          <CardHeader className="text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-primary" />
            <CardTitle className="text-3xl mb-2">Ready to Get Started?</CardTitle>
            <CardDescription className="text-lg">
              Join our network of businesses supporting innovation in Malaysia
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg">
                  Register Your Business
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/funding/new">
                <Button size="lg" variant="outline">
                  Offer Funding
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

