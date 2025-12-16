'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { Activity } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity as ActivityIcon, Rocket, MessageSquare, DollarSign, Calendar, BookOpen, Heart, FileText } from 'lucide-react';
import Link from 'next/link';

interface ActivityFeedProps {
  userId?: string;
  limit?: number;
}

export default function ActivityFeed({ userId, limit }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadActivities();
  }, [userId]);

  const loadActivities = () => {
    const allActivities = userId ? storage.getActivities(userId) : storage.getActivities();
    const sorted = allActivities.sort((a: Activity, b: Activity) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setActivities(limit ? sorted.slice(0, limit) : sorted);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'startup_created':
      case 'startup_updated':
        return <Rocket className="h-4 w-4" />;
      case 'mentorship_requested':
        return <MessageSquare className="h-4 w-4" />;
      case 'funding_applied':
        return <DollarSign className="h-4 w-4" />;
      case 'programme_registered':
        return <BookOpen className="h-4 w-4" />;
      case 'event_registered':
        return <Calendar className="h-4 w-4" />;
      case 'comment_added':
        return <MessageSquare className="h-4 w-4" />;
      case 'like_added':
        return <Heart className="h-4 w-4" />;
      default:
        return <ActivityIcon className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'startup_created':
      case 'startup_updated':
        return 'bg-blue-100 text-blue-700';
      case 'mentorship_requested':
        return 'bg-purple-100 text-purple-700';
      case 'funding_applied':
        return 'bg-green-100 text-green-700';
      case 'programme_registered':
        return 'bg-orange-100 text-orange-700';
      case 'event_registered':
        return 'bg-pink-100 text-pink-700';
      case 'comment_added':
        return 'bg-indigo-100 text-indigo-700';
      case 'like_added':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ActivityIcon className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <ActivityIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className={`p-2 rounded-lg flex-shrink-0 ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground mb-1">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                  {activity.link && (
                    <Link href={activity.link}>
                      <Badge variant="outline" className="mt-2 cursor-pointer hover:bg-primary/10">
                        View →
                      </Badge>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

