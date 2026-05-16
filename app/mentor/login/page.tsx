'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';
import Link from 'next/link';

export default function MentorLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/mentor-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/mentor/dashboard');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50 p-4">
            <Card className="w-full max-w-md border-2 border-orange-200 shadow-xl">
                <CardHeader className="space-y-1 bg-gradient-to-r from-orange-50 to-blue-50 border-b-2 border-orange-200">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-orange-100 rounded-full">
                            <Users className="h-8 w-8 text-orange-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Mentor Portal</CardTitle>
                    <CardDescription className="text-center">
                        Login to access your mentor dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="mentor@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="border-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="border-2"
                            />
                        </div>
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full bg-orange-600 hover:bg-orange-700"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login as Mentor'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Not a mentor?{' '}
                            <Link href="/login" className="text-primary hover:underline">
                                Regular Login
                            </Link>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            <Link href="/" className="text-primary hover:underline">
                                Back to Home
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
