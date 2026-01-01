'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { storage, initializeData } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, DollarSign, Users, ArrowRight, MessageSquare, FileText, Calendar, BookOpen, Crown, Zap, Bell, BarChart3, Archive } from 'lucide-react';
import Link from 'next/link';
import { getSubscriptionUsage } from '@/lib/subscription';
import NotificationCenter from '@/components/NotificationCenter';
import ActivityFeed from '@/components/ActivityFeed';

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [startups, setStartups] = useState<any[]>([]);
  const [archivedStartups, setArchivedStartups] = useState<any[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<any[]>([]);
  const [activeMentorships, setActiveMentorships] = useState<any[]>([]);
  const [fundingApplications, setFundingApplications] = useState<any[]>([]);
  const [programmeRegistrations, setProgrammeRegistrations] = useState<any[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStartups: 0,
    totalFunding: 0,
    totalMentors: 0,
    activeProjects: 0,
  });

  useEffect(() => {
    setMounted(true);
    const session = storage.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUser(session);

    // Initialize demo data if it's the demo user
    if (session.id === 'demo-user' || session.email === 'demo@gostarthub.com') {
      initializeData();
    }

    // Fetch all data in parallel for better performance
    const fetchAllData = async () => {
      try {
        // Parallel API calls for better performance
        const [startupsRes, requestsRes, mentorshipsRes, fundingAppsRes] = await Promise.all([
          fetch(`/api/startups?status=all&innovatorId=${session.id}`, { cache: 'no-store' }),
          fetch('/api/user/mentorship-requests', { cache: 'no-store' }),
          fetch('/api/user/mentorships', { cache: 'no-store' }),
          fetch(`/api/funding-applications?innovatorId=${session.id}`, { cache: 'no-store' }),
        ]);

        // Process startups
        if (startupsRes.ok) {
          const data = await startupsRes.json();
          const allStartups = data.startups.map((s: any) => ({
            ...s,
            fundingReceived: s.fundingReceived || 0,
            fundingNeeded: s.fundingNeeded || 0,
            projectType: s.projectType || 'individual'
          }));

          // Separate active from archived/finished
          const activeStartups = allStartups.filter((s: any) =>
            s.status !== 'FINISHED' && s.status !== 'ARCHIVED'
          );
          const finishedStartups = allStartups.filter((s: any) =>
            s.status === 'FINISHED' || s.status === 'ARCHIVED'
          );

          setStartups(activeStartups);
          setArchivedStartups(finishedStartups);
          setStats(prev => ({
            ...prev,
            totalStartups: allStartups.length,
            totalFunding: allStartups.reduce((acc: any, curr: any) => acc + (curr.fundingReceived || 0), 0),
            activeProjects: activeStartups.filter((s: any) => s.status === 'active' || s.status === 'APPROVED').length
          }));
        }

        // Process mentorship requests
        if (requestsRes.ok) {
          const data = await requestsRes.json();
          setMentorshipRequests(data.requests || []);
        }

        // Process active mentorships
        if (mentorshipsRes.ok) {
          const data = await mentorshipsRes.json();
          setActiveMentorships(data.relationships || []);
        }

        // Process funding applications from database
        if (fundingAppsRes.ok) {
          const data = await fundingAppsRes.json();
          setFundingApplications(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchAllData();

    // Load local storage data synchronously (fast) - only for programmes and events
    const allProgrammeRegs = storage.getProgrammeRegistrations();
    const userProgrammeRegs = allProgrammeRegs.filter((reg: any) => reg.innovatorId === session.id);
    setProgrammeRegistrations(userProgrammeRegs);

    const allEventRegs = storage.getEventRegistrations();
    const userEventRegs = allEventRegs.filter((reg: any) => reg.attendeeId === session.id);
    setEventRegistrations(userEventRegs);
  }, [router]);

  // Memoize computed stats to avoid recalculation on every render
  const userStats = useMemo(() => ({
    myStartups: startups.length,
    myFunding: startups.reduce((sum: number, s: any) => sum + (s.fundingReceived || 0), 0),
    activeApplications: fundingApplications.filter((a: any) => a.status === 'PENDING').length,
    activeMentorships: activeMentorships.length,
  }), [startups, fundingApplications, activeMentorships, mentorshipRequests]);

  // Memoize subscription usage
  const subscriptionUsage = useMemo(() =>
    user ? getSubscriptionUsage(user.id) : null
    , [user]);

  // Handle archiving a startup
  const handleArchiveStartup = async (startupId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();

    if (!confirm('Archive this startup? It will be hidden from public view.')) return;

    try {
      const response = await fetch(`/api/user/startups/${startupId}/archive`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh startups list
        const res = await fetch(`/api/startups?status=all&innovatorId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setStartups(data.startups.map((s: any) => ({
            ...s,
            fundingReceived: s.fundingReceived || 0,
            fundingNeeded: s.fundingNeeded || 0,
            projectType: s.projectType || 'individual'
          })));
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to archive startup');
      }
    } catch (error) {
      console.error('Error archiving startup:', error);
      alert('Error archiving startup');
    }
  };

  if (!mounted) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Welcome back, {user.name}!
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your startups and track your innovation journey
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              className="relative rounded-full w-10 h-10 p-0 border-gray-200 hover:bg-white hover:text-blue-600 hover:border-blue-200 shadow-sm"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {user && storage.getNotifications(user.id).filter((n: any) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
              )}
            </Button>
            <Link href="/subscription" className="inline-flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200/50 px-6 h-10 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Crown className="mr-2 h-4 w-4" />
              Subscription
            </Link>
          </div>
        </div>

        {/* Notification Center */}
        {showNotifications && user && (
          <div className="mb-8 animate-in slide-in-from-top-4 duration-200">
            <NotificationCenter userId={user.id} onClose={() => setShowNotifications(false)} />
          </div>
        )}

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* My Startups - Blue */}
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">My Startups</p>
                <h3 className="text-3xl font-bold text-blue-600">{userStats.myStartups}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {/* My Funding - Green */}
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">My Funding</p>
                <h3 className="text-3xl font-bold text-green-600">RM {userStats.myFunding.toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          {/* Applications - Purple */}
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Applications</p>
                <h3 className="text-3xl font-bold text-purple-600">{userStats.activeApplications}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          {/* Mentorships - Orange */}
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Mentorships</p>
                <h3 className="text-3xl font-bold text-orange-600">{userStats.activeMentorships}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Column (Startups & Projects) */}
          <div className="lg:col-span-2 space-y-8">

            {/* My Startups Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  My Startups
                  <Badge variant="secondary" className="rounded-full px-2 text-blue-600 bg-blue-50">{startups.length}</Badge>
                </h2>
                <div className="flex gap-2">
                  <Link href="/submit-startup" className="inline-flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 h-9 px-3 text-sm font-medium text-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <Plus className="h-4 w-4 mr-1" /> New Project
                  </Link>
                  <Link href="/startups?filter=my" className="inline-flex items-center justify-center h-9 px-3 text-sm font-medium text-muted-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    View All
                  </Link>
                </div>
              </div>

              {startups.length > 0 ? (
                <div className="space-y-4">
                  {startups.map((startup) => (
                    <Card key={startup.id} className="border-none shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Link href={`/startups/${startup.id}`}>
                                <h3 className="font-bold text-lg hover:text-blue-600 transition-colors">{startup.title}</h3>
                              </Link>
                              <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-medium border-none
                                ${startup.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                  startup.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'}`}>
                                {startup.status === 'APPROVED' ? 'Active' : startup.status}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">{startup.description}</p>

                            <div className="space-y-2">
                              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                <span>RM {startup.fundingReceived.toLocaleString()} raised</span>
                                <span>{Math.round((startup.fundingReceived / startup.fundingNeeded) * 100)}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                                  style={{ width: `${Math.min((startup.fundingReceived / startup.fundingNeeded) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col justify-between items-end gap-2 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-4 min-w-[120px]">
                            <div className="flex flex-col gap-1 w-full">
                              <span className="text-xs text-muted-foreground">Stage</span>
                              <span className="text-sm font-medium capitalize">{startup.stage}</span>
                            </div>
                            {startup.status === 'APPROVED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50 w-full justify-start sm:justify-end px-0"
                                onClick={(e) => handleArchiveStartup(startup.id, e)}
                              >
                                <Archive className="h-3 w-3 mr-1" />
                                Archive
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 bg-gray-50/50">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <Plus className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No startups yet</h3>
                    <p className="text-muted-foreground text-sm mb-4 max-w-sm">Start your innovation journey by creating your first project.</p>
                    <Link href="/submit-startup" className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      Create Startup
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Archived Projects */}
            {archivedStartups.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-muted-foreground">
                  <Archive className="h-5 w-5" />
                  Archived Projects
                </h2>
                <div className="opacity-75 hover:opacity-100 transition-opacity">
                  {archivedStartups.map((startup) => (
                    <div key={startup.id} className="bg-white border rounded-lg p-4 mb-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-700">{startup.title}</h4>
                        <p className="text-xs text-muted-foreground">Ended with RM {startup.fundingReceived.toLocaleString()}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">Finished</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Funding Stats & List */}
            {fundingApplications.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold mb-4">Funding Applications</h3>
                  <div className="space-y-3">
                    {fundingApplications.slice(0, 4).map((app) => (
                      <div key={app.id} className="bg-white p-3 rounded-lg border shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${app.status === 'APPROVED' ? 'bg-green-500' : app.status === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                          <span className="text-sm font-medium">{app.opportunity?.title || `Application #${app.id.slice(-4)}`}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs capitalize">{app.status?.toLowerCase()}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {user.role === 'innovator' && programmeRegistrations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Programme Applications</h3>
                    <div className="space-y-3">
                      {programmeRegistrations.slice(0, 4).map((reg) => (
                        <div key={reg.id} className="bg-white p-3 rounded-lg border shadow-sm flex items-center justify-between">
                          <span className="text-sm font-medium truncate max-w-[150px]">Programme #{reg.id.slice(-4)}</span>
                          <Badge variant="outline" className="text-xs capitalize">{reg.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">

            {/* Active Mentorships */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Active Mentorships</h3>
                <span className="text-xs font-semibold px-2 py-1 bg-orange-100 text-orange-700 rounded-full">{activeMentorships.length}</span>
              </div>

              {activeMentorships.length > 0 ? (
                <div className="space-y-6">
                  {activeMentorships.map((m) => (
                    <div key={m.id} className="flex gap-4 items-start group">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                        {m.mentor?.name?.charAt(0) || 'M'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold truncate">{m.mentor?.name}</h4>
                        <p className="text-xs text-muted-foreground truncate mb-2">{m.startup?.title}</p>
                        <Link href={`/dashboard/sessions/${m.id}`} className="inline-flex items-center justify-center border border-input bg-background hover:border-orange-200 hover:text-orange-700 hover:bg-orange-50 h-7 text-xs w-full rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                          View Sessions
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex h-12 w-12 rounded-full bg-orange-50 text-orange-400 items-center justify-center mb-3">
                    <Users className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-muted-foreground">No active mentors yet.</p>
                </div>
              )}
            </div>

            {/* Incoming Requests */}
            {mentorshipRequests.filter(r => r.initiatedBy === 'MENTOR').length > 0 && (
              <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
                <h3 className="font-bold text-lg mb-4">Incoming Offers</h3>

                <div className="space-y-3">
                  {mentorshipRequests.filter(r => r.initiatedBy === 'MENTOR').map((req) => (
                    <div key={req.id} className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold">{req.mentor?.name}</span>
                        <Badge className="text-[10px] h-5 px-1.5" variant={req.status === 'PENDING' ? 'default' : 'secondary'}>{req.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{req.message || "Wants to mentor your startup."}</p>

                      {req.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="h-7 flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                            onClick={async (e) => {
                              e.preventDefault();
                              try {
                                await fetch(`/api/mentor/requests/${req.id}/accept`, { method: 'POST' });
                                window.location.reload();
                              } catch (err) { }
                            }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm" variant="outline"
                            className="h-7 flex-1 text-xs"
                            onClick={async (e) => {
                              e.preventDefault();
                              try {
                                await fetch(`/api/mentor/requests/${req.id}/decline`, { method: 'POST' });
                                window.location.reload();
                              } catch (err) { }
                            }}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outgoing Requests */}
            {mentorshipRequests.filter(r => r.initiatedBy === 'STARTUP').length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4">Sent Requests</h3>
                <div className="space-y-3">
                  {mentorshipRequests.filter(r => r.initiatedBy === 'STARTUP').slice(0, 3).map((req) => (
                    <div key={req.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                      <span>{req.mentor?.name || 'Mentor'}</span>
                      <Badge variant="outline" className="text-xs">{req.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 border-none text-white shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Need Guidance?</h3>
                <p className="text-indigo-100 text-sm mb-4">Find expert mentors to help accelerate your startup journey.</p>
                <Link href="/mentors" className="inline-flex items-center justify-center rounded-md bg-white text-indigo-700 hover:bg-indigo-50 font-semibold h-10 px-4 py-2 w-full text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  Browse Mentors
                </Link>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
