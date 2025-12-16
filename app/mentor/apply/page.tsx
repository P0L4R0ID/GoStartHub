'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    CheckCircle2, Loader2, ArrowLeft, Camera, User,
    Briefcase, Sparkles, Globe, Award, ChevronRight, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const STEPS = [
    { id: 'profile', label: 'Profile' },
    { id: 'expertise', label: 'Expertise' },
];

export default function MentorApplyPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        bio: '',
        expertise: '',
        experience: '',
        mentorType: '',
        mentorTypeOther: '',
        languages: '',
        linkedinUrl: '',
        company: '',
        availability: 'available',
        portfolioUrl: '', // Keeping for legacy/compatibility if needed, though we use linkedinUrl now
    });

    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNext = () => {
        setError('');
        // Validation Step 1
        if (currentStep === 0) {
            if (!formData.bio) {
                setError('Please tell us a bit about yourself in the Bio section.');
                return;
            }
        }

        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        setError('');
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        // Final Validation
        if (!formData.mentorType || !formData.expertise || !formData.experience) {
            setError('Please fill in all required fields in the Expertise section.');
            setIsSubmitting(false);
            return;
        }

        try {
            const submitData = new FormData();
            submitData.append('bio', formData.bio);
            submitData.append('expertise', formData.expertise.split(',').map(e => e.trim()).filter(Boolean).join(','));
            submitData.append('experience', formData.experience);
            submitData.append('languages', formData.languages.split(',').map(l => l.trim()).filter(Boolean).join(','));
            submitData.append('company', formData.company);
            submitData.append('linkedinUrl', formData.linkedinUrl);
            submitData.append('availability', formData.availability);
            submitData.append('mentorType', formData.mentorType);
            submitData.append('mentorTypeOther', formData.mentorTypeOther);
            submitData.append('portfolioUrl', formData.portfolioUrl);

            // Append profile image if selected
            if (profileImageFile) {
                submitData.append('profileImage', profileImageFile);
            }

            const response = await fetch('/api/mentor/apply', {
                method: 'POST',
                body: submitData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Submission failed');
            }

            setSuccessMessage(result.message);

        } catch (err: any) {
            setError(err.message || 'An error occurred while submitting your application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    if (successMessage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-xl animate-in zoom-in-95 duration-500">
                    <CardContent className="pt-10 pb-10 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
                        <p className="text-slate-600 mb-8">{successMessage}</p>
                        <Link href="/">
                            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">Return Home</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const progress = ((currentStep + 1) / STEPS.length) * 100;

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-100 via-purple-100 to-transparent opacity-60 -z-10" />

            <div className="container mx-auto px-4 py-8">
                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* LEFT COLUMN: Inspiration & Info */}
                    <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                                Shape the <span className="text-blue-600">Future</span> of Innovation
                            </h1>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Join our elite network of mentors and pass on your knowledge to the next generation of founders.
                            </p>
                        </div>

                        <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-sm space-y-4">
                            <h3 className="font-semibold text-slate-900 flex items-center">
                                <Sparkles className="w-4 h-4 mr-2 text-yellow-500" /> Why Mentor?
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    'Give back to the community',
                                    'Access to vetted startups',
                                    'Expand your professional network',
                                    'Exclusive events and workshops'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start text-sm text-slate-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 mr-3 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Application Wizard */}
                    <div className="lg:col-span-2">
                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-blue-600">Step {currentStep + 1} of {STEPS.length}</span>
                                <span className="text-sm text-slate-500 font-medium">{STEPS[currentStep].label}</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        {error && (
                            <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-md min-h-[500px] flex flex-col">
                            <CardContent className="p-8 flex-1 flex flex-col">

                                {/* STEP 1: PROFILE */}
                                {currentStep === 0 && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-50 rounded-xl">
                                                <User className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900">About You</h2>
                                                <p className="text-slate-500">Let's start with your profile.</p>
                                            </div>
                                        </div>

                                        {/* Profile Picture */}
                                        <div className="space-y-3">
                                            <Label>Profile Picture</Label>
                                            <div className="flex items-center gap-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white shadow-sm border-2 border-dashed border-slate-200 flex items-center justify-center shrink-0">
                                                    {profileImage ? (
                                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-8 h-8 text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <input
                                                        type="file"
                                                        id="profilePicture"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                    />
                                                    <label htmlFor="profilePicture">
                                                        <Button type="button" variant="outline" size="sm" className="cursor-pointer bg-white" asChild>
                                                            <span>
                                                                <Camera className="w-4 h-4 mr-2" />
                                                                {profileImage ? 'Change Photo' : 'Upload Photo'}
                                                            </span>
                                                        </Button>
                                                    </label>
                                                    <p className="text-xs text-slate-500">Recommended: Square JPG/PNG, max 2MB.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="bio">Professional Bio <span className="text-red-500">*</span></Label>
                                            <Textarea
                                                id="bio"
                                                name="bio"
                                                placeholder="Tell us about your journey, key achievements, and what motivates you to become a mentor..."
                                                className="min-h-[150px] resize-none text-base leading-relaxed bg-white"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="company">Current Company</Label>
                                                <div className="relative">
                                                    <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                                    <Input
                                                        id="company"
                                                        name="company"
                                                        className="pl-9 bg-white"
                                                        placeholder="e.g. TechCorp Inc."
                                                        value={formData.company}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                                    <Input
                                                        id="linkedinUrl"
                                                        name="linkedinUrl"
                                                        className="pl-9 bg-white"
                                                        placeholder="https://linkedin.com/in/..."
                                                        value={formData.linkedinUrl}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: EXPERTISE */}
                                {currentStep === 1 && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-purple-50 rounded-xl">
                                                <Award className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900">Expertise</h2>
                                                <p className="text-slate-500">How can you help our startups?</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label htmlFor="mentorType">Mentor Type <span className="text-red-500">*</span></Label>
                                            <div className="p-1 bg-slate-100/50 rounded-lg">
                                                <Select onValueChange={(val) => handleSelectChange('mentorType', val)} value={formData.mentorType}>
                                                    <SelectTrigger className="bg-white border-0 shadow-sm h-12">
                                                        <SelectValue placeholder="Select your primary mentorship role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="career">Career Mentor</SelectItem>
                                                        <SelectItem value="technical">Technical Mentor</SelectItem>
                                                        <SelectItem value="business">Business/Startup Mentor</SelectItem>
                                                        <SelectItem value="fundraising">Fundraising Mentor</SelectItem>
                                                        <SelectItem value="product">Product Mentor</SelectItem>
                                                        <SelectItem value="ux">UX Mentor</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {formData.mentorType === 'other' && (
                                                <Input
                                                    id="mentorTypeOther"
                                                    name="mentorTypeOther"
                                                    placeholder="Please specify..."
                                                    value={formData.mentorTypeOther}
                                                    onChange={handleInputChange}
                                                    className="bg-white"
                                                />
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="expertise">Areas of Expertise <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="expertise"
                                                    name="expertise"
                                                    placeholder="e.g. AI/ML, B2B Sales, React, Fundraising Strategy"
                                                    value={formData.expertise}
                                                    onChange={handleInputChange}
                                                    className="bg-white"
                                                />
                                                <p className="text-xs text-slate-500">Separate multiple skills with commas.</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="languages">Languages <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="languages"
                                                    name="languages"
                                                    placeholder="e.g. English, Malay, Mandarin"
                                                    value={formData.languages}
                                                    onChange={handleInputChange}
                                                    className="bg-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="experience">Years of Experience <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="experience"
                                                    name="experience"
                                                    type="number"
                                                    placeholder="e.g. 10"
                                                    value={formData.experience}
                                                    onChange={handleInputChange}
                                                    className="bg-white"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="availability">Availability</Label>
                                                <Select onValueChange={(val) => handleSelectChange('availability', val)} value={formData.availability}>
                                                    <SelectTrigger className="bg-white">
                                                        <SelectValue placeholder="Select availability" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="available">Available</SelectItem>
                                                        <SelectItem value="limited">Limited Availability</SelectItem>
                                                        <SelectItem value="unavailable">Currently Unavailable</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            <div className="p-6 border-t border-slate-100 bg-white/50 flex justify-between rounded-b-xl">
                                {currentStep > 0 ? (
                                    <Button
                                        variant="ghost"
                                        onClick={handleBack}
                                        disabled={isSubmitting}
                                        className="text-slate-500 hover:text-slate-900"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                                    </Button>
                                ) : (
                                    <div /> // Spacer
                                )}

                                {currentStep === STEPS.length - 1 ? (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                                        ) : (
                                            'Submit Application'
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleNext}
                                        className="bg-slate-900 hover:bg-slate-800 text-white min-w-[140px]"
                                    >
                                        Next Step <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
