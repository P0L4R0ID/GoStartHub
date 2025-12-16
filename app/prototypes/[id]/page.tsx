'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { Startup } from '@/types';
import { DollarSign, Tag, Calendar, User, ArrowLeft, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PrototypeDetailPage() {
  const params = useParams();
  const [prototype, setPrototype] = useState<Startup | null>(null);

  useEffect(() => {
    const prototypes = storage.getPrototypes();
    const found = prototypes.find((p: Startup) => p.id === params.id);
    setPrototype(found || null);
  }, [params.id]);

  if (!prototype) {
    return (
      <div className="min-h-screen  py-12">
        <div className="container mx-auto px-4">
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">Prototype not found</p>
              <Link href="/prototypes">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Prototypes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const fundingProgress = (prototype.fundingReceived / prototype.fundingNeeded) * 100;

  return (
    <div className="min-h-screen  py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/prototypes">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Prototypes
          </Button>
        </Link>

        <Card className="mb-6 border-2">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <CardTitle className="text-4xl mb-4">{prototype.title}</CardTitle>
                <CardDescription className="text-lg">{prototype.description}</CardDescription>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Category</div>
                <Badge variant="outline">{prototype.category}</Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Stage</div>
                <Badge variant="secondary" className="capitalize">{prototype.stage}</Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <Badge variant={prototype.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                  {prototype.status}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Innovator</div>
                <div className="font-semibold">{prototype.innovatorName}</div>
              </div>
            </div>

            {/* Funding Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Funding Progress</span>
                <span className="text-sm text-muted-foreground">
                  RM {prototype.fundingReceived.toLocaleString()} / RM {prototype.fundingNeeded.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-4">
                <div
                  className="bg-primary h-4 rounded-full transition-all"
                  style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {prototype.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover-lift border-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Contact Innovator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Interested in this prototype? Connect with the innovator to learn more.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Contact Innovator
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover-lift border-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Apply for Funding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This prototype is seeking funding. Apply now to support this innovation.
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/funding/apply?prototype=${prototype.id}`} className="w-full">
                <Button className="w-full">
                  Apply for Funding
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

