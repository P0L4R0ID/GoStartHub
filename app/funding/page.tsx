'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { FundingOpportunity } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, ArrowRight, Star, Clock, Building2, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function FundingPage() {
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [filter, setFilter] = useState<string>('open');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const allOpportunities = storage.getFundingOpportunities();
    // Sort: featured first, then by amount (descending)
    const sorted = allOpportunities.sort((a: any, b: any) => {
      const aFeatured = (a.featured || false) ? 1 : 0;
      const bFeatured = (b.featured || false) ? 1 : 0;
      if (aFeatured !== bFeatured) return bFeatured - aFeatured;
      return (b.amount || 0) - (a.amount || 0);
    });
    setOpportunities(sorted);
  }, []);

  const filteredOpportunities = filter === 'all'
    ? opportunities
    : opportunities.filter(opp => opp.status === filter);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(amount);
  };

  const daysRemaining = (deadline: string) => {
    if (!mounted) return 0;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-20">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full bg-yellow-200/20 blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-200/20 blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-7xl">

        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <Badge variant="outline" className="mb-4 bg-white/50 backdrop-blur-sm border-yellow-500/50 text-yellow-700 px-3 py-1">
            <TrendingUp className="w-3 h-3 mr-1" />
            Secure Your Runway
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
            Funding <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">Opportunities</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl">
            Explore grants, equity investments, and loans tailored for Malaysian startups.
          </p>

          {/* Filter Tabs */}
          <div className="flex bg-slate-200/50 p-1 rounded-full mt-8 backdrop-blur-sm">
            {['open', 'closed', 'all'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all capitalize ${filter === f
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Opportunities List */}
        {filteredOpportunities.length === 0 ? (
          <Card className="text-center py-12 max-w-2xl mx-auto bg-white/60 backdrop-blur border-dashed">
            <CardContent>
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-muted-foreground mb-4 font-medium">No funding opportunities found at the moment.</p>
              <Button onClick={() => setFilter('all')} variant="link" className="text-yellow-600">
                View All Opportunities
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            {filteredOpportunities.map((opp) => {
              const timeLeft = daysRemaining(opp.deadline);
              const isClosed = opp.status !== 'open';

              return (
                <div key={opp.id} className="group relative">
                  {/* Hover Glow */}
                  <div className={`absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur ${opp.featured ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-blue-400 to-purple-400'}`}></div>

                  <Card className={`relative h-full border-0 bg-white/80 backdrop-blur-xl shadow-sm group-hover:shadow-xl transition-all duration-300 overflow-hidden ${opp.featured ? 'ring-2 ring-yellow-500/20' : ''}`}>
                    {opp.featured && (
                      <div className="absolute top-0 right-0 z-10">
                        <div className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center shadow-sm">
                          <Star className="w-3 h-3 mr-1 fill-white" /> Featured
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 md:p-8 flex-1">
                        <div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-500">
                          <Building2 className="w-4 h-4" />
                          {opp.providerName}
                          {opp.officialUrl && (
                            <a href={opp.officialUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center text-blue-600 hover:underline">
                              Official Link <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                          {opp.title}
                        </h3>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                          {opp.description}
                        </p>

                        {/* Requirements List (Preserving Functionality) */}
                        {opp.requirements && opp.requirements.length > 0 && (
                          <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">Requirements</div>
                            <ul className="space-y-1">
                              {opp.requirements.map((req, idx) => (
                                <li key={idx} className="text-sm text-slate-600 flex items-start">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-green-500 mt-0.5 shrink-0" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4">
                          <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-700 px-3 py-1">
                            {opp.category}
                          </Badge>
                          <div className={`flex items-center text-sm font-medium ${timeLeft < 30 ? 'text-orange-600' : 'text-slate-600'}`}>
                            <Clock className="w-4 h-4 mr-1.5" />
                            {isClosed
                              ? 'Closed'
                              : timeLeft > 365
                                ? 'Year-round'
                                : `${timeLeft} days left`
                            }
                          </div>
                          {opp.applications && (
                            <div className="text-sm text-slate-400 flex items-center">
                              {opp.applications.length} Applicants
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50/50 p-6 md:p-8 md:w-80 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-slate-100/50">
                        <div className="text-center mb-6">
                          <span className="block text-sm text-slate-500 font-medium mb-1">Funding Amount</span>
                          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            {formatAmount(opp.amount)}
                          </span>
                          {opp.grantDuration && <div className="text-xs text-slate-400 mt-1">{opp.grantDuration}</div>}
                        </div>

                        {!isClosed ? (
                          <Link href={`/funding/${opp.id}/apply`} className="w-full">
                            <Button
                              className="w-full h-11 text-base font-semibold shadow-lg transition-transform active:scale-95 bg-slate-900 hover:bg-blue-600 text-white shadow-blue-500/10"
                            >
                              Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            className="w-full h-11 text-base font-semibold bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                            disabled
                          >
                            Closed
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
