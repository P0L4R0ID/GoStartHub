'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, CheckCircle, Clock, Bell, LogOut, Rocket, X, Check, Edit } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/storage';

interface MentorshipRequest {
    id: string;
    startup: any;
    status: string;
    initiatedBy: string;
    message: string;
    createdAt: string;
}

interface MentorshipRelationship {
    id: string;
    startup: any;
    status: string;
    startDate: string;
}

export default function MentorDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<MentorshipRequest[]>([]);
    const [relationships, setRelationships] = useState<MentorshipRelationship[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check if user is logged in and has MENTOR role
        const session = storage.getSession();
        if (!session) {
            router.push('/login');
            return;
        }

        // Check role via API
        const checkRole = async () => {
            try {
                const response = await fetch('/api/user/role');
                if (response.ok) {
                    const data = await response.json();
                    if (data.role !== 'MENTOR') {
                        alert('Access denied. Only mentors can access this page.');
                        router.push('/dashboard');
                        return;
                    }
                    setUser({ ...session, role: data.role });
                    fetchData();
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error checking role:', error);
                router.push('/login');
            }
        };

        checkRole();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        try {
            const [requestsRes, relationshipsRes] = await Promise.all([
                fetch('/api/mentor/requests'),
                fetch('/api/mentor/relationships'),
            ]);

            if (requestsRes.ok) {
                const requestsData = await requestsRes.json();
                setRequests(requestsData.requests || []);
            }

            if (relationshipsRes.ok) {
                const relationshipsData = await relationshipsRes.json();
                setRelationships(relationshipsData.relationships || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        // Clear regular user session
        localStorage.removeItem('dreamify_session');
        document.cookie = 'gostarthub_user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.dispatchEvent(new Event('gostarthub:auth-change'));
        router.push('/');
    };

    const handleAccept = async (requestId: string) => {
        setActionLoading(requestId);
        try {
            const response = await fetch(`/api/mentor/requests/${requestId}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response: '' }),
            });

            if (response.ok) {
                // Refresh data
                await fetchData();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to accept request');
            }
        } catch (error) {
            console.error('Error accepting request:', error);
            alert('Failed to accept request');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDecline = async (requestId: string) => {
        setActionLoading(requestId);
        try {
            const response = await fetch(`/api/mentor/requests/${requestId}/decline`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response: '' }),
            });

            if (response.ok) {
                // Refresh data
                await fetchData();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to decline request');
            }
        } catch (error) {
            console.error('Error declining request:', error);
            alert('Failed to decline request');
        } finally {
            setActionLoading(null);
        }
    };

    const pendingRequests = requests.filter(r => r.status === 'PENDING');
    const acceptedRequests = requests.filter(r => r.status === 'ACCEPTED');
    const activeRelationships = relationships.filter(r => r.status === 'ACTIVE');

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
            {/* Header */}
            <header className="bg-white border-b-2 border-orange-200 sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Users className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Mentor Dashboard</h1>
                            <p className="text-xs text-muted-foreground">GoStartHub</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/mentor/profile/edit" className="inline-flex items-center justify-center border border-orange-300 text-orange-700 bg-background hover:bg-accent h-9 px-3 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                        </Link>
                        <Link href="/mentor/discover" className="inline-flex items-center justify-center border border-orange-300 text-orange-700 bg-background hover:bg-accent h-9 px-3 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                            <Rocket className="h-4 w-4 mr-2" />
                            Discover Startups
                        </Link>
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2 gradient-text-blue">Welcome Mentor!</h2>
                    <p className="text-lg text-muted-foreground">
                        Guide the next generation of innovators
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Pending Requests</p>
                                    <p className="text-3xl font-bold text-blue-600">{pendingRequests.length}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Clock className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Active Mentorships</p>
                                    <p className="text-3xl font-bold text-green-600">{activeRelationships.length}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Total Requests</p>
                                    <p className="text-3xl font-bold text-purple-600">{requests.length}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Bell className="h-8 w-8 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Accepted</p>
                                    <p className="text-3xl font-bold text-orange-600">{acceptedRequests.length}</p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <TrendingUp className="h-8 w-8 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Requests */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Pending Requests */}
                        <Card className="border-2 border-orange-200 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-orange-50 to-white border-b-2 border-orange-200">
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                    Pending Requests
                                </CardTitle>
                                <CardDescription>Startups requesting your mentorship</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {loading ? (
                                    <p className="text-center py-8 text-muted-foreground">Loading...</p>
                                ) : pendingRequests.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground mb-4">No pending requests</p>
                                        <Link href="/mentor/discover" className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                            <Rocket className="h-4 w-4 mr-2" />
                                            Discover Startups
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingRequests.map((request) => (
                                            <Card key={request.id} className="hover:border-primary/50 transition-all">
                                                <CardContent className="pt-6">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h3 className="font-semibold text-lg mb-1">
                                                                {request.startup.title}
                                                            </h3>
                                                            <Badge variant="outline" className="mb-2">
                                                                {request.initiatedBy === 'STARTUP' ? 'From Startup' : 'Your Application'}
                                                            </Badge>
                                                            {request.message && (
                                                                <p className="text-sm text-muted-foreground mt-2">
                                                                    "{request.message}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 mt-4">
                                                        <Link href={`/startups/${request.startup.id}`} className="inline-flex items-center justify-center border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                                            View Startup
                                                        </Link>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700"
                                                            onClick={() => handleAccept(request.id)}
                                                            disabled={actionLoading === request.id}
                                                        >
                                                            <Check className="h-4 w-4 mr-1" />
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDecline(request.id)}
                                                            disabled={actionLoading === request.id}
                                                        >
                                                            <X className="h-4 w-4 mr-1" />
                                                            Decline
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Active Mentorships */}
                        <Card className="border-2 border-green-200 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b-2 border-green-200">
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-green-600" />
                                    Active Mentorships
                                </CardTitle>
                                <CardDescription>Ongoing mentor-startup relationships</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {loading ? (
                                    <p className="text-center py-8 text-muted-foreground">Loading...</p>
                                ) : activeRelationships.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">
                                        No active mentorships yet
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {activeRelationships.map((rel) => (
                                            <Link key={rel.id} href={`/mentor/sessions/${rel.id}`}>
                                                <Card className="hover:border-primary transition-all cursor-pointer">
                                                    <CardContent className="pt-6">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="font-semibold text-lg">
                                                                    {rel.startup.title}
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Started {new Date(rel.startDate).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <Badge className="bg-green-500">Active</Badge>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Quick Actions */}
                    <div className="space-y-6">
                        <Card className="border-2 border-indigo-200 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b-2 border-indigo-200">
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    <Link href="/mentor/discover" className="inline-flex items-center justify-center w-full justify-start border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                        <Rocket className="h-4 w-4 mr-2" />
                                        Discover Startups
                                    </Link>
                                    <Link href="/startups" className="inline-flex items-center justify-center w-full justify-start border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Browse All Startups
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                            <CardHeader>
                                <CardTitle className="text-lg">Mentorship Tips</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span>Set clear goals with your mentees</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span>Schedule regular check-ins</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span>Share your experiences and lessons learned</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span>Use the session space for documents and notes</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
