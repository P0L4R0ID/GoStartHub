'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Upload, FileText, Send, Download, Edit, ArrowLeft, Users, Rocket, Video, Calendar, Clock, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/storage';

interface Message {
    id: string;
    content: string;
    sender: { id: string; name: string; email: string };
    createdAt: string;
}

interface SessionFile {
    id: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    uploadedBy: { id: string; name: string };
    createdAt: string;
}

interface Note {
    id: string;
    title: string;
    content: string;
    author: { id: string; name: string };
    createdAt: string;
    updatedAt: string;
}

interface ScheduledCall {
    id: string;
    title: string;
    description: string | null;
    scheduledAt: string;
    duration: number;
    status: string;
    meetingUrl: string | null;
    proposedBy: { id: string; name: string; email: string };
}

interface Relationship {
    id: string;
    mentor: { id: string; name: string; email: string };
    startup: { id: string; title: string; category: string };
    status: string;
    startDate: string;
}

export default function InnovatorSessionPage({ params }: { params: { relationshipId: string } }) {
    const { relationshipId } = params;
    const router = useRouter();
    const [relationship, setRelationship] = useState<Relationship | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [files, setFiles] = useState<SessionFile[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [inCall, setInCall] = useState(false);
    const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [scheduleTitle, setScheduleTitle] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [scheduleDuration, setScheduleDuration] = useState('30');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [showPastCalls, setShowPastCalls] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        const session = storage.getSession();
        if (!session) {
            router.push('/login');
            return;
        }

        // Get current user ID from session
        if (session?.user?.id) {
            setCurrentUserId(session.user.id);
        }

        fetchData();
        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [relationshipId, router]);

    const fetchData = async () => {
        await Promise.all([fetchRelationship(), fetchMessages(), fetchFiles(), fetchNotes(), fetchScheduledCalls()]);
        setLoading(false);
    };

    const fetchRelationship = async () => {
        try {
            const response = await fetch(`/api/user/mentorships`);
            if (response.ok) {
                const data = await response.json();
                const rel = data.relationships?.find((r: Relationship) => r.id === relationshipId);
                if (rel) {
                    setRelationship(rel);
                }
            }
        } catch (error) {
            console.error('Error fetching relationship:', error);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await fetch(`/api/session/${relationshipId}/messages`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchFiles = async () => {
        try {
            const response = await fetch(`/api/session/${relationshipId}/files`);
            if (response.ok) {
                const data = await response.json();
                setFiles(data.files || []);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    const fetchNotes = async () => {
        try {
            const response = await fetch(`/api/session/${relationshipId}/notes`);
            if (response.ok) {
                const data = await response.json();
                setNotes(data.notes || []);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const fetchScheduledCalls = async () => {
        try {
            const response = await fetch(`/api/session/${relationshipId}/scheduled-calls`);
            if (response.ok) {
                const data = await response.json();
                setScheduledCalls(data.scheduledCalls || []);
            }
        } catch (error) {
            console.error('Error fetching scheduled calls:', error);
        }
    };

    const handleScheduleCall = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scheduleDate || !scheduleTime) return;

        try {
            const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);
            const response = await fetch(`/api/session/${relationshipId}/scheduled-calls`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: scheduleTitle || 'Mentorship Call',
                    scheduledAt: scheduledAt.toISOString(),
                    duration: parseInt(scheduleDuration),
                }),
            });

            if (response.ok) {
                setScheduleTitle('');
                setScheduleDate('');
                setScheduleTime('');
                setShowScheduleForm(false);
                fetchScheduledCalls();
            }
        } catch (error) {
            console.error('Error scheduling call:', error);
        }
    };

    const handleConfirmCall = async (callId: string) => {
        try {
            const response = await fetch(`/api/session/${relationshipId}/scheduled-calls/${callId}/confirm`, {
                method: 'POST',
            });
            if (response.ok) {
                fetchScheduledCalls();
            }
        } catch (error) {
            console.error('Error confirming call:', error);
        }
    };

    const handleDeclineCall = async (callId: string) => {
        try {
            const response = await fetch(`/api/session/${relationshipId}/scheduled-calls/${callId}/decline`, {
                method: 'POST',
            });
            if (response.ok) {
                fetchScheduledCalls();
            }
        } catch (error) {
            console.error('Error declining call:', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const response = await fetch(`/api/session/${relationshipId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage }),
            });

            if (response.ok) {
                setNewMessage('');
                fetchMessages();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`/api/session/${relationshipId}/files`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setSelectedFile(null);
                fetchFiles();
                alert('File uploaded successfully');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        }
    };

    const handleSaveNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteTitle.trim() || !noteContent.trim()) return;

        try {
            const url = `/api/session/${relationshipId}/notes`;
            const method = editingNoteId ? 'PUT' : 'POST';
            const body = editingNoteId
                ? JSON.stringify({ noteId: editingNoteId, title: noteTitle, content: noteContent })
                : JSON.stringify({ title: noteTitle, content: noteContent });

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body,
            });

            if (response.ok) {
                setNoteTitle('');
                setNoteContent('');
                setEditingNoteId(null);
                fetchNotes();
            }
        } catch (error) {
            console.error('Error saving note:', error);
        }
    };

    const handleEditNote = (note: Note) => {
        setNoteTitle(note.title);
        setNoteContent(note.content);
        setEditingNoteId(note.id);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
            {/* Header */}
            <header className="bg-white border-b-2 border-blue-200 sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Rocket className="h-5 w-5 text-blue-600" />
                        <h1 className="text-xl font-bold">Mentorship Session</h1>
                    </div>
                    <div className="w-32"></div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                {loading ? (
                    <p className="text-center py-12">Loading session...</p>
                ) : (
                    <>
                        {/* Session Info */}
                        {relationship && (
                            <Card className="mb-6 border-2 border-blue-200">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold">
                                                Mentor: {relationship.mentor?.name || 'Unknown'}
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                Startup: {relationship.startup?.title}
                                            </p>
                                        </div>
                                        <Badge className="bg-green-500">Active</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Tabs defaultValue="chat" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-4 max-w-lg mx-auto">
                                <TabsTrigger value="chat">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Chat
                                </TabsTrigger>
                                <TabsTrigger value="video">
                                    <Video className="h-4 w-4 mr-2" />
                                    Video Call
                                </TabsTrigger>
                                <TabsTrigger value="files">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Files
                                </TabsTrigger>
                                <TabsTrigger value="notes">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Notes
                                </TabsTrigger>
                            </TabsList>

                            {/* Chat Tab */}
                            <TabsContent value="chat">
                                <Card className="border-2 border-blue-200">
                                    <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b-2 border-blue-200">
                                        <CardTitle className="flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 text-blue-600" />
                                            Messages
                                        </CardTitle>
                                        <CardDescription>Communicate with your mentor</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <ScrollArea className="h-[400px] rounded-md border-2 p-4 mb-4">
                                            <div className="space-y-4">
                                                {messages.length === 0 ? (
                                                    <p className="text-center text-muted-foreground py-8">
                                                        No messages yet. Start the conversation!
                                                    </p>
                                                ) : (
                                                    messages.map((msg) => (
                                                        <div key={msg.id} className="bg-muted rounded-lg p-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-semibold text-sm">{msg.sender.name}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(msg.createdAt).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm">{msg.content}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </ScrollArea>
                                        <form onSubmit={handleSendMessage} className="flex gap-2">
                                            <Input
                                                placeholder="Type your message..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                className="border-2"
                                                disabled={sending}
                                            />
                                            <Button type="submit" disabled={sending}>
                                                <Send className="h-4 w-4 mr-2" />
                                                Send
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Video Call Tab */}
                            <TabsContent value="video">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Scheduled Calls */}
                                    <Card className="border-2 border-blue-200">
                                        <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b-2 border-blue-200">
                                            <CardTitle className="flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-blue-600" />
                                                Scheduled Calls
                                            </CardTitle>
                                            <CardDescription>Upcoming and pending calls</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            {/* Upcoming Calls */}
                                            {scheduledCalls.filter(c => c.status !== 'DECLINED' && c.status !== 'CANCELLED' && c.status !== 'COMPLETED').length === 0 ? (
                                                <p className="text-center text-muted-foreground py-6">No upcoming calls</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {scheduledCalls.filter(c => c.status !== 'DECLINED' && c.status !== 'CANCELLED' && c.status !== 'COMPLETED').map((call) => (
                                                        <div key={call.id} className="p-3 border rounded-lg">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div>
                                                                    <h4 className="font-semibold text-sm">{call.title}</h4>
                                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        {new Date(call.scheduledAt).toLocaleString()}
                                                                        <span>({call.duration} min)</span>
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Proposed by {call.proposedBy.name}
                                                                    </p>
                                                                </div>
                                                                <Badge
                                                                    className={
                                                                        call.status === 'CONFIRMED' ? 'bg-green-500' :
                                                                            call.status === 'PENDING' ? 'bg-yellow-500' : 'bg-gray-500'
                                                                    }
                                                                >
                                                                    {call.status}
                                                                </Badge>
                                                            </div>
                                                            {call.status === 'PENDING' && call.proposedBy.id !== currentUserId && (
                                                                <div className="flex gap-2 mt-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                                                                        onClick={() => handleConfirmCall(call.id)}
                                                                    >
                                                                        <Check className="h-3 w-3 mr-1" />
                                                                        Confirm
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                                                                        onClick={() => handleDeclineCall(call.id)}
                                                                    >
                                                                        <X className="h-3 w-3 mr-1" />
                                                                        Decline
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            {call.status === 'PENDING' && call.proposedBy.id === currentUserId && (
                                                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                                                    Awaiting response from other party
                                                                </p>
                                                            )}
                                                            {call.status === 'CONFIRMED' && new Date(call.scheduledAt) <= new Date() && (
                                                                <Button
                                                                    size="sm"
                                                                    className="w-full mt-2 bg-green-600 hover:bg-green-700"
                                                                    onClick={() => setInCall(true)}
                                                                >
                                                                    <Video className="h-3 w-3 mr-1" />
                                                                    Join Call
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Past Calls - Collapsible */}
                                            {scheduledCalls.filter(c => c.status === 'COMPLETED').length > 0 && (
                                                <div className="mt-4 border-t pt-4">
                                                    <button
                                                        onClick={() => setShowPastCalls(!showPastCalls)}
                                                        className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        <span>Past Calls ({scheduledCalls.filter(c => c.status === 'COMPLETED').length})</span>
                                                        {showPastCalls ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                    </button>
                                                    {showPastCalls && (
                                                        <div className="mt-3 space-y-2">
                                                            {scheduledCalls.filter(c => c.status === 'COMPLETED').map((call) => (
                                                                <div key={call.id} className="p-2 border rounded-lg bg-gray-50 opacity-75">
                                                                    <div className="flex items-start justify-between">
                                                                        <div>
                                                                            <h4 className="font-medium text-sm">{call.title}</h4>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {new Date(call.scheduledAt).toLocaleString()} • {call.duration} min
                                                                            </p>
                                                                        </div>
                                                                        <Badge className="bg-gray-400">Completed</Badge>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Schedule New Call Form */}
                                            {showScheduleForm ? (
                                                <form onSubmit={handleScheduleCall} className="mt-4 p-4 border-2 border-dashed border-blue-200 rounded-lg">
                                                    <h4 className="font-semibold mb-3">Schedule a Call</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <Label htmlFor="call-title">Title (optional)</Label>
                                                            <Input
                                                                id="call-title"
                                                                placeholder="e.g., Weekly Check-in"
                                                                value={scheduleTitle}
                                                                onChange={(e) => setScheduleTitle(e.target.value)}
                                                                className="border-2"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <Label htmlFor="call-date">Date</Label>
                                                                <Input
                                                                    id="call-date"
                                                                    type="date"
                                                                    value={scheduleDate}
                                                                    onChange={(e) => setScheduleDate(e.target.value)}
                                                                    className="border-2"
                                                                    required
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="call-time">Time</Label>
                                                                <Input
                                                                    id="call-time"
                                                                    type="time"
                                                                    value={scheduleTime}
                                                                    onChange={(e) => setScheduleTime(e.target.value)}
                                                                    className="border-2"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="call-duration">Duration (minutes)</Label>
                                                            <select
                                                                id="call-duration"
                                                                value={scheduleDuration}
                                                                onChange={(e) => setScheduleDuration(e.target.value)}
                                                                className="w-full border-2 rounded-md px-3 py-2"
                                                            >
                                                                <option value="15">15 minutes</option>
                                                                <option value="30">30 minutes</option>
                                                                <option value="45">45 minutes</option>
                                                                <option value="60">1 hour</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button type="submit" className="flex-1">
                                                                <Calendar className="h-4 w-4 mr-2" />
                                                                Schedule
                                                            </Button>
                                                            <Button type="button" variant="outline" onClick={() => setShowScheduleForm(false)}>
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </form>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    className="w-full mt-4 border-dashed"
                                                    onClick={() => setShowScheduleForm(true)}
                                                >
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    Schedule a Call
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Instant Call */}
                                    <Card className="border-2 border-green-200">
                                        <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b-2 border-green-200">
                                            <CardTitle className="flex items-center gap-2">
                                                <Video className="h-5 w-5 text-green-600" />
                                                Instant Call
                                            </CardTitle>
                                            <CardDescription>Start a video call right now</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            {!inCall ? (
                                                <div className="text-center py-8">
                                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Video className="h-10 w-10 text-green-600" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold mb-2">Ready to Connect?</h3>
                                                    <p className="text-sm text-muted-foreground mb-4">
                                                        Start an instant video call with your mentor.
                                                    </p>
                                                    <Button
                                                        size="lg"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => setInCall(true)}
                                                    >
                                                        <Video className="h-5 w-5 mr-2" />
                                                        Start Video Call
                                                    </Button>
                                                    <p className="text-xs text-muted-foreground mt-3">
                                                        Powered by Jitsi Meet • No account required
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <Badge className="bg-green-500">In Call</Badge>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => setInCall(false)}
                                                        >
                                                            End Call
                                                        </Button>
                                                    </div>
                                                    <div className="rounded-lg overflow-hidden border-2 border-green-200">
                                                        <iframe
                                                            src={`https://meet.jit.si/GoStartHub-Session-${relationshipId}?minimal=true`}
                                                            width="100%"
                                                            height="400"
                                                            style={{ border: 0 }}
                                                            allow="camera; microphone; fullscreen; display-capture; autoplay"
                                                            allowFullScreen
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground text-center">
                                                        Share: <code className="bg-muted px-2 py-1 rounded">GoStartHub-Session-{relationshipId}</code>
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>


                            {/* Files Tab */}
                            <TabsContent value="files">
                                <Card className="border-2 border-purple-200">
                                    <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b-2 border-purple-200">
                                        <CardTitle className="flex items-center gap-2">
                                            <Upload className="h-5 w-5 text-purple-600" />
                                            Shared Files
                                        </CardTitle>
                                        <CardDescription>Upload and download files</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="mb-6">
                                            <Label htmlFor="file-upload" className="mb-2 block">Upload File</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="file-upload"
                                                    type="file"
                                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                                    className="border-2"
                                                />
                                                <Button onClick={handleFileUpload} disabled={!selectedFile}>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Upload
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {files.length === 0 ? (
                                                <p className="text-center text-muted-foreground py-8">No files uploaded yet</p>
                                            ) : (
                                                files.map((file) => (
                                                    <Card key={file.id}>
                                                        <CardContent className="pt-4 flex items-center justify-between">
                                                            <div>
                                                                <p className="font-semibold">{file.fileName}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Uploaded by {file.uploadedBy.name} on{' '}
                                                                    {new Date(file.createdAt).toLocaleDateString()}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Size: {(file.fileSize / 1024).toFixed(2)} KB
                                                                </p>
                                                            </div>
                                                            <a href={file.filePath} download>
                                                                <Button size="sm" variant="outline">
                                                                    <Download className="h-4 w-4 mr-2" />
                                                                    Download
                                                                </Button>
                                                            </a>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Notes Tab */}
                            <TabsContent value="notes">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card className="border-2 border-green-200">
                                        <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b-2 border-green-200">
                                            <CardTitle>
                                                {editingNoteId ? 'Edit Note' : 'Create Note'}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <form onSubmit={handleSaveNote} className="space-y-4">
                                                <div>
                                                    <Label htmlFor="note-title">Title</Label>
                                                    <Input
                                                        id="note-title"
                                                        value={noteTitle}
                                                        onChange={(e) => setNoteTitle(e.target.value)}
                                                        className="border-2"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="note-content">Content</Label>
                                                    <Textarea
                                                        id="note-content"
                                                        value={noteContent}
                                                        onChange={(e) => setNoteContent(e.target.value)}
                                                        className="border-2 min-h-[200px]"
                                                        required
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button type="submit" className="flex-1">
                                                        {editingNoteId ? 'Update Note' : 'Save Note'}
                                                    </Button>
                                                    {editingNoteId && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setEditingNoteId(null);
                                                                setNoteTitle('');
                                                                setNoteContent('');
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    )}
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-2 border-orange-200">
                                        <CardHeader className="bg-gradient-to-r from-orange-50 to-white border-b-2 border-orange-200">
                                            <CardTitle>Saved Notes</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <ScrollArea className="h-[400px]">
                                                <div className="space-y-3">
                                                    {notes.length === 0 ? (
                                                        <p className="text-center text-muted-foreground py-8">No notes yet</p>
                                                    ) : (
                                                        notes.map((note) => (
                                                            <Card key={note.id} className="hover:border-primary/50 transition-all">
                                                                <CardContent className="pt-4">
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <h4 className="font-semibold">{note.title}</h4>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => handleEditNote(note)}
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                                                                        {note.content}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        By {note.author.name} on{' '}
                                                                        {new Date(note.updatedAt).toLocaleDateString()}
                                                                    </p>
                                                                </CardContent>
                                                            </Card>
                                                        ))
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </main>
        </div>
    );
}
