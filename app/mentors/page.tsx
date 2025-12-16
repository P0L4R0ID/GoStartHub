'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Briefcase, Search, Clock, Star, Zap, ArrowUpRight, Filter, Globe, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MentorshipRequestDialog from '@/components/MentorshipRequestDialog';
import { Input } from '@/components/ui/input';

interface Mentor {
  id: string;
  name: string | null;
  email: string;
  isDisabled: boolean;
  mentorProfile: {
    bio: string;
    expertise: string;
    experience: string;
    company: string | null;
    availability: string;
    profileImage: string | null;
    linkedin?: string;
    mentorType?: string;
    languages?: string;
  } | null;
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<{ id: string; name: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filters = ['All', 'Product', 'Fundraising', 'Engineering', 'Marketing', 'Sales', 'Design', 'Strategy'];

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await fetch('/api/mentors');
      if (response.ok) {
        const data = await response.json();
        setMentors(data.mentors || []);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseExpertise = (expertise: string | string[]): string[] => {
    if (Array.isArray(expertise)) return expertise;
    try {
      const parsed = JSON.parse(expertise);
      return Array.isArray(parsed) ? parsed : [expertise];
    } catch {
      return expertise.split(',').map(e => e.trim());
    }
  };

  const parseLanguages = (languages: string | string[] | undefined | null): string[] => {
    if (!languages) return [];
    if (Array.isArray(languages)) return languages;
    try {
      const parsed = JSON.parse(languages);
      return Array.isArray(parsed) ? parsed : [languages];
    } catch {
      return languages.split(',').map(l => l.trim());
    }
  };

  const handleRequestMentorship = (mentor: Mentor) => {
    setSelectedMentor({ id: mentor.id, name: mentor.name || 'Mentor' });
    setDialogOpen(true);
  };

  const filteredMentors = mentors.filter((mentor) => {
    if (!mentor.mentorProfile) return false;

    const expertiseList = parseExpertise(mentor.mentorProfile.expertise);
    const profile = mentor.mentorProfile;

    // Search Filter
    const matchesSearch =
      (mentor.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      profile.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expertiseList.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (profile.company?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (profile.mentorType?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    // Category Filter
    const matchesCategory = activeFilter === 'All' ||
      expertiseList.some(exp => exp.toLowerCase().includes(activeFilter.toLowerCase())) ||
      (profile.mentorType?.toLowerCase() || '').includes(activeFilter.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-20">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-emerald-200/20 blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-blue-200/20 blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-7xl">

        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <Badge variant="outline" className="mb-4 bg-white/50 backdrop-blur-sm border-emerald-200 text-emerald-700 px-3 py-1">
            <Star className="w-3 h-3 mr-1 fill-emerald-500 text-emerald-500" />
            World-Class Mentors
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
            Accelerate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Growth</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl">
            Connect with industry leaders who have walked the path. Get personalized guidance for your startup journey.
          </p>

          {/* Search Bar */}
          <div className="mt-8 w-full max-w-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative flex items-center bg-white rounded-full shadow-lg border border-slate-100 p-2 pl-6">
              <Search className="w-5 h-5 text-slate-400 mr-3" />
              <input
                type="text"
                placeholder="Search by name, company, or expertise..."
                className="flex-1 bg-transparent border-none focus:outline-none text-lg text-slate-700 placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button className="rounded-full px-6 py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-base transition-all hover:scale-105 hidden sm:flex">
                Find Mentor
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-8 animate-in fade-in slide-in-from-bottom-2 delay-100">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === filter
                  ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Mentors Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredMentors.length === 0 ? (
          <Card className="text-center py-16 bg-white/60 backdrop-blur border-dashed border-2">
            <CardContent>
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No mentors found</h3>
              <p className="text-slate-500">Try adjusting your search terms or filters.</p>
              <Button
                variant="link"
                onClick={() => { setSearchTerm(''); setActiveFilter('All'); }}
                className="mt-4 text-emerald-600"
              >
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            {filteredMentors.map((mentor) => {
              const profile = mentor.mentorProfile!;
              const expertiseList = parseExpertise(profile.expertise);
              const isAvailable = !mentor.isDisabled && profile.availability === 'available';

              return (
                <div key={mentor.id} className="group relative">
                  {/* Hover Effect Background */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <Card className="h-full border border-white/60 bg-white/60 backdrop-blur-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group-hover:border-emerald-100/50 flex flex-col">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          {profile.profileImage ? (
                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-inner ring-2 ring-white shrink-0">
                              <img src={profile.profileImage} alt={mentor.name || 'Mentor'} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl"></div>
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shadow-inner ring-2 ring-white shrink-0">
                              <User className="h-8 w-8 text-emerald-600" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex flex-col">
                              <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors truncate">{mentor.name || 'Anonymous'}</h3>
                              {profile.mentorType && (
                                <span className="text-xs font-semibold text-emerald-600 mb-0.5">{profile.mentorType}</span>
                              )}
                            </div>

                            {profile.company && (
                              <p className="text-sm font-medium text-slate-500 flex items-center truncate">
                                <Briefcase className="w-3 h-3 mr-1 shrink-0" /> {profile.company}
                              </p>
                            )}
                            <div className="flex items-center mt-1 space-x-2">
                              {/* Experience Badge */}
                              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-yellow-100 text-yellow-800 border-yellow-200 shadow-none">
                                {profile.experience}Y Exp
                              </Badge>
                              {/* LinkedIn Button */}
                              {profile.linkedin && (
                                <a
                                  href={profile.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-400 hover:text-[#0077b5] transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Linkedin className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-3 h-3 rounded-full shadow-sm ring-2 ring-white shrink-0 ${isAvailable ? 'bg-emerald-500' : 'bg-orange-400'}`}
                          title={isAvailable ? 'Available' : 'Busy'}
                        ></div>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-4 flex-1 space-y-4">
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                        {profile.bio}
                      </p>

                      {/* Languages */}
                      {(() => {
                        const langList = parseLanguages(profile.languages);
                        return langList.length > 0 && (
                          <div className="flex items-start gap-2 text-xs text-slate-500">
                            <Globe className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span className="line-clamp-1">{langList.join(', ')}</span>
                          </div>
                        );
                      })()}

                      {/* Expertise Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {expertiseList.slice(0, 4).map((exp, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                            {exp}
                          </span>
                        ))}
                        {expertiseList.length > 4 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-100">
                            +{expertiseList.length - 4}
                          </span>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2 gap-2">
                      <Link href={`/mentors/${mentor.id}`} className="flex-1">
                        <Button variant="outline" className="w-full h-10 border-slate-200 hover:bg-slate-50 hover:text-slate-900">
                          View Profile
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handleRequestMentorship(mentor)}
                        disabled={mentor.isDisabled}
                        className={`flex-1 h-10 font-semibold shadow-sm transition-all ${!mentor.isDisabled
                          ? 'bg-slate-900 text-white hover:bg-emerald-600'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-100 cursor-not-allowed'
                          }`}
                      >
                        {!mentor.isDisabled ? (
                          <>Request <ArrowUpRight className="w-4 h-4 ml-2" /></>
                        ) : (
                          'Busy'
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-16 text-center animate-in fade-in delay-300">
          <div className="inline-flex items-center p-1 rounded-full bg-slate-100/80 border border-slate-200 backdrop-blur-sm">
            <span className="px-3 py-1 text-sm text-slate-600">Want to help startups grow?</span>
            <a href="/mentor/apply" className="px-4 py-1.5 rounded-full bg-white text-emerald-700 font-semibold text-sm shadow-sm border border-slate-100 hover:text-emerald-800 hover:shadow-md transition-all">
              Apply to be a Mentor
            </a>
          </div>
        </div>

      </div>

      {/* Dialog */}
      {selectedMentor && (
        <MentorshipRequestDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          mentorId={selectedMentor.id}
          mentorName={selectedMentor.name || 'Mentor'}
        />
      )}
    </div>
  );
}
