'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2, XCircle, Clock, User, Trash2, Briefcase, Globe, Linkedin, Award, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface Application {
    id: string;
    bio: string;
    expertise: string;
    experience: string;
    company: string | null;
    portfolioUrl: string | null;
    availability: string | null;
    mentorType: string | null;
    languages: string | null;
    linkedin: string | null;
    status: string;
    submittedAt: string;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
}

export default function AdminMentorApplicationsPage() {
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [processing, setProcessing] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetchApplications();
    }, [statusFilter]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const url = statusFilter === 'all'
                ? '/api/admin/mentor-applications'
                : `/api/admin/mentor-applications?status=${statusFilter}`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setApplications(data.applications || []);
            } else if (response.status === 403) {
                alert('Access denied. Admin privileges required.');
                router.push('/admin/login');
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Are you sure you want to approve this mentor application?')) {
            return;
        }

        setProcessing(id);
        try {
            const response = await fetch(`/api/admin/mentor-applications/${id}/approve`, {
                method: 'POST',
            });

            if (response.ok) {
                alert('Application approved successfully!');
                fetchApplications();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to approve application');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (id: string) => {
        const notes = prompt('Optional: Add admin notes for rejection');

        setProcessing(id);
        try {
            const response = await fetch(`/api/admin/mentor-applications/${id}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ adminNotes: notes }),
            });

            if (response.ok) {
                alert('Application rejected');
                fetchApplications();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to reject application');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setProcessing(null);
        }
    };

    const handleDelete = async (id: string, userName: string) => {
        if (!confirm(`Are you sure you want to permanently delete the mentor application for ${userName}? This will also remove their mentor role and profile.`)) {
            return;
        }

        setProcessing(id);
        try {
            const response = await fetch(`/api/admin/mentor-applications/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Mentor application and profile deleted successfully!');
                fetchApplications();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete mentor');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setProcessing(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'APPROVED':
                return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
            case 'REJECTED':
                return <Badge variant="outline" className="bg-red-50 text-red-700"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const parseExpertise = (expertise: string) => {
        try {
            const parsed = JSON.parse(expertise);
            return Array.isArray(parsed) ? parsed : [expertise];
        } catch {
            return expertise.split(',').map(e => e.trim());
        }
    };

    const parseLanguages = (languages: string | null) => {
        if (!languages) return [];
        try {
            const parsed = JSON.parse(languages);
            return Array.isArray(parsed) ? parsed : [languages];
        } catch {
            return languages.split(',').map(l => l.trim());
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/admin" className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-9 px-3">
                        ← Back to Admin Dashboard
                    </Link>
                </div>
                <h1 className="text-3xl font-bold mb-2">Mentor Applications</h1>
                <p className="text-muted-foreground">Review and manage mentor applications</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Applications</CardTitle>
                            <CardDescription>Filter and review mentor applications</CardDescription>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="all">All</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No applications found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applications.map((app) => {
                                const expertiseList = parseExpertise(app.expertise);
                                const languageList = parseLanguages(app.languages);
                                const isExpanded = expandedId === app.id;

                                return (
                                    <div key={app.id} className="border rounded-lg p-4 hover:bg-slate-50/50 transition-colors">
                                        {/* Header Row */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                                    {app.user.name?.charAt(0) || 'A'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-semibold text-lg">{app.user.name || 'Anonymous'}</h3>
                                                        {getStatusBadge(app.status)}
                                                        {app.mentorType && (
                                                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                                                                <Award className="h-3 w-3 mr-1" />
                                                                {app.mentorType}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{app.user.email}</p>
                                                    {app.company && (
                                                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                            <Briefcase className="h-3 w-3" /> {app.company}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2 text-sm">
                                                        <span className="font-medium">{app.experience} years experience</span>
                                                        {app.availability && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {app.availability}
                                                            </Badge>
                                                        )}
                                                        {app.linkedin && (
                                                            <a href={app.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#0077b5] hover:underline flex items-center gap-1">
                                                                <Linkedin className="h-4 w-4" /> LinkedIn
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {app.status === 'PENDING' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-green-600 border-green-600 hover:bg-green-50"
                                                            onClick={() => handleApprove(app.id)}
                                                            disabled={processing === app.id}
                                                        >
                                                            {processing === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Approve'}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 border-red-600 hover:bg-red-50"
                                                            onClick={() => handleReject(app.id)}
                                                            disabled={processing === app.id}
                                                        >
                                                            {processing === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Reject'}
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(app.id, app.user.name || 'this applicant')}
                                                    disabled={processing === app.id}
                                                    title="Delete mentor application"
                                                >
                                                    {processing === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                                                >
                                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Expandable Details */}
                                        {isExpanded && (
                                            <div className="mt-4 pt-4 border-t space-y-4">
                                                {/* Bio */}
                                                <div>
                                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Professional Bio</h4>
                                                    <p className="text-sm whitespace-pre-wrap">{app.bio}</p>
                                                </div>

                                                {/* Expertise */}
                                                <div>
                                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Areas of Expertise</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {expertiseList.map((exp, idx) => (
                                                            <Badge key={idx} variant="outline">{exp}</Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Languages */}
                                                {languageList.length > 0 && (
                                                    <div>
                                                        <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                                            <Globe className="h-4 w-4" /> Languages
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {languageList.map((lang, idx) => (
                                                                <Badge key={idx} variant="secondary">{lang}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Submitted Date */}
                                                <p className="text-xs text-muted-foreground">
                                                    Submitted on {new Date(app.submittedAt).toLocaleDateString()} at {new Date(app.submittedAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
