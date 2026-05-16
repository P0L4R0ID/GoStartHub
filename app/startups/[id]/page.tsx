'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { Startup } from '@/types';
import { ExternalLink, ArrowRight, Star, Clock, Building2, TrendingUp, CheckCircle2, Share2, Heart, Play, Users, MapPin, Calendar, Globe, Mail, Linkedin, ArrowLeft, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CommentsSection from '@/components/CommentsSection';
import StartupNewsSection from '@/components/startup/StartupNewsSection';

export default function StartupDetailPage() {
  const params = useParams();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState<any>(null); // Add user state
  const [isInnovator, setIsInnovator] = useState(false); // Add isInnovator state
  const [viewsIncremented, setViewsIncremented] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Fetch Session
    const session = storage.getSession();
    setUser(session);

    const fetchStartup = async () => {
      const startups = storage.getStartups();
      const found = startups.find((s: Startup) => s.id === params.id);

      // Check Innovator Status (Simple check: if current user ID matches startup innovator ID, or logic from API)
      // For now, we rely on the API response or generic check if using LS

      if (found) {
        if (!viewsIncremented) {
          const updatedViews = (found.views || 0) + 1;
          const updatedStartup = { ...found, views: updatedViews };
          const updatedStartups = startups.map((s: Startup) =>
            s.id === params.id ? updatedStartup : s
          );
          storage.saveStartups(updatedStartups);
          setStartup(updatedStartup);
          setViewsIncremented(true);
        } else {
          setStartup(found);
        }
        // Local check for innovator (mock)
        if (session?.user?.id === found.innovatorId) {
          setIsInnovator(true);
        }
      } else {
        // Fetch from API
        try {
          const response = await fetch(`/api/startups/${params.id}`);
          if (response.ok) {
            const data = await response.json();

            // Set isInnovator from API response if available, or compare logic
            if (data.isInnovator) {
              setIsInnovator(true);
            } else if (session?.user?.id === data.innovatorId) {
              setIsInnovator(true);
            }

            // Map DB data to frontend Startup type
            const team = data.teamMembers || [];
            const innovatorName = team.length > 0 ? team[0].name : 'Unknown Innovator';

            const mappedStartup: Startup = {
              id: data.id,
              title: data.title,
              description: data.description,
              category: data.category,
              stage: data.stage,
              projectType: data.projectType.toLowerCase(),
              companyName: data.companyName,
              university: data.university,
              innovatorName: innovatorName,
              innovatorId: 'db-user',
              views: data.views,
              likes: data.likes,
              images: ['/images/Gemini_Generated_Image_o6zpnko6zpnko6zp.png'],
              image: '/images/Gemini_Generated_Image_o6zpnko6zpnko6zp.png',
              tags: [data.category, data.stage],
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              status: 'active',
              pitchPdf: data.pitchDeck,
              team: {
                founders: team,
                totalFounders: team.length,
                companySize: data.companySize || '1-10',
              },
              profile: {
                generalInfo: { description: data.description },
                contactInfo: {
                  email: data.contactEmail,
                  url: data.contactWebsite,
                  phone: data.contactPhone
                }
              },
              fundingReceived: data.fundingReceived || 0,
              fundingNeeded: data.fundingNeeded || 1000000, // Default target if missing

              // Mapped fields
              logo: data.logo,
              bannerImage: data.bannerImage,
              problem: data.problem,
              solution: data.solution,
              targetCustomers: data.targetCustomers,
              demoVideoUrl: data.demoVideoUrl,
              // Financials
              financials: {
                totalDeals: data.totalDeals,
                totalInvestors: data.totalInvestors,
                totalFundraised: data.totalFundraised,
                latestValuation: data.latestValuation,
              }
            };
            setStartup(mappedStartup);
          } else {
            setStartup(null);
          }
        } catch (error) {
          console.error("Error fetching startup:", error);
          setStartup(null);
        }
      }
    };

    fetchStartup();

    // Check if liked
    const likedStartups = JSON.parse(localStorage.getItem('liked_startups') || '[]');
    setIsLiked(likedStartups.includes(params.id));
  }, [params.id, viewsIncremented]);

  const handleLike = () => {
    if (!startup) return;
    const startups = storage.getStartups();
    const likedStartups = JSON.parse(localStorage.getItem('liked_startups') || '[]');

    if (isLiked) {
      const updatedLikes = Math.max((startup.likes || 0) - 1, 0);
      const updatedStartup = { ...startup, likes: updatedLikes };
      const updatedStartups = startups.map((s: Startup) => s.id === params.id ? updatedStartup : s);
      storage.saveStartups(updatedStartups);
      setStartup(updatedStartup);
      setIsLiked(false);
      localStorage.setItem('liked_startups', JSON.stringify(likedStartups.filter((id: string) => id !== params.id)));
    } else {
      const updatedLikes = (startup.likes || 0) + 1;
      const updatedStartup = { ...startup, likes: updatedLikes };
      const updatedStartups = startups.map((s: Startup) => s.id === params.id ? updatedStartup : s);
      storage.saveStartups(updatedStartups);
      setStartup(updatedStartup);
      setIsLiked(true);
      localStorage.setItem('liked_startups', JSON.stringify([...likedStartups, params.id]));
    }
  };

  const formatCurrency = (val: number | string) => {
    if (typeof val === 'string') return val; // Assume already formatted if string
    if (!val) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  if (!startup) {
    return (
      <div className="min-h-screen py-20 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500">Loading startup details...</p>
      </div>
    );
  }

  // Calculate progress
  const fundingReceived = startup.fundingReceived || 0;
  const fundingTarget = startup.fundingNeeded || 1000000;
  const progressPercent = Math.min(Math.round((fundingReceived / fundingTarget) * 100), 100);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">

      {/* Immersive Hero Banner */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10"></div>
        {startup.bannerImage ? (
          <img src={startup.bannerImage} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <span className="text-6xl font-bold text-white/5">{startup.title}</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 z-20 container mx-auto px-4 pb-8 md:pb-12">
          <div className="flex flex-col md:flex-row items-end gap-6">
            {/* Logo Card */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white p-2 shadow-2xl shadow-black/20 flex-shrink-0 relative -mb-16 md:mb-0 ring-4 ring-white/10 backdrop-blur-sm flex items-center justify-center">
              {startup.logo ? (
                <img src={startup.logo} alt="Logo" className="w-full h-full object-contain rounded-xl" />
              ) : (
                <Building2 className="w-12 h-12 text-slate-300" />
              )}
            </div>

            <div className="flex-1 text-white mb-2 md:mb-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none">{startup.category}</Badge>
                <Badge variant="outline" className="text-white border-white/30 backdrop-blur-md bg-white/10 capitalize">{startup.stage}</Badge>
                {((startup.views || 0) > 200) && (
                  <Badge variant="default" className="bg-orange-500 hover:bg-orange-600 border-none">
                    <TrendingUp className="h-3 w-3 mr-1" /> Trending
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 text-shadow-lg">{startup.title}</h1>
              <p className="text-lg text-slate-200 max-w-2xl font-light line-clamp-1">{startup.description}</p>
            </div>

            <div className="flex gap-3 mb-1">
              <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 backdrop-blur-md" onClick={handleLike}>
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-24 md:pt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Tabs Navigation */}
          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start bg-transparent border-b border-slate-200 rounded-none h-auto p-0 mb-6 gap-6 overflow-x-auto">
              {['Overview', 'Team', 'Financials', 'Pitch', 'News', 'Discussion'].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab.toLowerCase()}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-0 py-3 text-base font-medium text-slate-500 hover:text-slate-800 transition-colors bg-transparent shadow-none"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* About Section */}
              <section className="prose prose-slate max-w-none">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">About {startup.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {startup.profile?.generalInfo?.description || startup.description}
                </p>

                {(startup.problem || startup.solution) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {startup.problem && (
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-4">
                          <span className="text-red-600 font-bold">P</span>
                        </div>
                        <h4 className="font-bold text-slate-900 mb-2">The Problem</h4>
                        <p className="text-slate-600 text-sm">{startup.problem}</p>
                      </div>
                    )}
                    {startup.solution && (
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                          <span className="text-emerald-600 font-bold">S</span>
                        </div>
                        <h4 className="font-bold text-slate-900 mb-2">The Solution</h4>
                        <p className="text-slate-600 text-sm">{startup.solution}</p>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Video Section */}
              {startup.demoVideoUrl && (
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-xl group cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  </div>
                  {/* Placeholder for video thumbnail - normally would try to fetch or use default */}
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <span className="text-white font-medium">Video Demo Available</span>
                  </div>
                  <a href={startup.demoVideoUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-50"></a>
                </div>
              )}

              {/* Target Customers */}
              {startup.targetCustomers && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                  <h4 className="text-blue-900 font-bold flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" /> Target Customers
                  </h4>
                  <p className="text-blue-800">{startup.targetCustomers}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Meet the Team</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {startup.team?.founders && startup.team.founders.map((founder, idx) => (
                  <Card key={idx} className="border-0 shadow-sm bg-white ring-1 ring-slate-100">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{founder.name}</h4>
                        <p className="text-sm text-slate-500">{founder.role}</p>
                        {founder.linkedin && (
                          <a href={founder.linkedin} target="_blank" className="text-blue-600 text-xs mt-1 inline-block hover:underline">LinkedIn Profile</a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {startup.team?.companySize && (
                <div className="text-slate-600 mt-4">
                  <strong>Company Size:</strong> {startup.team.companySize} employees
                </div>
              )}
            </TabsContent>

            <TabsContent value="financials" className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Financial Overview</h3>

              <div className="grid grid-cols-2 gap-4">
                {startup.financials?.totalFundraised && (
                  <Card className="bg-white border-slate-100 shadow-sm">
                    <CardContent className="p-6">
                      <div className="text-sm text-slate-500 uppercase font-bold mb-1">Total Fundraised</div>
                      <div className="text-2xl font-bold text-slate-900">{startup.financials.totalFundraised}</div>
                    </CardContent>
                  </Card>
                )}
                {startup.financials?.latestValuation && (
                  <Card className="bg-white border-slate-100 shadow-sm">
                    <CardContent className="p-6">
                      <div className="text-sm text-slate-500 uppercase font-bold mb-1">Valuation</div>
                      <div className="text-2xl font-bold text-green-600">{startup.financials.latestValuation}</div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Charts Integration - Preserving Recharts */}
              {startup.financials?.latestValuation && startup.financials.totalFundraised && (
                <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <h3 className="text-sm font-semibold mb-6 text-slate-500 uppercase">Valuation vs Fundraising</h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={[
                          { name: 'Fundraised', value: parseFloat(startup.financials.totalFundraised.toString().replace(/[^\d.]/g, '')) || 0 },
                          { name: 'Valuation', value: parseFloat(startup.financials.latestValuation.toString().replace(/[^\d.]/g, '')) || 0 },
                        ]}
                        margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                        <Tooltip cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pitch" className="space-y-6">
              {startup.pitchPdf ? (
                <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Pitch Deck</h4>
                      <p className="text-sm text-slate-500">PDF Document</p>
                    </div>
                  </div>
                  <a href={startup.pitchPdf} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">View Deck</Button>
                  </a>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-100 rounded-xl border border-dashed border-slate-300">
                  <p className="text-slate-500">No pitch deck uploaded yet.</p>
                </div>
              )}
            </TabsContent>

            {/* News Tab */}
            <TabsContent value="news" className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Latest Updates</h3>
              <StartupNewsSection startupId={startup.id} isInnovator={isInnovator} />
            </TabsContent>

            {/* Discussion Tab (Comments) */}
            <TabsContent value="discussion" className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Discussion</h3>
              <CommentsSection startupId={startup.id} userId={user?.id} userName={user?.name} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sticky Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">

            {/* Funding Card Removed */}

            {/* Startup Info */}
            <Card className="border-0 shadow-md bg-white/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-100">
              <CardContent className="p-6 space-y-4">
                {startup.profile?.contactInfo?.url && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Globe className="w-5 h-5 text-slate-400" />
                    <a href={startup.profile.contactInfo.url} target="_blank" className="text-blue-600 hover:underline truncate">
                      Website
                    </a>
                  </div>
                )}
                {startup.university && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    <span>{startup.university}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <span>Joined {new Date(startup.createdAt).getFullYear()}</span>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Founders</h4>
                  <div className="space-y-3">
                    {startup.team?.founders && startup.team.founders.slice(0, 3).map((member, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-500">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{member.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>

      </div>
    </div>
  );
}
