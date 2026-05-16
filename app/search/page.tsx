'use client';

import { useState, useEffect, useMemo } from 'react';
import { storage } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Eye, Heart, GraduationCap, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [searchType, setSearchType] = useState<'startups' | 'mentors' | 'programmes' | 'events' | 'all'>('all');

  const startups = useMemo(() => storage.getStartups(), []);
  const mentors = useMemo(() => storage.getMentors(), []);
  const programmes = useMemo(() => storage.getProgrammes(), []);
  const events = useMemo(() => storage.getEvents(), []);

  const filteredResults = useMemo(() => {
    let results: any[] = [];

    if (searchType === 'all' || searchType === 'startups') {
      let filtered = startups.filter((s: any) => {
        const matchesSearch = !searchTerm || 
          s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
        const matchesType = typeFilter === 'all' || s.projectType === typeFilter;
        const matchesStage = stageFilter === 'all' || s.growthStage === stageFilter;
        return matchesSearch && matchesCategory && matchesType && matchesStage;
      });

      if (sortBy === 'views-desc') filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
      if (sortBy === 'likes-desc') filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      if (sortBy === 'date-desc') filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      results.push(...filtered.map((s: any) => ({ ...s, resultType: 'startup' })));
    }

    if (searchType === 'all' || searchType === 'mentors') {
      const filtered = mentors.filter((m: any) => {
        return !searchTerm ||
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.expertise.some((e: string) => e.toLowerCase().includes(searchTerm.toLowerCase()));
      });
      results.push(...filtered.map((m: any) => ({ ...m, resultType: 'mentor' })));
    }

    if (searchType === 'all' || searchType === 'programmes') {
      const filtered = programmes.filter((p: any) => {
        return !searchTerm ||
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase());
      });
      results.push(...filtered.map((p: any) => ({ ...p, resultType: 'programme' })));
    }

    if (searchType === 'all' || searchType === 'events') {
      const filtered = events.filter((e: any) => {
        return !searchTerm ||
          e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.description.toLowerCase().includes(searchTerm.toLowerCase());
      });
      results.push(...filtered.map((e: any) => ({ ...e, resultType: 'event' })));
    }

    return results;
  }, [searchTerm, categoryFilter, typeFilter, stageFilter, sortBy, searchType, startups, mentors, programmes, events]);

  const categories = ['all', ...Array.from(new Set(startups.map((s: any) => s.category)))];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-5 w-5 sm:h-6 sm:w-6" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Advanced Search</h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Find startups, mentors, programmes, and events
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 border-2">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for startups, mentors, programmes, events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search Type</label>
                <Select value={searchType} onValueChange={(v: any) => setSearchType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="startups">Startups</SelectItem>
                    <SelectItem value="mentors">Mentors</SelectItem>
                    <SelectItem value="programmes">Programmes</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {searchType === 'all' || searchType === 'startups' ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="uni">University</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Stage</label>
                    <Select value={stageFilter} onValueChange={setStageFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pre-stage">Pre-Stage</SelectItem>
                        <SelectItem value="early-stage">Early Stage</SelectItem>
                        <SelectItem value="mid-stage">Mid Stage</SelectItem>
                        <SelectItem value="late-stage">Late Stage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : null}

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="views-desc">Most Views</SelectItem>
                    <SelectItem value="likes-desc">Most Likes</SelectItem>
                    <SelectItem value="date-desc">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div>
          <div className="mb-4">
            <p className="text-muted-foreground">
              Found <span className="font-bold text-foreground">{filteredResults.length}</span> results
            </p>
          </div>

          <div className="space-y-4">
            {filteredResults.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground">No results found. Try adjusting your filters.</p>
                </CardContent>
              </Card>
            ) : (
              filteredResults.map((result: any) => (
                <Card key={result.id} className="border-2 hover-lift">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle>{result.title || result.name}</CardTitle>
                          <Badge variant="outline">{result.resultType}</Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {result.description || result.bio}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 flex-wrap">
                      {result.resultType === 'startup' && (
                        <>
                          {result.university && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <GraduationCap className="h-4 w-4" />
                              {result.university}
                            </div>
                          )}
                          {result.companyName && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Building2 className="h-4 w-4" />
                              {result.companyName}
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {result.views || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {result.likes || 0}
                            </div>
                          </div>
                          <Badge variant="outline">{result.category}</Badge>
                        </>
                      )}
                      {result.resultType === 'mentor' && (
                        <>
                          <Badge variant="outline">{result.company}</Badge>
                          <div className="flex flex-wrap gap-1">
                            {result.expertise.slice(0, 3).map((exp: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {exp}
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                  <CardContent className="pt-0">
                    <Link
                      href={
                        result.resultType === 'startup'
                          ? `/startups/${result.id}`
                          : result.resultType === 'mentor'
                          ? '/mentors'
                          : result.resultType === 'programme'
                          ? `/programmes/${result.id}`
                          : `/events/${result.id}`
                      }
                    >
                      <Button variant="outline">View Details</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

