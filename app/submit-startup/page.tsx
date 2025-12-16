'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Upload, CheckCircle2, Rocket, Users, Target, FileText, ImageIcon, X, Zap, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SubmitStartupPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    // Wizard State
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        stage: '',
        projectType: 'University', // Default
        companyName: '',
        linkedIn: '',
        email: '',
        website: '',
        milestones: '',
        problem: '',
        solution: '',
        targetCustomers: '',
        demoVideoUrl: '',
        university: '',
    });

    // Team Members State
    const [teamMembers, setTeamMembers] = useState([{ name: '', role: '' }]);

    // File State
    const [pitchDeck, setPitchDeck] = useState<File | null>(null);
    const [logo, setLogo] = useState<File | null>(null);
    const [bannerImage, setBannerImage] = useState<File | null>(null);

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleTeamChange = (index: number, field: 'name' | 'role', value: string) => {
        const updatedTeam = [...teamMembers];
        updatedTeam[index][field] = value;
        setTeamMembers(updatedTeam);
    };

    const addTeamMember = () => {
        setTeamMembers([...teamMembers, { name: '', role: '' }]);
    };

    const removeTeamMember = (index: number) => {
        if (teamMembers.length > 1) {
            const updatedTeam = teamMembers.filter((_, i) => i !== index);
            setTeamMembers(updatedTeam);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (e.target.id === 'pitchDeck') {
                if (file.type !== 'application/pdf') {
                    setError('Please upload a PDF file for pitch deck.');
                    return;
                }
                setPitchDeck(file);
            } else if (e.target.id === 'logo') {
                if (!file.type.startsWith('image/')) {
                    setError('Please upload an image file for logo.');
                    return;
                }
                setLogo(file);
            } else if (e.target.id === 'bannerImage') {
                if (!file.type.startsWith('image/')) {
                    setError('Please upload an image file for banner.');
                    return;
                }
                setBannerImage(file);
            }
            setError('');
        }
    };

    // Validation per step
    const validateStep = (currentStep: number) => {
        setError('');
        switch (currentStep) {
            case 1: // Essentials
                if (!logo) return setError('Please upload a startup logo.');
                if (!formData.title) return setError('Project Title is required.');
                if (!bannerImage) return setError('Banner Image is required.');
                return true;
            case 2: // Pitch
                if (!formData.description) return setError('Project Description is required.');
                if (!formData.problem) return setError('Problem Statement is required.');
                if (!formData.solution) return setError('Proposed Solution is required.');
                return true;
            case 3: // Market
                if (!formData.category) return setError('Category is required.');
                if (!formData.stage) return setError('Startup Stage is required.');
                if (!formData.targetCustomers) return setError('Target Customers information is required.');
                if (!formData.milestones) return setError('Milestones are required.');
                return true;
            case 4: // Team
                if (formData.projectType === 'Company' && !formData.companyName) return setError('Company Name is required.');
                if (formData.projectType === 'University' && !formData.university) return setError('University Name is required.');
                if (teamMembers.some(m => !m.name || !m.role)) return setError('Please fill in all team member details.');
                return true;
            case 5: // Media & Contact
                if (!pitchDeck) return setError('Pitch Deck (PDF) is required.');
                if (!formData.email) return setError('Email Address is required.');
                if (!formData.linkedIn) return setError('LinkedIn URL is required.');
                return true;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep((prev) => Math.min(prev + 1, totalSteps));
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        setStep((prev) => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        if (!validateStep(5)) return;

        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            // Prepare FormData for API
            const submissionData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                submissionData.append(key, value);
            });
            submissionData.append('teamMembers', JSON.stringify(teamMembers));
            if (pitchDeck) submissionData.append('pitchDeck', pitchDeck);
            if (logo) submissionData.append('logo', logo);
            if (bannerImage) submissionData.append('bannerImage', bannerImage);

            // Send to API
            const response = await fetch('/api/submit-startup', {
                method: 'POST',
                body: submissionData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Submission failed');
            }

            const result = await response.json();
            setSuccessMessage(result.message);
            window.scrollTo(0, 0);

        } catch (err: any) {
            setError(err.message || 'An error occurred while submitting your startup. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (successMessage) {
        return (
            <div className="container max-w-2xl mx-auto py-20 px-4 min-h-screen flex items-center justify-center">
                <Card className="border-green-200 bg-green-50 shadow-lg w-full">
                    <CardContent className="pt-10 pb-10 text-center">
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-green-800 mb-4">Submission Successful!</h2>
                        <p className="text-green-700 mb-8 text-lg">{successMessage}</p>
                        <Button onClick={() => router.push('/')} className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-full">
                            Return Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-20" suppressHydrationWarning>
            {/* Background decoration */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] rounded-full bg-purple-200/20 blur-3xl"></div>
                <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-blue-200/20 blur-3xl"></div>
            </div>

            {/* Header */}
            <div className="relative px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto z-10 text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                <Badge variant="outline" className="mb-4 bg-white/50 backdrop-blur-sm border-slate-200 text-slate-600 px-3 py-1">
                    🚀 Launch Your Vision
                </Badge>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                    Submit Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Startup</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Share your innovation with our community of investors and mentors.
                </p>
            </div>

            {/* Main Form Container */}
            <div className="relative z-10 max-w-4xl mx-auto px-4">
                <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl overflow-hidden p-6 md:p-10 transition-all duration-300">

                    {/* Progress Steps */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between relative">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <div key={s} className="flex flex-col items-center relative z-10 w-16 md:w-20">
                                    <div
                                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${step >= s
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110'
                                            : 'bg-white border-slate-200 text-slate-400'
                                            }`}
                                    >
                                        {step > s ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : s}
                                    </div>
                                    <span className={`text-[10px] md:text-xs mt-2 font-medium transition-colors duration-300 hidden sm:block ${step >= s ? 'text-blue-700' : 'text-slate-400'}`}>
                                        {s === 1 ? 'Basics' : s === 2 ? 'Pitch' : s === 3 ? 'Market' : s === 4 ? 'Team' : 'Media'}
                                    </span>
                                </div>
                            ))}
                            {/* Progress Bar */}
                            <div className="absolute top-4 md:top-5 left-0 w-full h-0.5 bg-slate-200 -z-10 rounded-full"></div>
                            <div
                                className="absolute top-4 md:top-5 left-0 h-0.5 bg-blue-600 -z-10 rounded-full transition-all duration-500 ease-in-out"
                                style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mb-6 animate-in shake">
                            <AlertTitle>Action Required</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Step Content */}
                    <div className="min-h-[400px]">
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-slate-900">The Essentials</h2>
                                    <p className="text-slate-500">Let's start with the visuals of your startup.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Startup Logo <span className="text-red-500">*</span></Label>
                                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50/80 transition-colors cursor-pointer group bg-white/50 h-64 relative overflow-hidden">
                                                <input
                                                    type="file"
                                                    id="logo"
                                                    accept="image/*"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    onChange={handleFileChange}
                                                />
                                                {logo ? (
                                                    <img
                                                        src={URL.createObjectURL(logo)}
                                                        alt="Logo preview"
                                                        className="w-full h-full object-contain p-2"
                                                    />
                                                ) : (
                                                    <>
                                                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                            <ImageIcon className="w-8 h-8 text-blue-600" />
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-700">Click to upload logo</p>
                                                        <p className="text-xs text-slate-400 mt-1">PNG, JPG (Max 2MB)</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-slate-700">Project Title <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="title"
                                                name="title"
                                                placeholder="e.g. EcoSphere"
                                                className="h-12 text-lg bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="banner" className="text-slate-700">Banner Image <span className="text-red-500">*</span></Label>
                                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-center text-center hover:bg-slate-50/80 transition-colors cursor-pointer bg-white/50 h-32 relative overflow-hidden">
                                                <input
                                                    type="file"
                                                    id="bannerImage"
                                                    accept="image/*"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    onChange={handleFileChange}
                                                />
                                                {bannerImage ? (
                                                    <img
                                                        src={URL.createObjectURL(bannerImage)}
                                                        alt="Banner preview"
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <Upload className="w-6 h-6 text-slate-400 mb-2" />
                                                        <span className="text-sm text-slate-500">Upload Banner (1200x400)</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-slate-900">The Pitch</h2>
                                    <p className="text-slate-500">Define the problem and your unique solution.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-slate-500" />
                                        Short Description <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        name="description"
                                        placeholder="A brief summary of your startup..."
                                        className="bg-white/50 border-slate-200 focus:border-blue-500 resize-none text-base"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-blue-500" />
                                            Problem Statement <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            name="problem"
                                            placeholder="What specific pain point are you solving?"
                                            className="min-h-[120px] bg-white/50 border-slate-200 focus:border-blue-500 resize-none text-base"
                                            value={formData.problem}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Rocket className="w-4 h-4 text-purple-500" />
                                            Proposed Solution <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            name="solution"
                                            placeholder="How does your product solve this uniquely?"
                                            className="min-h-[120px] bg-white/50 border-slate-200 focus:border-purple-500 resize-none text-base"
                                            value={formData.solution}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-slate-900">Market & Details</h2>
                                    <p className="text-slate-500">Who is this for and where are you at?</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Category <span className="text-red-500">*</span></Label>
                                        <Select onValueChange={(val) => handleSelectChange('category', val)} value={formData.category}>
                                            <SelectTrigger className="h-11 bg-white/50 border-slate-200">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Fintech">Fintech</SelectItem>
                                                <SelectItem value="AI/ML">AI/ML</SelectItem>
                                                <SelectItem value="E-commerce">E-commerce</SelectItem>
                                                <SelectItem value="IoT">IoT</SelectItem>
                                                <SelectItem value="EdTech">EdTech</SelectItem>
                                                <SelectItem value="HealthTech">HealthTech</SelectItem>
                                                <SelectItem value="Others">Others</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Current Stage <span className="text-red-500">*</span></Label>
                                        <Select onValueChange={(val) => handleSelectChange('stage', val)} value={formData.stage}>
                                            <SelectTrigger className="h-11 bg-white/50 border-slate-200">
                                                <SelectValue placeholder="Select Stage" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Ideation">Ideation</SelectItem>
                                                <SelectItem value="Prototyping">Prototyping</SelectItem>
                                                <SelectItem value="MVP">MVP</SelectItem>
                                                <SelectItem value="Early-Stage">Early-Stage</SelectItem>
                                                <SelectItem value="Growth">Growth</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4">
                                    <Label>Target Customers <span className="text-red-500">*</span></Label>
                                    <Input
                                        name="targetCustomers"
                                        placeholder="e.g. B2B SMEs, University Students"
                                        className="h-11 bg-white/50 border-slate-200"
                                        value={formData.targetCustomers}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Recent Milestones <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        name="milestones"
                                        placeholder="Share your recent wins, completed MVP, or key partnerships..."
                                        className="bg-white/50 border-slate-200"
                                        value={formData.milestones}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-slate-900">Team & Organization</h2>
                                    <p className="text-slate-500">Who is behind this innovation?</p>
                                </div>

                                <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 mb-6">
                                    <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Project Type</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {['University', 'Individual', 'Company'].map((type) => (
                                            <div
                                                key={type}
                                                onClick={() => handleSelectChange('projectType', type)}
                                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.projectType === type
                                                    ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                                                    : 'border-slate-200 bg-white hover:border-blue-400'
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.projectType === type ? 'border-blue-500' : 'border-slate-300'
                                                    }`}>
                                                    {formData.projectType === type && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                                </div>
                                                <span className={`text-sm font-medium ${formData.projectType === type ? 'text-blue-700' : 'text-slate-700'
                                                    }`}>{type === 'University' ? 'University Project' : type}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {formData.projectType === 'Company' && (
                                        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                            <Label>Company Name <span className="text-red-500">*</span></Label>
                                            <Input
                                                name="companyName"
                                                placeholder="Legal Entity Name"
                                                className="mt-1 bg-white"
                                                value={formData.companyName}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    )}

                                    {formData.projectType === 'University' && (
                                        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                            <Label>University Name <span className="text-red-500">*</span></Label>
                                            <Input
                                                name="university"
                                                placeholder="e.g. UM, UTM, USM"
                                                className="mt-1 bg-white"
                                                value={formData.university}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Team Members</Label>
                                        <Button variant="outline" size="sm" onClick={addTeamMember} className="h-8 text-xs">
                                            + Add Member
                                        </Button>
                                    </div>
                                    {teamMembers.map((member, index) => (
                                        <div key={index} className="flex gap-4 items-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm animate-in fade-in">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold shrink-0">
                                                {member.name ? member.name.charAt(0).toUpperCase() : <Users className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 grid grid-cols-2 gap-2">
                                                <Input
                                                    placeholder="Full Name"
                                                    className="h-9 text-sm"
                                                    value={member.name}
                                                    onChange={(e) => handleTeamChange(index, 'name', e.target.value)}
                                                />
                                                <Input
                                                    placeholder="Role (e.g. CEO)"
                                                    className="h-9 text-sm"
                                                    value={member.role}
                                                    onChange={(e) => handleTeamChange(index, 'role', e.target.value)}
                                                />
                                            </div>
                                            {teamMembers.length > 1 && (
                                                <Button variant="ghost" size="icon" onClick={() => removeTeamMember(index)} className="text-slate-400 hover:text-red-500 shrink-0">
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-slate-900">Media & Contact</h2>
                                    <p className="text-slate-500">Final touches to showcase your work.</p>
                                </div>

                                <Card className={`bg-blue-50/50 border transition-colors ${pitchDeck ? 'border-green-300 bg-green-50/50' : 'border-blue-100'}`}>
                                    <CardContent className="pt-6 relative">
                                        <input
                                            type="file"
                                            id="pitchDeck"
                                            accept=".pdf"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={handleFileChange}
                                        />
                                        <div className="flex flex-col items-center justify-center text-center space-y-4">
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${pitchDeck ? 'bg-green-100' : 'bg-blue-100'}`}>
                                                {pitchDeck ? <CheckCircle2 className="w-8 h-8 text-green-600" /> : <FileText className="w-8 h-8 text-blue-600" />}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-blue-900">
                                                    {pitchDeck ? pitchDeck.name : 'Upload Pitch Deck'}
                                                </h3>
                                                <p className="text-sm text-blue-700/80">
                                                    {pitchDeck ? 'File selected' : 'PDF Format (Max 10MB)'} <span className="text-red-500">*</span>
                                                </p>
                                            </div>
                                            <Button variant="outline" className="border-blue-200 hover:bg-blue-100 text-blue-700 pointer-events-none">
                                                {pitchDeck ? 'Change File' : 'Select File'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4 mt-6">
                                    <div className="space-y-2">
                                        <Label>Demo Video URL</Label>
                                        <Input
                                            name="demoVideoUrl"
                                            placeholder="https://youtube.com/..."
                                            className="bg-white/50 border-slate-200"
                                            value={formData.demoVideoUrl}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Email <span className="text-red-500">*</span></Label>
                                            <Input
                                                name="email"
                                                type="email"
                                                placeholder="contact@startup.com"
                                                className="bg-white/50 border-slate-200"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>LinkedIn <span className="text-red-500">*</span></Label>
                                            <Input
                                                name="linkedIn"
                                                placeholder="https://linkedin.com/..."
                                                className="bg-white/50 border-slate-200"
                                                value={formData.linkedIn}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Website (Optional)</Label>
                                        <Input
                                            name="website"
                                            placeholder="https://yourwebsite.com"
                                            className="bg-white/50 border-slate-200"
                                            value={formData.website}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-10 flex justify-between items-center pt-6 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={step === 1 || isSubmitting}
                            className={`text-slate-500 hover:text-slate-800 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>

                        {step === totalSteps ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-green-600 hover:bg-green-700 text-white px-8 h-12 rounded-lg shadow-lg shadow-green-500/20 text-base font-semibold transition-all hover:scale-105 active:scale-95"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    <>Submit Startup <Rocket className="w-4 h-4 ml-2" /></>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={nextStep}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-lg shadow-lg shadow-blue-500/20 text-base font-semibold transition-all hover:scale-105 active:scale-95"
                            >
                                Next Step <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
