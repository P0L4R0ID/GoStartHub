'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { Startup } from '@/types';
import { Eye, DollarSign, Tag, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function PrototypesPage() {
  const [prototypes, setPrototypes] = useState<Startup[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const allPrototypes = storage.getPrototypes();
    setPrototypes(allPrototypes);
  }, []);

  const filteredPrototypes = filter === 'all'
    ? prototypes
    : prototypes.filter(p => p.category.toLowerCase().includes(filter.toLowerCase()));

  const categories = ['all', 'IoT & Hardware', 'AI & Machine Learning', 'Software', 'Sustainability', 'Healthcare'];

  return (
    <div className="min-h-screen  py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">Innovation Showcase</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Innovations</h1>
          <p className="text-xl text-muted-foreground">
            Explore innovative prototypes from young innovators across Malaysia
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setFilter(category)}
              variant={filter === category ? "default" : "outline"}
              size="sm"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>

        {/* Prototypes Grid */}
        {filteredPrototypes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No prototypes found. Be the first to showcase your innovation!</p>
              <Link href="/prototypes/new" className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Plus className="mr-2 h-4 w-4" />
                Add Your Prototype
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrototypes.map((prototype) => (
              <Card key={prototype.id} className="hover-lift border-2 hover:border-primary/50 transition-all">
                <Link href={`/prototypes/${prototype.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl line-clamp-2">{prototype.title}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-3">{prototype.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline">{prototype.category}</Badge>
                      <Badge variant="secondary" className="capitalize">{prototype.stage}</Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Funding Progress</span>
                        <span className="font-semibold">
                          RM {prototype.fundingReceived.toLocaleString()} / RM {prototype.fundingNeeded.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min((prototype.fundingReceived / prototype.fundingNeeded) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {prototype.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <p className="text-sm text-muted-foreground">By {prototype.innovatorName}</p>
                  </CardFooter>
                </Link>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/prototypes/new" className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-md text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Plus className="mr-2 h-4 w-4" />
            Showcase Your Prototype
          </Link>
        </div>
      </div>
    </div>
  );
}

