'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Briefcase, Mail, ArrowLeft, Loader2, ExternalLink, Linkedin, Globe, Award, Medal } from 'lucide-react';
import Link from 'next/link';
import MentorshipRequestDialog from '@/components/MentorshipRequestDialog';
import { cn } from '@/lib/utils';

interface MentorDetail {
    id: string;
    name: string | null;
    email: string;
    mentorProfile: {
        bio: string;
        expertise: string;
        experience: string;
        company: string | null;
        availability: string;
        profileImage: string | null;
        socialLinks: string | null;
        mentorType: string | null;
        languages: string | null;
        linkedin: string | null;
    };
}

export default function MentorDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [mentor, setMentor] = useState<MentorDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        fetchMentor();
    }, []);

    const fetchMentor = async () => {
        try {
            const response = await fetch('/api/mentors');
            if (response.ok) {
                const data = await response.json();
                const foundMentor = data.mentors.find((m: any) => m.id === params.id);
                setMentor(foundMentor || null);
            }
        } catch (error) {
            console.error('Error fetching mentor:', error);
        } finally {
            setLoading(false);
        }
    };

    const parseExpertise = (expertise: string): string[] => {
        try {
            const parsed = JSON.parse(expertise);
            return Array.isArray(parsed) ? parsed : [expertise];
        } catch {
            return expertise.split(',').map(e => e.trim());
        }
    };

    const parseLanguages = (languages: string | null): string[] => {
        if (!languages) return [];
        try {
            const parsed = JSON.parse(languages);
            return Array.isArray(parsed) ? parsed : [languages];
        } catch {
            return languages.split(',').map(l => l.trim());
        }
    };

    const parseSocialLinks = (socialLinks: string | null) => {
        if (!socialLinks) return {};
        try {
            return JSON.parse(socialLinks);
        } catch {
            return {};
        }
    };

    if (loading) {
        return (
            <div className="container max-w-4xl mx-auto py-12 px-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </div>
        );
    }

    if (!mentor) {
        return (
            <div className="container max-w-4xl mx-auto py-12 px-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Mentor Not Found</h1>
                <Link href="/mentors">
                    <Button>Back to Mentors</Button>
                </Link>
            </div>
        );
    }

    const profile = mentor.mentorProfile;
    const expertiseList = parseExpertise(profile.expertise);
    const languageList = parseLanguages(profile.languages);

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">

            {/* Header Card */}
            <Card className="mb-6 overflow-hidden border-none shadow-sm">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Avatar */}
                        {profile.profileImage ? (
                            <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-2 border-primary/20 flex-shrink-0">
                                <img
                                    src={profile.profileImage}
                                    alt={mentor.name || 'Mentor'}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                <User className="h-10 w-10 text-white" />
                            </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <h1 className="text-3xl font-bold text-gray-900">{mentor.name || 'Anonymous Mentor'}</h1>

                            {/* Mentor Type - Green Text */}
                            {profile.mentorType && (
                                <div className="flex items-center justify-center md:justify-start text-emerald-600 font-medium">
                                    <Medal className="h-4 w-4 mr-2" />
                                    <span>{profile.mentorType} Mentor</span>
                                </div>
                            )}

                            {/* Company */}
                            {profile.company && (
                                <div className="flex items-center justify-center md:justify-start text-gray-500">
                                    <Briefcase className="h-4 w-4 mr-2" />
                                    <span>{profile.company}</span>
                                </div>
                            )}

                            {/* Badges Row */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4 pt-2">
                                {/* Availability Badge */}
                                <Badge
                                    className={cn(
                                        "capitalize px-3 py-1",
                                        profile.availability === 'available' ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-500"
                                    )}
                                >
                                    {profile.availability}
                                </Badge>

                                {/* Experience Badge */}
                                <Badge variant="outline" className="text-gray-700 border-gray-200 px-3 py-1 bg-gray-50/50">
                                    {profile.experience} years experience
                                </Badge>

                                {/* LinkedIn Button */}
                                {profile.linkedin && (
                                    <a
                                        href={profile.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-[#0077b5] text-white rounded-md hover:bg-[#006699] transition-colors"
                                    >
                                        <Linkedin className="h-3.5 w-3.5" />
                                        LinkedIn
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* About Section */}
            <Card className="mb-6 border-none shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold">About</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {profile.bio}
                    </p>
                </CardContent>
            </Card>

            {/* Expertise Section */}
            <Card className="mb-6 border-none shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold">Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {expertiseList.map((exp, idx) => (
                            <Badge
                                key={idx}
                                variant="secondary"
                                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 text-sm font-normal"
                            >
                                {exp}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Languages Section - matches Expertise style if exists */}
            {languageList.length > 0 && (
                <Card className="mb-6 border-none shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            Languages
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {languageList.map((lang, idx) => (
                                <Badge
                                    key={idx}
                                    variant="outline"
                                    className="border-gray-200 text-gray-600 px-3 py-1"
                                >
                                    {lang}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <Link href={`mailto:${mentor.email}`} className="block">
                    <Button variant="outline" className="w-full h-12 text-base gap-2 border-gray-300">
                        <Mail className="h-4 w-4" />
                        Contact via Email
                    </Button>
                </Link>
                <Button
                    className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => setDialogOpen(true)}
                >
                    Request Mentorship
                </Button>
            </div>

            {mentor && (
                <MentorshipRequestDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    mentorId={mentor.id}
                    mentorName={mentor.name || 'Mentor'}
                    mentorRequiresPayment={false}
                    mentorPrice={0}
                />
            )}
        </div>
    );
}
