'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Download, FileText, Video, FileCheck, Lightbulb, Target, DollarSign, Users } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'template' | 'video' | 'checklist';
  category: string;
  icon: any;
  downloadUrl?: string;
  videoUrl?: string;
}

const resources: Resource[] = [
  {
    id: '1',
    title: 'Startup Pitch Deck Template',
    description: 'Professional pitch deck template with all essential slides for presenting your startup to investors.',
    type: 'template',
    category: 'Pitching',
    icon: FileText,
    downloadUrl: '#',
  },
  {
    id: '2',
    title: 'Business Plan Guide',
    description: 'Step-by-step guide to creating a comprehensive business plan for your startup.',
    type: 'guide',
    category: 'Planning',
    icon: BookOpen,
    downloadUrl: '#',
  },
  {
    id: '3',
    title: 'Funding Application Checklist',
    description: 'Complete checklist to ensure your funding application is complete and compelling.',
    type: 'checklist',
    category: 'Funding',
    icon: FileCheck,
    downloadUrl: '#',
  },
  {
    id: '4',
    title: 'How to Validate Your Idea',
    description: 'Learn how to validate your startup idea before investing time and resources.',
    type: 'guide',
    category: 'Validation',
    icon: Lightbulb,
    downloadUrl: '#',
  },
  {
    id: '5',
    title: 'Investor Pitch Best Practices',
    description: 'Video tutorial on how to deliver an effective pitch to potential investors.',
    type: 'video',
    category: 'Pitching',
    icon: Video,
    videoUrl: '#',
  },
  {
    id: '6',
    title: 'Market Research Template',
    description: 'Template for conducting thorough market research for your startup.',
    type: 'template',
    category: 'Research',
    icon: Target,
    downloadUrl: '#',
  },
  {
    id: '7',
    title: 'Funding Sources Guide',
    description: 'Comprehensive guide to different funding sources available for startups in Malaysia.',
    type: 'guide',
    category: 'Funding',
    icon: DollarSign,
    downloadUrl: '#',
  },
  {
    id: '8',
    title: 'Team Building Checklist',
    description: 'Essential checklist for building and managing your startup team.',
    type: 'checklist',
    category: 'Team',
    icon: Users,
    downloadUrl: '#',
  },
];

const categories = ['All', 'Pitching', 'Planning', 'Funding', 'Validation', 'Research', 'Team'];

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState<'all' | 'guide' | 'template' | 'video' | 'checklist'>('all');

  const filteredResources = resources.filter((r) => {
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    const matchesType = selectedType === 'all' || r.type === selectedType;
    return matchesCategory && matchesType;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Resource Library</h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Guides, templates, and resources to help you succeed
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 sm:mb-8 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="text-xs sm:text-sm"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Type</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'guide', 'template', 'video', 'checklist'].map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type as any)}
                  className="text-xs sm:text-sm"
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => {
            const Icon = resource.icon;
            return (
              <Card key={resource.id} className="border-2 hover-lift">
                <CardHeader>
                  <div className="flex items-start gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base sm:text-lg">{resource.title}</CardTitle>
                      <Badge variant="outline" className="mt-2">
                        {resource.category}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{resource.type}</Badge>
                    {resource.downloadUrl ? (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">
                        <Video className="h-4 w-4 mr-2" />
                        Watch
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredResources.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No resources found. Try adjusting your filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

