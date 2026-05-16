'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, TrendingUp, Building2, GraduationCap, User as UserIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Startup {
    id: string;
    title: string;
    description: string;
    category: string;
    stage: string;
    projectType: string;
    contactEmail: string;
    innovator?: {
        name: string;
        email: string;
    };
}

export default function MentorDiscoverPage() {
    const router = useRouter();
    const [startups, setStartups] = useState<Startup[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stageFilter, setStageFilter] = useState('all');
    const [projectTypeFilter, setProjectTypeFilter] = useState('all');
    const [applyingTo, setApplyingTo] = useState<string | null>(null);

    useEffect(() => {
        fetchStartups();
    }, [categoryFilter, stageFilter, projectTypeFilter]);

    const fetchStartups = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (categoryFilter !== 'all') params.append('category', categoryFilter);
            if (stageFilter !== 'all') params.append('stage', stageFilter);
            if (projectTypeFilter !== 'all') params.append('projectType', projectTypeFilter);

            const response = await fetch(`/api/mentor/startups?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setStartups(data.startups || []);
            }
        } catch (error) {
            console.error('Error fetching startups:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (startupId: string) => {
        setApplyingTo(startupId);
        try {
            const response = await fetch('/api/mentor/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    startupId,
                    message: 'I would like to mentor your startup and share my expertise.',
                }),
            });

            if (response.ok) {
                alert('Application sent successfully!');
                // Refresh startups to update UI
                fetchStartups();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to apply');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setApplyingTo(null);
        }
    };

    const filteredStartups = startups.filter(startup =>
        startup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        startup.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
            {/* Header */}
            <header className="bg-white border-b-2 border-orange-200 sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/mentor/dashboard">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Mentor Dashboard
                            </Button>
                        </Link>
                    </div>
                    <h1 className="text-xl font-bold">Discover Startups</h1>
                    <div className="w-32"></div> {/* Spacer for centering */}
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Search and Filters */}
                <Card className="mb-8 border-2 border-blue-200">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b-2 border-blue-200">
                        <CardTitle>Find Startups to Mentor</CardTitle>
                        <CardDescription>Browse approved startups looking for guidance</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search startups..."
                                    className="pl-10 border-2"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="border-2">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="Technology">Technology</SelectItem>
                                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                                    <SelectItem value="Education">Education</SelectItem>
                                    <SelectItem value="Fintech">Fintech</SelectItem>
                                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={stageFilter} onValueChange={setStageFilter}>
                                <SelectTrigger className="border-2">
                                    <SelectValue placeholder="Stage" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Stages</SelectItem>
                                    <SelectItem value="Idea">Idea</SelectItem>
                                    <SelectItem value="MVP">MVP</SelectItem>
                                    <SelectItem value="Seed">Seed</SelectItem>
                                    <SelectItem value="Growth">Growth</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={projectTypeFilter} onValueChange={setProjectTypeFilter}>
                                <SelectTrigger className="border-2">
                                    <SelectValue placeholder="Project Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="University">University</SelectItem>
                                    <SelectItem value="Individual">Individual</SelectItem>
                                    <SelectItem value="Company">Company</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                {loading ? (
                    <p className="text-center py-12 text-muted-foreground">Loading startups...</p>
                ) : filteredStartups.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No startups found matching your criteria</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStartups.map((startup) => (
                            <Card key={startup.id} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <CardTitle className="text-lg line-clamp-2">{startup.title}</CardTitle>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            {startup.category}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            {startup.stage}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {startup.projectType === 'University' ? (
                                                <><GraduationCap className="h-3 w-3 mr-1" /> University</>
                                            ) : startup.projectType === 'Company' ? (
                                                <><Building2 className="h-3 w-3 mr-1" /> Company</>
                                            ) : (
                                                <><UserIcon className="h-3 w-3 mr-1" /> Individual</>
                                            )}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                        {startup.description}
                                    </p>
                                    {startup.innovator && (
                                        <p className="text-xs text-muted-foreground mb-4">
                                            By: {startup.innovator.name}
                                        </p>
                                    )}
                                    <div className="flex gap-2">
                                        <Link href={`/startups/${startup.id}`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full">
                                                View Details
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                                            onClick={() => handleApply(startup.id)}
                                            disabled={applyingTo === startup.id}
                                        >
                                            {applyingTo === startup.id ? 'Applying...' : 'Apply to Mentor'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
