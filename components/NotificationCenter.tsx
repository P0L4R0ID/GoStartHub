'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { Notification } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X, MessageSquare, DollarSign, Calendar, BookOpen, Heart, AlertCircle } from 'lucide-react';
import Link from 'next/link';
// Simple date formatter
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

interface NotificationCenterProps {
  userId: string;
  onClose?: () => void;
}

export default function NotificationCenter({ userId, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const loadNotifications = () => {
    const allNotifications = storage.getNotifications(userId);
    const sorted = allNotifications.sort((a: Notification, b: Notification) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setNotifications(sorted);
    setUnreadCount(sorted.filter((n: Notification) => !n.read).length);
  };

  const markAsRead = (id: string) => {
    storage.markNotificationAsRead(id);
    loadNotifications();
  };

  const markAllAsRead = () => {
    storage.markAllNotificationsAsRead(userId);
    loadNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mentorship':
        return <MessageSquare className="h-4 w-4" />;
      case 'funding':
        return <DollarSign className="h-4 w-4" />;
      case 'programme':
        return <BookOpen className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'like':
        return <Heart className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'mentorship':
        return 'bg-blue-100 text-blue-700';
      case 'funding':
        return 'bg-green-100 text-green-700';
      case 'programme':
        return 'bg-purple-100 text-purple-700';
      case 'event':
        return 'bg-orange-100 text-orange-700';
      case 'comment':
        return 'bg-pink-100 text-pink-700';
      case 'like':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="w-full max-w-2xl border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  notification.read
                    ? 'bg-background border-border'
                    : 'bg-primary/5 border-primary/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="flex-shrink-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {notification.link && (
                      <Link href={notification.link}>
                        <Button variant="link" size="sm" className="mt-2 p-0 h-auto">
                          View details →
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

