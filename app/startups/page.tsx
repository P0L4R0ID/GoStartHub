'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { storage } from '@/lib/storage';
import { Startup } from '@/types';
import { Search, Eye, Heart, TrendingUp, ArrowRight, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function StartupsPageContent() {
  const searchParams = useSearchParams();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setMounted(true);
    const fetchStartups = async () => {
      try {
        // Fetch from API (Database)
        const response = await fetch('/api/startups?status=APPROVED');
        if (response.ok) {
          const data = await response.json();

          // Map database startups to frontend Startup type
          const dbStartups = data.startups.map((s: any) => {
            const team = JSON.parse(s.teamMembers || '[]');
            const innovatorName = team.length > 0 ? team[0].name : 'Unknown Innovator';

            return {
              id: s.id,
              title: s.title,
              description: s.description,
              category: s.category,
              stage: s.stage,
              projectType: s.projectType.toLowerCase(),
              companyName: s.companyName,
              university: s.university,
              innovatorName: innovatorName,
              innovatorId: 'db-user', // Placeholder
              views: s.views,
              likes: s.likes,
              // Use bannerImage from database, fallback to placeholder
              images: s.bannerImage ? [s.bannerImage] : [],
              image: s.bannerImage || null,
              logo: s.logo || null,
              bannerImage: s.bannerImage || null,
              tags: [s.category, s.stage],
              createdAt: s.createdAt,
              updatedAt: s.updatedAt,
              status: 'active',
              pitchPdf: s.pitchDeck,
              team: {
                founders: team,
              },
              profile: {
                generalInfo: { description: s.description },
                contactInfo: {
                  email: s.contactEmail,
                  url: s.contactWebsite,
                  linkedin: s.contactLinkedIn
                }
              }
            };
          });

          setStartups(dbStartups);
        }
      } catch (error) {
        console.error('Failed to fetch startups', error);
        // Fallback to local storage
        const localStartups = storage.getStartups();
        setStartups(localStartups);
      }
    };

    fetchStartups();
  }, []);

  const categories = ['all', 'IoT & Hardware', 'AI & Machine Learning', 'Software', 'Sustainability', 'Healthcare', 'Retail & Marketplace', 'Food & Beverage'];
  const projectTypes = ['all', 'uni', 'individual', 'company'];
  const stages = ['all', 'pre-stage', 'early-stage', 'mid-stage', 'late-stage'];
  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'views-desc', label: 'Most Views' },
    { value: 'likes-desc', label: 'Most Likes' },
    { value: 'stage-asc', label: 'Stage: Early to Late' },
  ];

  const filteredAndSortedStartups = useMemo(() => {
    let filtered = [...startups];

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(s => s.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    }

    // Project type filter
    if (projectTypeFilter !== 'all') {
      filtered = filtered.filter(s => {
        if (projectTypeFilter === 'uni') {
          return s.projectType === 'uni' || s.university !== undefined;
        }
        return s.projectType === projectTypeFilter;
      });
    }

    // Stage filter
    if (stageFilter !== 'all') {
      filtered = filtered.filter(s => {
        const stage = s.growthStage || (s.profile?.growthStage ?
          s.profile.growthStage.toLowerCase().replace(' ', '-') + '-stage' :
          'pre-stage');
        return stage === stageFilter;
      });
    }

    // Sorting
    if (sortBy !== 'default') {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'views-desc':
            return (b.views || 0) - (a.views || 0);
          case 'likes-desc':
            return (b.likes || 0) - (a.likes || 0);
          case 'stage-asc': {
            const stageOrder = { 'pre-stage': 1, 'early-stage': 2, 'mid-stage': 3, 'late-stage': 4 };
            const aStage = a.growthStage || 'pre-stage';
            const bStage = b.growthStage || 'pre-stage';
            return (stageOrder[aStage as keyof typeof stageOrder] || 1) - (stageOrder[bStage as keyof typeof stageOrder] || 1);
          }
          default:
            return 0;
        }
      });
    }

    // User filter - only check on client side after mounting
    const userFilter = searchParams.get('filter');

    if (mounted && userFilter === 'my') {
      const session = storage.getSession();
      if (session) {
        filtered = filtered.filter(s => s.innovatorId === session.id);
      }
    }

    return filtered;
  }, [startups, searchQuery, categoryFilter, projectTypeFilter, stageFilter, sortBy, searchParams, mounted]);

  // Determine if a startup is trending
  const isTrending = (s: Startup) =>
    ((s.views || 0) > 200 && (s.likes || 0) > 20) || ((s.views || 0) > 500);

  return (
    <div className="min-h-screen bg-slate-50 font-sans" suppressHydrationWarning>
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] rounded-full bg-purple-200/20 blur-3xl"></div>
        <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-blue-200/20 blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-white/50 backdrop-blur-sm text-slate-600 hover:bg-white/80 mb-4">
            ✨ Innovation Showcase
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Future</span> Unicorns
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore innovative startups from young innovators across Malaysia. Connect, collaborate, and grow.
          </p>

          {/* Search Bar Container */}
          <div className="mt-8 relative max-w-2xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative flex items-center bg-white rounded-xl shadow-xl p-2 border border-slate-100">
              <div className="pl-4 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search for startups, industries, or technologies..."
                className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 focus:outline-none text-slate-900 placeholder-slate-400 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button size="lg" className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-6">
                Search
              </Button>
            </div>
          </div>

          {/* Quick Filters - Top Categories */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {categories.slice(0, 5).map((category, i) => (
              <button
                key={i}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${categoryFilter === category
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
              >
                {category === 'all' ? 'All Industries' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24 z-10">

        {/* Advanced Filters Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/50 p-4 rounded-xl border border-slate-100 backdrop-blur-sm">
          {/* Category Dropdown (Full list) */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Category</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c === 'all' ? 'All Categories' : c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Project Type</label>
            <Select value={projectTypeFilter} onValueChange={setProjectTypeFilter}>
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {projectTypes.map(t => (
                  <SelectItem key={t} value={t}>{t === 'all' ? 'All Types' : t === 'uni' ? 'University' : t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Stage</label>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                {stages.map(s => (
                  <SelectItem key={s} value={s}>{s === 'all' ? 'All Stages' : s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Showing {filteredAndSortedStartups.length} Results
          </h2>
          <div className="flex items-center gap-3">
            <Link href="/submit-startup" className="inline-flex items-center justify-center bg-slate-900 text-white hover:bg-slate-800 h-9 px-4 rounded-full text-sm font-medium transition-colors shadow-sm">
              + Showcase Startup
            </Link>
          </div>
        </div>

        {/* Startups Grid */}
        {filteredAndSortedStartups.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-lg mb-4">No startups found matching your criteria.</p>
            <Button onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedStartups.map((startup) => (
              <Link key={startup.id} href={`/startups/${startup.id}`} className="block h-full">
                <div className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 hover:-translate-y-1 h-full flex flex-col">
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden shrink-0 bg-slate-100">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 transition-opacity duration-300 opacity-60 group-hover:opacity-40"></div>
                    {startup.bannerImage ? (
                      <img
                        src={startup.bannerImage}
                        alt={startup.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect fill="%23f1f5f9" width="400" height="200"/%3E%3Ctext fill="%2394a3b8" font-family="sans-serif" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200">
                        <span className="text-2xl font-bold text-slate-300">{startup.title.charAt(0)}</span>
                      </div>
                    )}

                    <div className="absolute top-4 left-4 z-20">
                      <Badge className="bg-white/90 text-slate-900 hover:bg-white backdrop-blur-md border-0 shadow-sm">
                        {startup.category}
                      </Badge>
                    </div>
                    {isTrending(startup) && (
                      <div className="absolute top-4 right-4 z-20">
                        <Badge className="bg-orange-500/90 text-white hover:bg-orange-600 backdrop-blur-md border-0 shadow-sm flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Trending
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Startup Logo (Overlapping) */}
                  <div className="absolute top-36 right-6 z-20">
                    <div className="w-16 h-16 rounded-xl bg-white p-1.5 shadow-lg shadow-slate-200/50 transform group-hover:rotate-6 transition-transform duration-300">
                      {startup.logo ? (
                        <img src={startup.logo} alt="Logo" className="w-full h-full object-cover rounded-lg bg-slate-50" />
                      ) : (
                        <div className="w-full h-full rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl">
                          {startup.title.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-10 pb-6 px-6 flex-1 flex flex-col">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1 pr-16">
                        <h3 className="text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {startup.title}
                        </h3>
                      </div>
                      <Badge variant="outline" className="text-xs font-normal text-slate-500 border-slate-200">
                        {startup.stage}
                      </Badge>
                    </div>

                    <p className="text-slate-600 text-sm line-clamp-2 mb-6 h-10 leading-relaxed">
                      {startup.description}
                    </p>

                    <div className="mt-auto"> {/* Spacer to push footer down */}
                      {/* Footer Stats & Action */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-4 text-slate-500 text-sm">
                          <div className="flex items-center gap-1.5 group/stat hover:text-blue-600 transition-colors">
                            <Eye className="w-4 h-4" />
                            <span className="font-semibold">{startup.views || 0}</span>
                          </div>
                          <div className="flex items-center gap-1.5 group/stat hover:text-pink-600 transition-colors">
                            <Heart className="w-4 h-4 group-hover/stat:fill-pink-600 transition-all" />
                            <span className="font-semibold">{startup.likes || 0}</span>
                          </div>
                        </div>

                        <span className="text-sm font-semibold text-blue-600 flex items-center gap-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          View Project <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StartupsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-8 bg-slate-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="h-64 bg-white animate-pulse rounded-lg shadow-sm" />
          <div className="grid grid-cols-3 gap-8 mt-8">
            <div className="h-96 bg-white animate-pulse rounded-2xl shadow-sm" />
            <div className="h-96 bg-white animate-pulse rounded-2xl shadow-sm" />
            <div className="h-96 bg-white animate-pulse rounded-2xl shadow-sm" />
          </div>
        </div>
      </div>
    }>
      <StartupsPageContent />
    </Suspense>
  );
}
