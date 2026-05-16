'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Loader2 } from 'lucide-react';
import { loginAdminAction } from './actions';

export default function AdminLoginPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError('');

        try {
            const result = await loginAdminAction(formData);
            console.log('Admin login result:', result); // Debug logging
            if (result.success && result.user) {
                // Save session to localStorage
                if (typeof window !== 'undefined') {
                    // Clear any existing session first
                    localStorage.removeItem('dreamify_session');
                    // Store the new session with role
                    console.log('Storing user with role:', result.user.role); // Debug logging
                    localStorage.setItem('dreamify_session', JSON.stringify(result.user));
                    // Dispatch event to notify Navbar to reload user data
                    window.dispatchEvent(new Event('gostarthub:auth-change'));
                }
                router.push('/admin');
                router.refresh();
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Lock className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Admin Login</CardTitle>
                    <CardDescription>
                        Enter your credentials to access the admin dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@gostarthub.com"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                </CardContent>
            </Card>
        </div>
    );
}
