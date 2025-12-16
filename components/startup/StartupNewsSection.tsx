'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StartupNews } from '@/types';
import { Calendar, Plus, Pencil, Trash2 } from 'lucide-react';

interface StartupNewsSectionProps {
    startupId: string;
    isInnovator: boolean;
}

export default function StartupNewsSection({ startupId, isInnovator }: StartupNewsSectionProps) {
    const [news, setNews] = useState<StartupNews[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StartupNews | null>(null);
    const [formData, setFormData] = useState({ title: '', content: '' });

    const fetchNews = async () => {
        try {
            const res = await fetch(`/api/startups/${startupId}/news`);
            if (res.ok) {
                const data = await res.json();
                setNews(data.news || []);
            }
        } catch (error) {
            console.error('Failed to fetch news', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [startupId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingItem
                ? `/api/startups/${startupId}/news/${editingItem.id}`
                : `/api/startups/${startupId}/news`;

            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchNews();
                setIsAddOpen(false);
                setEditingItem(null);
                setFormData({ title: '', content: '' });
            }
        } catch (error) {
            console.error('Failed to save news', error);
        }
    };

    const handleDelete = async (newsId: string) => {
        if (!confirm('Are you sure you want to delete this update?')) return;
        try {
            await fetch(`/api/startups/${startupId}/news/${newsId}`, { method: 'DELETE' });
            fetchNews();
        } catch (error) {
            console.error('Failed to delete', error);
        }
    };

    const openAdd = () => {
        setEditingItem(null);
        setFormData({ title: '', content: '' });
        setIsAddOpen(true);
    };

    const openEdit = (item: StartupNews) => {
        setEditingItem(item);
        setFormData({ title: item.title, content: item.content });
        setIsAddOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                {/* Only show Add button if innovator */}
                {isInnovator && (
                    <Button onClick={openAdd} className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" /> Add Update
                    </Button>
                )}
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Update' : 'Add New Update'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Title</label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="e.g., Product Launch v1.0"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Content</label>
                            <Textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                required
                                className="min-h-[150px]"
                                placeholder="Share your latest progress..."
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading updates...</div>
                ) : news.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
                        No news articles available yet.
                    </div>
                ) : (
                    news.map((item) => (
                        <Card key={item.id} className="border">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {isInnovator && (
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{item.content}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
