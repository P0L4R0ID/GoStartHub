'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Heart, TrendingUp, DollarSign, ArrowLeft, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [startups, setStartups] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const session = storage.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUser(session);

    const allStartups = storage.getStartups();
    const userStartups = allStartups.filter((s: any) => s.innovatorId === session.id);
    setStartups(userStartups);

    // Calculate analytics
    const totalViews = userStartups.reduce((sum: number, s: any) => sum + (s.views || 0), 0);
    const totalLikes = userStartups.reduce((sum: number, s: any) => sum + (s.likes || 0), 0);
    const totalFunding = userStartups.reduce((sum: number, s: any) => sum + (s.fundingReceived || 0), 0);
    const avgViews = userStartups.length > 0 ? totalViews / userStartups.length : 0;
    const avgLikes = userStartups.length > 0 ? totalLikes / userStartups.length : 0;

    // Views over time (last 7 days simulation)
    const viewsData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: Math.floor(Math.random() * 50) + 10,
      };
    });

    // Likes over time
    const likesData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        likes: Math.floor(Math.random() * 10) + 2,
      };
    });

    // Startup performance
    const startupPerformance = userStartups.map((s: any) => ({
      name: s.title.length > 15 ? s.title.substring(0, 15) + '...' : s.title,
      views: s.views || 0,
      likes: s.likes || 0,
    }));

    // Category distribution
    const categoryCount: Record<string, number> = {};
    userStartups.forEach((s: any) => {
      categoryCount[s.category] = (categoryCount[s.category] || 0) + 1;
    });
    const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value,
    }));

    setAnalytics({
      totalViews,
      totalLikes,
      totalFunding,
      avgViews,
      avgLikes,
      viewsData,
      likesData,
      startupPerformance,
      categoryData,
    });
  }, [router]);

  if (!user || !analytics) {
    return null;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4 sm:mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>

        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Analytics Dashboard</h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Track your startup performance and engagement metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" />
                <span className="text-3xl font-bold">{analytics.totalViews}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Avg: {Math.round(analytics.avgViews)} per startup</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Likes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                <span className="text-3xl font-bold">{analytics.totalLikes}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Avg: {Math.round(analytics.avgLikes)} per startup</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Funding Raised</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold">RM {analytics.totalFunding.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Startups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <span className="text-3xl font-bold">{startups.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Views Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.viewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#0088FE" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Likes Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.likesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="likes" stroke="#FF69B4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Startup Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.startupPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#0088FE" />
                  <Bar dataKey="likes" fill="#FF69B4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

