'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, LogOut, Eye, CheckCircle, XCircle, FileText, Loader2, Trash2, Flag } from 'lucide-react';
import { StartupDetailModal } from '@/components/StartupDetailModal';
import { Startup } from '@prisma/client';

export default function AdminStartupsPage() {
    const router = useRouter();
    const [startups, setStartups] = useState<Startup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchStartups();
    }, []);

    const fetchStartups = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/startups');
            if (response.ok) {
                const data = await response.json();
                setStartups(data.startups);
            } else if (response.status === 401) {
                router.push('/admin/login');
            }
        } catch (error) {
            console.error('Failed to fetch startups', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/startups/${id}/approve`, { method: 'POST' });
            if (response.ok) {
                fetchStartups();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Failed to approve startup', error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/startups/${id}/reject`, { method: 'POST' });
            if (response.ok) {
                fetchStartups();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Failed to reject startup', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this startup? This action cannot be undone.')) return;

        try {
            // Use the general startups API for deletion
            const response = await fetch(`/api/startups/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchStartups();
            } else {
                alert('Failed to delete startup');
            }
        } catch (error) {
            console.error('Failed to delete startup', error);
            alert('Error deleting startup');
        }
    };

    const handleFinish = async (id: string) => {
        if (!confirm('Mark this startup as finished? This indicates the project has graduated or completed.')) return;

        try {
            const response = await fetch(`/api/admin/startups/${id}/finish`, { method: 'POST' });
            if (response.ok) {
                fetchStartups();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to mark startup as finished');
            }
        } catch (error) {
            console.error('Failed to mark startup as finished', error);
            alert('Error marking startup as finished');
        }
    };

    const filteredStartups = startups.filter(startup => {
        const matchesSearch = startup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            startup.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || startup.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const pendingCount = startups.filter(s => s.status === 'PENDING').length;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold">GoStartHub Admin</h1>
                        <Badge variant="secondary">v1.0</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">admin@gostarthub.com</span>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/login')}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Startup Submissions</h2>
                        <p className="text-muted-foreground">Manage and review startup submissions.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/admin" className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-9 px-3">
                            ← Back to Admin Dashboard
                        </Link>
                        {pendingCount > 0 && (
                            <Badge variant="destructive" className="h-8 px-3">
                                {pendingCount} Pending Review
                            </Badge>
                        )}
                    </div>
                </div>

                <Tabs defaultValue="all" className="space-y-4" onValueChange={setStatusFilter}>
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <TabsList>
                            <TabsTrigger value="all">All Startups</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="approved">Approved</TabsTrigger>
                            <TabsTrigger value="finished">Finished</TabsTrigger>
                            <TabsTrigger value="rejected">Rejected</TabsTrigger>
                        </TabsList>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search startups..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <TabsContent value="all" className="mt-0">
                        <StartupList
                            startups={filteredStartups}
                            isLoading={isLoading}
                            onView={(startup) => {
                                setSelectedStartup(startup);
                                setIsModalOpen(true);
                            }}
                            onDelete={handleDelete}
                            onFinish={handleFinish}
                        />
                    </TabsContent>
                    <TabsContent value="pending" className="mt-0">
                        <StartupList
                            startups={filteredStartups}
                            isLoading={isLoading}
                            onView={(startup) => {
                                setSelectedStartup(startup);
                                setIsModalOpen(true);
                            }}
                            onDelete={handleDelete}
                            onFinish={handleFinish}
                        />
                    </TabsContent>
                    <TabsContent value="approved" className="mt-0">
                        <StartupList
                            startups={filteredStartups}
                            isLoading={isLoading}
                            onView={(startup) => {
                                setSelectedStartup(startup);
                                setIsModalOpen(true);
                            }}
                            onDelete={handleDelete}
                            onFinish={handleFinish}
                        />
                    </TabsContent>
                    <TabsContent value="finished" className="mt-0">
                        <StartupList
                            startups={filteredStartups}
                            isLoading={isLoading}
                            onView={(startup) => {
                                setSelectedStartup(startup);
                                setIsModalOpen(true);
                            }}
                            onDelete={handleDelete}
                            onFinish={handleFinish}
                        />
                    </TabsContent>
                    <TabsContent value="rejected" className="mt-0">
                        <StartupList
                            startups={filteredStartups}
                            isLoading={isLoading}
                            onView={(startup) => {
                                setSelectedStartup(startup);
                                setIsModalOpen(true);
                            }}
                            onDelete={handleDelete}
                            onFinish={handleFinish}
                        />
                    </TabsContent>
                </Tabs>
            </main>

            <StartupDetailModal
                startup={selectedStartup}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    );
}

function StartupList({ startups, isLoading, onView, onDelete, onFinish }: { startups: Startup[], isLoading: boolean, onView: (s: Startup) => void, onDelete: (id: string) => void, onFinish: (id: string) => void }) {
    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (startups.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                <p className="text-muted-foreground">No startups found.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {startups.map((startup) => (
                <Card key={startup.id} className="hover:bg-gray-50 transition-colors">
                    <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{startup.title}</h3>
                                <StatusBadge status={startup.status} />
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <span>{startup.category}</span>
                                <span>•</span>
                                <span>{startup.stage}</span>
                                <span>•</span>
                                <span>{new Date(startup.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => onView(startup)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                            </Button>
                            {startup.status === 'APPROVED' && (
                                <Button variant="outline" size="sm" className="w-full sm:w-auto text-blue-600 border-blue-600 hover:bg-blue-50" onClick={() => onFinish(startup.id)}>
                                    <Flag className="h-4 w-4 mr-2" />
                                    Mark Finished
                                </Button>
                            )}
                            <Button variant="destructive" size="sm" className="w-full sm:w-auto" onClick={() => onDelete(startup.id)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'APPROVED':
            return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
        case 'FINISHED':
            return <Badge className="bg-blue-500 hover:bg-blue-600">Finished</Badge>;
        case 'ARCHIVED':
            return <Badge className="bg-gray-500 hover:bg-gray-600">Archived</Badge>;
        case 'REJECTED':
            return <Badge variant="destructive">Rejected</Badge>;
        default:
            return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">Pending</Badge>;
    }
}
