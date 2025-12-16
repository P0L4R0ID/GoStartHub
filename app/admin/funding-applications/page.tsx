'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ArrowLeft, User, Building2, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function FundingApplicationsPage() {
    const router = useRouter();
    const [applications, setApplications] = useState<any[]>([]);
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    useEffect(() => {
        const session = storage.getSession();
        if (!session || session.role?.toLowerCase() !== 'admin') {
            router.push('/');
            return;
        }
        loadData();
    }, [router]);

    const loadData = () => {
        const apps = storage.getApplications();
        const opps = storage.getFundingOpportunities();
        setApplications(apps);
        setOpportunities(opps);
    };

    const handleApprove = async (appId: string) => {
        const apps = storage.getApplications();
        const index = apps.findIndex(a => a.id === appId);
        if (index !== -1) {
            apps[index].status = 'approved';
            storage.saveApplications(apps);
            loadData();
        }
    };

    const handleReject = async (appId: string) => {
        const apps = storage.getApplications();
        const index = apps.findIndex(a => a.id === appId);
        if (index !== -1) {
            apps[index].status = 'rejected';
            storage.saveApplications(apps);
            loadData();
        }
    };

    const getOpportunity = (oppId: string) => {
        return opportunities.find(o => o.id === oppId);
    };

    const filteredApps = applications.filter(app => {
        if (filter === 'all') return true;
        return app.status === filter;
    });

    return (
        <div className="container mx-auto py-12 px-4 max-w-7xl">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin" className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Admin Dashboard
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Funding Applications</h1>
                <p className="text-muted-foreground">"Review and manage funding applications"</p>
            </div>

            <div className="flex gap-2 mb-6">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                >
                    All ({applications.length})
                </Button>
                <Button
                    variant={filter === 'pending' ? 'default' : 'outline'}
                    onClick={() => setFilter('pending')}
                >
                    Pending ({applications.filter(a => a.status === 'pending').length})
                </Button>
                <Button
                    variant={filter === 'approved' ? 'default' : 'outline'}
                    onClick={() => setFilter('approved')}
                >
                    Approved ({applications.filter(a => a.status === 'approved').length})
                </Button>
                <Button
                    variant={filter === 'rejected' ? 'default' : 'outline'}
                    onClick={() => setFilter('rejected')}
                >
                    Rejected ({applications.filter(a => a.status === 'rejected').length})
                </Button>
            </div>

            <div className="space-y-4">
                {filteredApps.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No applications found.
                        </CardContent>
                    </Card>
                ) : (
                    filteredApps.map((app) => {
                        const opp = getOpportunity(app.opportunityId);
                        return (
                            <Card key={app.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CardTitle className="text-xl">{opp?.title || 'Unknown Opportunity'}</CardTitle>
                                                <Badge
                                                    variant={
                                                        app.status === 'approved'
                                                            ? 'default'
                                                            : app.status === 'rejected'
                                                                ? 'destructive'
                                                                : 'secondary'
                                                    }
                                                >
                                                    {app.status}
                                                </Badge>
                                            </div>
                                            <CardDescription>
                                                Applied: {new Date(app.createdAt).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        {app.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleApprove(app.id)}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleReject(app.id)}
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                        <div>
                                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Applicant Information
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Name:</span>
                                                    <span className="ml-2 font-medium">{app.fullName || app.innovatorName}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Email:</span>
                                                    <span className="ml-2">{app.innovatorEmail}</span>
                                                </div>
                                                {app.phoneNumber && (
                                                    <div>
                                                        <span className="text-muted-foreground">Phone:</span>
                                                        <span className="ml-2">{app.phoneNumber}</span>
                                                    </div>
                                                )}
                                                {app.country && (
                                                    <div>
                                                        <span className="text-muted-foreground">Country:</span>
                                                        <span className="ml-2">{app.country}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {app.hasRegisteredCompany && (
                                            <div>
                                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                                    <Building2 className="h-4 w-4" />
                                                    Company Information
                                                </h3>
                                                <div className="space-y-2 text-sm">
                                                    {app.companyName && (
                                                        <div>
                                                            <span className="text-muted-foreground">Company:</span>
                                                            <span className="ml-2 font-medium">{app.companyName}</span>
                                                        </div>
                                                    )}
                                                    {app.companyStage && (
                                                        <div>
                                                            <span className="text-muted-foreground">Stage:</span>
                                                            <span className="ml-2 capitalize">{app.companyStage}</span>
                                                        </div>
                                                    )}
                                                    {app.hasOfficeInMalaysia && (
                                                        <div>
                                                            <span className="text-muted-foreground">Office in Malaysia:</span>
                                                            <span className="ml-2 capitalize">{app.hasOfficeInMalaysia}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="font-semibold mb-2">Application Message</h3>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                                            {app.message}
                                        </p>
                                    </div>

                                    {app.focusArea && app.focusArea.length > 0 && (
                                        <div className="mb-4">
                                            <h3 className="font-semibold mb-2">Focus Areas</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {app.focusArea.map((area: string) => (
                                                    <Badge key={area} variant="outline">
                                                        {area}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {app.technologyArea && app.technologyArea.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Technology Areas</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {app.technologyArea.map((tech: string) => (
                                                    <Badge key={tech} variant="outline">
                                                        {tech}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
