'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Users, Ban, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Mentor {
    id: string;
    name: string | null;
    email: string;
    bio: string | null;
    company: string | null;
    expertise: string | null;
    isDisabled: boolean;
    createdAt: string;
    _count: {
        mentorshipsAsMentor: number;
    };
}

export default function AdminMentorsPage() {
    const router = useRouter();
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchMentors();
    }, []);

    const fetchMentors = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/mentors');
            if (response.ok) {
                const data = await response.json();
                setMentors(data.mentors || []);
            } else if (response.status === 401) {
                router.push('/admin/login');
            }
        } catch (error) {
            console.error('Error fetching mentors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDisable = async (id: string, currentStatus: boolean) => {
        const action = currentStatus ? 'enable' : 'disable';
        if (!confirm(`Are you sure you want to ${action} this mentor?`)) return;

        setProcessing(id);
        try {
            const response = await fetch(`/api/admin/mentors/${id}/disable`, {
                method: 'POST',
            });

            if (response.ok) {
                fetchMentors();
            } else {
                const data = await response.json();
                alert(data.error || `Failed to ${action} mentor`);
            }
        } catch (error) {
            console.error(`Error ${action}ing mentor:`, error);
            alert(`Error ${action}ing mentor`);
        } finally {
            setProcessing(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this mentor? This action cannot be undone and will remove all their data.')) return;

        setProcessing(id);
        try {
            const response = await fetch(`/api/admin/mentors/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchMentors();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete mentor');
            }
        } catch (error) {
            console.error('Error deleting mentor:', error);
            alert('Error deleting mentor');
        } finally {
            setProcessing(null);
        }
    };

    const parseExpertise = (expertise: string | null) => {
        if (!expertise) return 'N/A';
        try {
            const parsed = JSON.parse(expertise);
            return Array.isArray(parsed) ? parsed.join(', ') : expertise;
        } catch {
            return expertise;
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Mentor Management</h1>
                        <p className="text-muted-foreground">Manage approved mentors - disable or delete accounts</p>
                    </div>
                    <Link href="/admin" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                        ← Back to Admin Dashboard
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <CardTitle>Approved Mentors</CardTitle>
                    </div>
                    <CardDescription>
                        {mentors.length} mentor{mentors.length !== 1 ? 's' : ''} registered
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : mentors.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No mentors found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mentor</TableHead>
                                    <TableHead>Expertise</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Mentorships</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mentors.map((mentor) => (
                                    <TableRow key={mentor.id} className={mentor.isDisabled ? 'opacity-60' : ''}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{mentor.name || 'Anonymous'}</div>
                                                <div className="text-sm text-muted-foreground">{mentor.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {parseExpertise(mentor.expertise)}
                                        </TableCell>
                                        <TableCell>{mentor.company || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {mentor._count.mentorshipsAsMentor} active
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {mentor.isDisabled ? (
                                                <Badge variant="outline" className="bg-red-50 text-red-700">
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Disabled
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Active
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className={mentor.isDisabled
                                                        ? "text-green-600 border-green-600 hover:bg-green-50"
                                                        : "text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                                                    }
                                                    onClick={() => handleToggleDisable(mentor.id, mentor.isDisabled)}
                                                    disabled={processing === mentor.id}
                                                >
                                                    {processing === mentor.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : mentor.isDisabled ? (
                                                        <>
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Enable
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Ban className="h-3 w-3 mr-1" />
                                                            Disable
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(mentor.id)}
                                                    disabled={processing === mentor.id}
                                                >
                                                    {processing === mentor.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Trash2 className="h-3 w-3 mr-1" />
                                                            Delete
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
