'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState({
        pendingStartups: 0,
        pendingMentorApps: 0,
    });

    useEffect(() => {
        // Fetch basic stats
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch pending startups count
            const startupsRes = await fetch('/api/admin/startups');
            if (startupsRes.ok) {
                const startupsData = await startupsRes.json();
                const pending = startupsData.startups?.filter((s: any) => s.status === 'PENDING').length || 0;

                // Fetch pending mentor applications count
                const appsRes = await fetch('/api/admin/mentor-applications?status=PENDING');
                if (appsRes.ok) {
                    const appsData = await appsRes.json();
                    const pendingApps = appsData.applications?.length || 0;

                    setStats({
                        pendingStartups: pending,
                        pendingMentorApps: pendingApps,
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const dashboardCards = [
        {
            title: 'Startup Submissions',
            description: 'Review and manage startup submissions',
            icon: FileText,
            href: '/admin/startups',
            badge: stats.pendingStartups > 0 ? `${stats.pendingStartups} Pending` : null,
            color: 'from-blue-500 to-blue-600',
        },
        {
            title: 'Mentor Applications',
            description: 'Review mentor applications and approve mentors',
            icon: Users,
            href: '/admin/mentor-applications',
            badge: stats.pendingMentorApps > 0 ? `${stats.pendingMentorApps} Pending` : null,
            color: 'from-purple-500 to-purple-600',
        },
        {
            title: 'Funding Opportunities',
            description: 'Create and manage funding opportunities',
            icon: BarChart3,
            href: '/admin/funding-opportunities',
            badge: null,
            color: 'from-green-500 to-green-600',
        },
        {
            title: 'Funding Applications',
            description: 'Review and approve funding applications',
            icon: Settings,
            href: '/admin/funding-applications',
            badge: null,
            color: 'from-orange-500 to-orange-600',
        },
    ];

    return (
        <div className="container mx-auto py-12 px-4 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Manage startup submissions, mentor applications, and platform settings
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {dashboardCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Link key={card.href} href={card.href}>
                            <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50 h-full">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        {card.badge && (
                                            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                                                {card.badge}
                                            </span>
                                        )}
                                    </div>
                                    <CardTitle className="text-xl">{card.title}</CardTitle>
                                    <CardDescription>{card.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-primary font-medium">
                                        View & Manage →
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                    <CardDescription>Overview of pending items</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">Pending Startups</p>
                                <p className="text-2xl font-bold text-blue-700">{stats.pendingStartups}</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">Pending Mentor Apps</p>
                                <p className="text-2xl font-bold text-purple-700">{stats.pendingMentorApps}</p>
                            </div>
                            <Users className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
