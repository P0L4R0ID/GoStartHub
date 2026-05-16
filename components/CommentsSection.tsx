'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { Comment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, User } from 'lucide-react';

interface CommentsSectionProps {
  startupId: string;
  userId?: string;
  userName?: string;
}

export default function CommentsSection({ startupId, userId, userName }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [startupId]);

  const loadComments = () => {
    const allComments = storage.getComments(startupId);
    const sorted = allComments.sort((a: Comment, b: Comment) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setComments(sorted);
  };

  const handleSubmit = () => {
    if (!newComment.trim() || !userId || !userName) return;

    setLoading(true);
    storage.createComment({
      startupId,
      userId,
      userName,
      content: newComment.trim(),
    });

    setNewComment('');
    loadComments();
    setLoading(false);
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
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment Form */}
        {userId && userName ? (
          <div className="space-y-2">
            <Textarea
              placeholder="Share your thoughts or ask a question..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button onClick={handleSubmit} disabled={loading || !newComment.trim()} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              <Send className="h-4 w-4 mr-2" />
              Post Comment
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Please log in to comment</p>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {comment.userAvatar ? (
                    <img src={comment.userAvatar} alt={comment.userName} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

