'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { Event } from '@/types';
import { Calendar, MapPin, Users, Clock, ArrowRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const allEvents = storage.getEvents();
    // Sort by date (upcoming first)
    const sorted = allEvents.sort((a: Event, b: Event) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    setEvents(sorted);
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesStatus = filter === 'all' || event.status === filter;
    const matchesType = typeFilter === 'all' || event.type === typeFilter;
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesType && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'upcoming':
        return 'secondary';
      case 'closed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      networking: 'Networking',
      workshop: 'Workshop',
      seminar: 'Seminar',
      conference: 'Conference',
      hackathon: 'Hackathon',
      competition: 'Competition',
      exhibition: 'Exhibition',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">Events</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Upcoming Events</h1>
          <p className="text-xl text-muted-foreground">
            Join networking events, workshops, and seminars to grow your innovation network
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="seminar">Seminar</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="hackathon">Hackathon</SelectItem>
                <SelectItem value="competition">Competition</SelectItem>
                <SelectItem value="exhibition">Exhibition</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All
            </Button>
            <Button
              onClick={() => setFilter('open')}
              variant={filter === 'open' ? 'default' : 'outline'}
              size="sm"
            >
              Open
            </Button>
            <Button
              onClick={() => setFilter('upcoming')}
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              size="sm"
            >
              Upcoming
            </Button>
            <Button
              onClick={() => setFilter('closed')}
              variant={filter === 'closed' ? 'default' : 'outline'}
              size="sm"
            >
              Closed
            </Button>
          </div>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No events found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover-lift border-2 hover:border-primary/50 transition-all">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                  <div className="md:col-span-1 p-4 md:p-6 border-r-0 md:border-r bg-muted/30 flex flex-col">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {new Date(event.date).getDate()}
                      </div>
                      <div className="text-sm text-muted-foreground uppercase">
                        {new Date(event.date).toLocaleDateString('en-MY', { month: 'short' })}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(event.date).getFullYear()}
                      </div>
                      <div className="mt-4 text-sm font-semibold">
                        {event.startTime} - {event.endTime}
                      </div>
                    </div>
                    {event.image && (
                      <div className="mt-auto flex-1 flex items-end">
                        <img 
                          src={event.image} 
                          alt={event.title}
                          className="w-full h-full min-h-[200px] max-h-[400px] object-cover rounded-lg shadow-md"
                        />
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-3 p-4 md:p-6">
                    <CardHeader className="p-0 mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">{getTypeLabel(event.type)}</Badge>
                            <Badge variant={getStatusColor(event.status)} className="text-xs">{event.status}</Badge>
                            <Badge variant="secondary" className="text-xs">{event.format}</Badge>
                          </div>
                          <CardTitle className="text-xl sm:text-2xl mb-2">{event.title}</CardTitle>
                          <CardDescription className="text-sm sm:text-base">{event.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Users className="h-4 w-4 mr-2" />
                          <span>
                            {event.currentAttendees}
                            {event.maxAttendees ? ` / ${event.maxAttendees}` : ''} attendees
                          </span>
                        </div>
                        {event.speakers && event.speakers.length > 0 && (
                          <div className="flex items-center text-muted-foreground">
                            <span className="text-xs">Speakers: {event.speakers.length}</span>
                          </div>
                        )}
                      </div>

                      {event.agenda && event.agenda.length > 0 && (
                        <div className="text-sm">
                          <p className="font-semibold mb-1">Agenda:</p>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            {event.agenda.slice(0, 3).map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                            {event.agenda.length > 3 && (
                              <li className="text-primary">+{event.agenda.length - 3} more items</li>
                            )}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {event.tags.slice(0, 4).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="p-0 pt-4">
                      <Link href={`/events/${event.id}`} className="w-full">
                        <Button className="w-full">
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

