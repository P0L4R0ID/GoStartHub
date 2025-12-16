'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function EditMentorProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        expertise: '',
        experience: '',
        company: '',
        availability: 'available',
        profileImage: '',
        socialLinks: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/mentor/profile');
            if (response.ok) {
                const data = await response.json();
                const profile = data.profile;

                // Parse expertise
                let expertiseStr = '';
                try {
                    const parsed = JSON.parse(profile.expertise);
                    expertiseStr = Array.isArray(parsed) ? parsed.join(', ') : profile.expertise;
                } catch {
                    expertiseStr = profile.expertise;
                }

                setFormData({
                    name: profile.user?.name || '',
                    bio: profile.bio || '',
                    expertise: expertiseStr,
                    experience: profile.experience || '',
                    company: profile.company || '',
                    availability: profile.availability || 'available',
                    profileImage: profile.profileImage || '',
                    socialLinks: profile.socialLinks || '',
                });
            } else {
                setError('Failed to load profile');
            }
        } catch (error) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/mentor/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    expertise: formData.expertise.split(',').map(e => e.trim()).filter(Boolean)
                }),
            });

            if (response.ok) {
                setSuccess('Profile updated successfully!');
                setTimeout(() => {
                    router.push('/mentor/dashboard');
                }, 1500);
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Update failed');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container max-w-3xl mx-auto py-12 px-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </div>
        );
    }

    return (
        <div className="container max-w-3xl mx-auto py-12 px-4">
            <div className="mb-6">
                <Link href="/mentor/dashboard">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Mentor Dashboard
                    </Button>
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Edit Your Profile</h1>
                <p className="text-muted-foreground">Update your mentor profile information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Success</AlertTitle>
                        <AlertDescription className="text-green-700">{success}</AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Your public profile details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                placeholder="Tell others about your background and experience..."
                                className="min-h-[120px]"
                                value={formData.bio}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expertise">Expertise</Label>
                            <Input
                                id="expertise"
                                name="expertise"
                                placeholder="AI/ML, Product Development, Marketing (comma-separated)"
                                value={formData.expertise}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="experience">Years of Experience</Label>
                            <Input
                                id="experience"
                                name="experience"
                                type="number"
                                value={formData.experience}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                name="company"
                                placeholder="Your current company"
                                value={formData.company}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="availability">Availability</Label>
                            <Select onValueChange={(val) => handleSelectChange('availability', val)} value={formData.availability}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select availability" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="limited">Limited Availability</SelectItem>
                                    <SelectItem value="unavailable">Currently Unavailable</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profileImage">Profile Image URL</Label>
                            <Input
                                id="profileImage"
                                name="profileImage"
                                placeholder="https://example.com/image.jpg"
                                value={formData.profileImage}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="socialLinks">Social Links (JSON format)</Label>
                            <Textarea
                                id="socialLinks"
                                name="socialLinks"
                                placeholder='{"linkedin": "https://linkedin.com/in/...", "twitter": "..."}'
                                value={formData.socialLinks}
                                onChange={handleInputChange}
                            />
                            <p className="text-xs text-muted-foreground">Optional: Add social links in JSON format</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.push('/mentor/dashboard')}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="min-w-[150px]">
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
