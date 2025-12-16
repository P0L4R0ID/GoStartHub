'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { FundingOpportunity, Startup, Application } from '@/types';
import {
  ArrowLeft, DollarSign, Calendar, CheckCircle, Loader2, Send,
  AlertCircle, Building2, User, FileText, Info, Briefcase,
  MapPin, Globe, ChevronRight, ChevronLeft, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Steps for the wizard
const STEPS = [
  { id: 'project', label: 'Select Project' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'info', label: 'Informaton' },
  { id: 'focus', label: 'Focus Areas' },
  { id: 'review', label: 'Review' }
];

export default function FundingApplicationPage() {
  const params = useParams();
  const router = useRouter();

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data
  const [opportunity, setOpportunity] = useState<FundingOpportunity | null>(null);
  const [prototypes, setPrototypes] = useState<Startup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    prototypeId: '',
    message: '',
    // Personal
    fullName: '',
    icNumber: '',
    phoneNumber: '',
    country: 'Malaysia',
    // Company
    hasRegisteredCompany: false,
    companyName: '',
    companyWebsite: '',
    companyDescription: '',
    companyIncorporatedDate: '',
    officeAddress: '',
    hasOfficeInMalaysia: '' as 'yes' | 'no' | 'used-to-have' | 'thinking-about-it' | '',
    companyStage: '' as string,
    // Focus
    focusArea: [] as string[],
    technologyArea: [] as string[],
    proposedActivities: [] as string[],
    industryFocus: [] as string[],
  });

  useEffect(() => {
    setMounted(true);
    const session = storage.getSession();

    if (!session) {
      router.push(`/login?redirect=/funding/${params.id}/apply`);
      return;
    }

    const loadData = async () => {
      // 1. Load Opportunity
      const opportunities = storage.getFundingOpportunities();
      const found = opportunities.find((opp: FundingOpportunity) => opp.id === params.id);

      if (!found) {
        setError('Funding opportunity not found');
        setIsLoading(false);
        return;
      }
      setOpportunity(found);

      // 2. Load User Startups
      try {
        const res = await fetch(`/api/startups?status=all&innovatorId=${session.id}`);
        if (res.ok) {
          const data = await res.json();
          // Filter for active/approved/pending startups
          const activeStartups = (data.startups || []).filter((s: any) =>
            ['APPROVED', 'PENDING', 'active'].includes(s.status)
          );
          setPrototypes(activeStartups);

          // Auto-fill personal details from session if available
          setFormData(prev => ({
            ...prev,
            fullName: session.name || '',
            // prototypeId: activeStartups.length === 1 ? activeStartups[0].id : '' // Optional auto-select
          }));

        } else {
          console.error("Failed to load startups");
        }
      } catch (err) {
        console.error("Error loading startups", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [params.id, router]);

  const handleNext = () => {
    // Basic validation per step
    if (currentStep === 0 && !formData.prototypeId) {
      setError("Please select a project to proceed.");
      return;
    }
    if (currentStep === 1 && !formData.message.trim()) {
      setError("Please enter your proposal message.");
      return;
    }
    if (currentStep === 2) {
      if (!formData.fullName || !formData.icNumber || !formData.phoneNumber) {
        setError("Please fill in all required personal information.");
        return;
      }
      if (formData.hasRegisteredCompany && !formData.companyName) {
        setError("Please enter your company name.");
        return;
      }
    }

    setError(null);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const session = storage.getSession();
      if (!session) throw new Error("User not logged in");

      // Check duplicate application
      const existingApps = storage.getApplications();
      const isDuplicate = existingApps.some((app: Application) =>
        app.opportunityId === params.id && app.innovatorId === session.id && app.status !== 'rejected'
      );

      if (isDuplicate) {
        setError("You have already applied for this opportunity.");
        setIsSubmitting(false);
        return;
      }

      // Filter out empty strings for optional enum fields
      const applicationData: Partial<Application> = {
        fullName: formData.fullName,
        icNumber: formData.icNumber,
        phoneNumber: formData.phoneNumber,
        country: formData.country,
        hasRegisteredCompany: formData.hasRegisteredCompany,
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite,
        companyDescription: formData.companyDescription,
        companyIncorporatedDate: formData.companyIncorporatedDate,
        officeAddress: formData.officeAddress,
        focusArea: formData.focusArea,
        technologyArea: formData.technologyArea,
        proposedActivities: formData.proposedActivities,
        industryFocus: formData.industryFocus,
      };

      // Only add these if they have valid values (not empty strings)
      if (formData.hasOfficeInMalaysia) {
        applicationData.hasOfficeInMalaysia = formData.hasOfficeInMalaysia as 'yes' | 'no' | 'used-to-have' | 'thinking-about-it';
      }
      if (formData.companyStage) {
        applicationData.companyStage = formData.companyStage as Application['companyStage'];
      }

      const newApplication: Application = {
        id: Date.now().toString(),
        opportunityId: params.id as string,
        startupId: formData.prototypeId,
        innovatorId: session.id,
        innovatorName: session.name,
        innovatorEmail: session.email,
        status: 'pending',
        message: formData.message,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...applicationData
      };

      // 1. Save to Local Storage (Applications)
      storage.saveApplications([...existingApps, newApplication]);

      // 2. Update Opportunity (add application ID)
      if (opportunity) {
        const allOpps = storage.getFundingOpportunities();
        const oppIndex = allOpps.findIndex((o: FundingOpportunity) => o.id === opportunity.id);
        if (oppIndex !== -1) {
          if (!allOpps[oppIndex].applications) allOpps[oppIndex].applications = [];
          allOpps[oppIndex].applications.push(newApplication.id);
          storage.saveFundingOpportunities(allOpps);
        }
      }

      // 3. API Call (Mock)
      await fetch('/api/funding-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApplication),
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2500);

    } catch (err) {
      console.error(err);
      setError("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelection = (field: 'focusArea' | 'technologyArea', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  if (!mounted || isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (!opportunity) return <div>Opportunity not found</div>;
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-xl animate-in zoom-in-95 duration-500">
          <CardContent className="pt-10 pb-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
            <p className="text-slate-600 mb-8">
              Your application for <strong>{opportunity.title}</strong> has been received. We will notify you once it has been reviewed.
            </p>
            <Link href="/dashboard">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedPrototype = prototypes.find(p => p.id === formData.prototypeId);
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 py-8 font-sans">

      {/* Top Navigation */}
      <div className="container mx-auto px-4 mb-8">
        <Link href="/funding" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Funding
        </Link>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Opportunity Details (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card className="border-0 shadow-lg shadow-blue-900/5 bg-white overflow-hidden rounded-2xl">
              <div className="h-32 bg-gradient-to-br from-blue-600 to-purple-600 p-6 flex items-end">
                <div className="w-full">
                  <h2 className="text-white text-xl font-bold leading-tight shadow-black/10 drop-shadow-md">{opportunity.title}</h2>
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Provided By</p>
                  <div className="flex items-center gap-2 font-medium text-slate-900">
                    <Building2 className="w-4 h-4 text-blue-500" /> {opportunity.providerName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Funding Amount</p>
                    <p className="font-bold text-slate-900 text-lg">
                      {new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(opportunity.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Deadline</p>
                    <p className="font-bold text-slate-900">
                      {new Date(opportunity.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="font-semibold text-sm mb-3">Requirements</h4>
                  <ul className="space-y-2">
                    {opportunity.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN: Application Wizard */}
        <div className="lg:col-span-2">

          {/* Progress Header */}
          <div className="mb-8">
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
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-md min-h-[500px] flex flex-col">
            <CardContent className="p-8 flex-1 flex flex-col">

              {/* STEP 1: PROJECT SELECTION */}
              {currentStep === 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Which project are you applying for?</h2>
                    <p className="text-slate-500">Select one of your existing startups.</p>
                  </div>

                  {prototypes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {prototypes.map(p => (
                        <div
                          key={p.id}
                          onClick={() => setFormData({ ...formData, prototypeId: p.id })}
                          className={`
                                       cursor-pointer rounded-xl p-4 border-2 transition-all duration-200
                                       ${formData.prototypeId === p.id
                              ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/20'
                              : 'border-slate-100 bg-white hover:border-blue-300 hover:shadow-md'}
                                    `}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.prototypeId === p.id ? 'bg-blue-200' : 'bg-slate-100'}`}>
                              <Briefcase className={`w-5 h-5 ${formData.prototypeId === p.id ? 'text-blue-700' : 'text-slate-500'}`} />
                            </div>
                            {formData.prototypeId === p.id && <CheckCircle className="w-5 h-5 text-blue-600" />}
                          </div>
                          <h4 className="font-bold text-slate-900">{p.title}</h4>
                          <p className="text-sm text-slate-500">{p.category} • {p.stage}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <p className="text-slate-600 mb-4">You don't have any eligible projects.</p>
                      <Link href="/submit-startup">
                        <Button variant="outline">Create a New Startup</Button>
                      </Link>
                    </div>
                  )}
                  <p className="text-center text-sm text-slate-400 mt-4">Only approved or pending projects can apply.</p>
                </div>
              )}

              {/* STEP 2: PROPOSAL */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Why do you need this funding?</h2>
                    <p className="text-slate-500">Provide a comprehensive proposal or executive summary.</p>
                  </div>

                  <div className="flex-1">
                    <Label className="mb-2 block">Proposal / Message</Label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your project's goals, market potential, and how you will use the funds..."
                      className="h-full min-h-[300px] resize-none text-base p-4"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: INFORMATION */}
              {currentStep === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-500" /> Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name (as per IC)</Label>
                        <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>IC Number / Passport</Label>
                        <Input value={formData.icNumber} onChange={(e) => setFormData({ ...formData, icNumber: e.target.value })} placeholder="e.g. 900101-14-5566" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Select value={formData.country} onValueChange={(val) => setFormData({ ...formData, country: val })}>
                          <SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Malaysia">Malaysia</SelectItem>
                            <SelectItem value="Singapore">Singapore</SelectItem>
                            <SelectItem value="Indonesia">Indonesia</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-purple-500" /> Company Information
                    </h3>

                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="hasCompany"
                        checked={formData.hasRegisteredCompany}
                        onCheckedChange={(c) => setFormData({ ...formData, hasRegisteredCompany: c === true })}
                      />
                      <Label htmlFor="hasCompany">I have a registered company</Label>
                    </div>

                    {formData.hasRegisteredCompany && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-slate-100">
                        <div className="space-y-2">
                          <Label>Company Name</Label>
                          <Input value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Website</Label>
                          <Input value={formData.companyWebsite} onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })} placeholder="https://" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Office Address</Label>
                          <Textarea rows={2} value={formData.officeAddress} onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: FOCUS AREAS */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Focus Areas</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Digital Trade', 'Digital Cities', 'FinTech', 'HealthTech', 'EdTech', 'GreenTech', 'AgriTech', 'IoT'].map(area => (
                        <Badge
                          key={area}
                          variant={formData.focusArea.includes(area) ? 'default' : 'outline'}
                          className={`cursor-pointer px-4 py-2 text-sm ${formData.focusArea.includes(area) ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-slate-100'}`}
                          onClick={() => toggleSelection('focusArea', area)}
                        >
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Technology Stack</Label>
                    <div className="flex flex-wrap gap-2">
                      {['AI / ML', 'Blockchain', 'Cloud Computing', 'Big Data', 'Cybersecurity', 'Robotics', 'AR / VR', '5G'].map(tech => (
                        <Badge
                          key={tech}
                          variant={formData.technologyArea.includes(tech) ? 'default' : 'outline'}
                          className={`cursor-pointer px-4 py-2 text-sm ${formData.technologyArea.includes(tech) ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-slate-100'}`}
                          onClick={() => toggleSelection('technologyArea', tech)}
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Review Application</h2>
                    <p className="text-slate-500">Please verify your details before submitting.</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-6 space-y-4 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500">Project:</span>
                      <span className="col-span-2 font-semibold text-slate-900">{selectedPrototype?.title || 'Unknown'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500">Applicant:</span>
                      <span className="col-span-2 font-semibold text-slate-900">{formData.fullName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500">Contact:</span>
                      <span className="col-span-2 font-semibold text-slate-900">{formData.phoneNumber}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-500">Company:</span>
                      <span className="col-span-2 font-semibold text-slate-900">{formData.hasRegisteredCompany ? formData.companyName : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-2">Proposal</h4>
                    <p className="text-slate-600 text-sm line-clamp-6 italic">"{formData.message}"</p>
                  </div>
                </div>
              )}

            </CardContent>

            <div className="p-6 border-t border-slate-100 bg-white/50 flex justify-between rounded-b-xl">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0 || isSubmitting}
                className="text-slate-500 hover:text-slate-900"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>

              {currentStep === STEPS.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Submit Application</>
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
  );
}
