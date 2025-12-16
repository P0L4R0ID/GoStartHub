'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { initializeData, storage } from '@/lib/storage';
import { ArrowRight, Users, DollarSign, Target, TrendingUp, Sparkles, Zap, Rocket, BookOpen, Calendar, Eye, Heart, Award, CheckCircle2, Quote, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const [stats, setStats] = useState({
    totalStartups: 0,
    totalMentors: 0,
    totalFunding: 0,
    totalUsers: 0,
  });
  const [featuredStartups, setFeaturedStartups] = useState<any[]>([]);

  useEffect(() => {
    initializeData();

    // Load statistics
    const startups = storage.getStartups();
    const mentors = storage.getMentors();
    const users = storage.getUsers();
    const totalFunding = startups.reduce((sum: number, s: any) => sum + (s.fundingReceived || 0), 0);

    setStats({
      totalStartups: startups.length,
      totalMentors: mentors.length,
      totalFunding,
      totalUsers: users.length,
    });

    // Get featured startups (top viewed/liked)
    const featured = startups
      .sort((a: any, b: any) => {
        const aScore = (a.views || 0) + (a.likes || 0) * 2;
        const bScore = (b.views || 0) + (b.likes || 0) * 2;
        return bScore - aScore;
      })
      .slice(0, 3);
    setFeaturedStartups(featured);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white min-h-[90vh] flex items-center justify-center">
        {/* GIF Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/homepage-bg.png)',
          }}
          role="img"
          aria-label="Futuristic background animation"
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />

        <div className="container relative z-10 mx-auto px-4 py-32">
          <div className="max-w-5xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 hover:bg-white/20 transition-colors cursor-default">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <span className="text-base font-medium tracking-wide">Platform for Young Innovators</span>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 text-white tracking-tight leading-tight drop-shadow-2xl">
              IDEAS MEET <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">OPPORTUNITY</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-3xl mx-auto leading-relaxed font-light">
              Showcase your prototypes, connect with mentors, and secure funding to turn your ideas into reality.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/startups" className="inline-flex items-center justify-center w-full sm:w-auto text-lg px-10 py-7 h-auto font-bold tracking-wide bg-[#2563EB] hover:bg-[#1E40AF] text-white border-0 shadow-lg transition-colors duration-300 rounded-md">
                Get Started
                <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
              <Link href="/mentors" className="inline-flex items-center justify-center w-full sm:w-auto text-lg px-10 py-7 h-auto font-bold tracking-wide bg-white border border-[#D1D5DB] text-[#374151] hover:bg-gray-100 transition-colors duration-300 rounded-md">
                Find Mentor
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* Featured Startups Section */}


      {/* Features Section */}
      {/* Why Join Go Start Hub? */}
      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700 border-blue-200">Why Choose Go Start Hub?</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text-cyber">Everything You Need to Succeed</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The complete platform for student innovators in Malaysia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="hover-lift transition-all group h-full border-blue-100/50 shadow-sm hover:shadow-md">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg glow-blue">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="gradient-text-blue text-2xl">Showcase Prototypes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  Display your innovative prototypes to potential investors and mentors
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift transition-all group h-full border-blue-100/50 shadow-sm hover:shadow-md">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg glow-blue">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="gradient-text-blue text-2xl">Expert Mentorship</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  Connect with industry experts and experienced mentors
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift transition-all group h-full border-blue-100/50 shadow-sm hover:shadow-md">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg glow-blue">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="gradient-text-blue text-2xl">Funding Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  Access funding from businesses and investors across Malaysia
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift transition-all group h-full border-blue-100/50 shadow-sm hover:shadow-md">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg glow-blue">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="gradient-text-blue text-2xl">Growth Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  Get the support you need to scale from idea to startup
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      {/* How It Works */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-6 px-4 py-1 text-sm bg-purple-100 text-purple-700 border-purple-200">Simple Process</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to kickstart your innovation journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 z-0"></div>

            <Card className="container-card text-center relative z-10 bg-background border-none shadow-none hover:shadow-none">
              <CardHeader className="pb-2">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-blue-100 flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <User className="h-8 w-8" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold mb-2">1. Create Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Sign up as an innovator. Highlight your skills, interests, and university affiliation.
                </p>
              </CardContent>
            </Card>

            <Card className="container-card text-center relative z-10 bg-background border-none shadow-none hover:shadow-none">
              <CardHeader className="pb-2">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-purple-100 flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white">
                    <Zap className="h-8 w-8" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold mb-2">2. Showcase Idea</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Upload your prototype details, images, and documentation to attract attention.
                </p>
              </CardContent>
            </Card>

            <Card className="container-card text-center relative z-10 bg-background border-none shadow-none hover:shadow-none">
              <CardHeader className="pb-2">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-cyan-100 flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <div className="w-16 h-16 rounded-full bg-cyan-600 flex items-center justify-center text-white">
                    <Rocket className="h-8 w-8" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold mb-2">3. Connect & Grow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Connect with mentors, apply for funding, and launch your startup.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Placeholder */}


      {/* Partners Placeholder */}




      {/* CTA Section */}
      {/* CTA Section Removed */}
    </div>
  );
}

