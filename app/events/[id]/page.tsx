'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { Event } from '@/types';
import { ArrowLeft, Calendar, MapPin, Users, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const events = storage.getEvents();
    const found = events.find((e: Event) => e.id === params.id);
    setEvent(found || null);

    const session = storage.getSession();
    if (session) {
      const registrations = storage.getEventRegistrations();
      const userRegistration = registrations.find(
        (reg: any) => reg.eventId === params.id && reg.attendeeId === session.id
      );
      setIsRegistered(!!userRegistration);
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  if (!event) {
    return (
      <div className="min-h-screen  py-12">
        <div className="container mx-auto px-4">
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">Event not found</p>
              <Link href="/events">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Events
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const canRegister = event.status === 'open' && !isRegistered && 
    (!event.maxAttendees || event.currentAttendees < event.maxAttendees);
  const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
  const isDeadlinePassed = registrationDeadline ? registrationDeadline < new Date() : false;

  return (
    <div className="min-h-screen  py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/events">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>

        <Card className="mb-6 border-2">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{event.type}</Badge>
                  <Badge variant={event.status === 'open' ? 'default' : 'secondary'}>
                    {event.status}
                  </Badge>
                  <Badge variant="secondary">{event.format}</Badge>
                </div>
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl mb-4">{event.title}</CardTitle>
                <CardDescription className="text-base sm:text-lg">{event.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Date & Time</div>
                    <div className="font-semibold">{formatDate(event.date)}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.startTime} - {event.endTime}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-semibold">{event.location}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Attendees</div>
                    <div className="font-semibold">
                      {event.currentAttendees}
                      {event.maxAttendees ? ` / ${event.maxAttendees}` : ''}
                    </div>
                  </div>
                </div>
                {event.registrationDeadline && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Registration Deadline</div>
                      <div className="font-semibold">
                        {new Date(event.registrationDeadline).toLocaleDateString('en-MY')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isDeadlinePassed && event.status === 'open' && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Registration Deadline Passed</AlertTitle>
                <AlertDescription>
                  The registration deadline for this event has passed.
                </AlertDescription>
              </Alert>
            )}

            {isRegistered && (
              <Alert className="mb-6 border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">You are registered!</AlertTitle>
                <AlertDescription className="text-green-700">
                  You have successfully registered for this event. See you there!
                </AlertDescription>
              </Alert>
            )}

            {event.agenda && event.agenda.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Agenda</h3>
                <ul className="space-y-2">
                  {event.agenda.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {event.speakers && event.speakers.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Speakers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.speakers.map((speaker, idx) => (
                    <Card key={idx} className="bg-muted/50">
                      <CardContent className="pt-6">
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">{speaker.name}</div>
                            <div className="text-sm text-muted-foreground">{speaker.title}</div>
                            {speaker.bio && (
                              <div className="text-sm text-muted-foreground mt-1">{speaker.bio}</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
          <CardContent className="pt-0">
            {canRegister && !isDeadlinePassed ? (
              <Link href={`/events/${event.id}/register`}>
                <Button size="lg" className="w-full">
                  Register for Event
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </Link>
            ) : isRegistered ? (
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="w-full">
                  View in Dashboard
                </Button>
              </Link>
            ) : (
              <Button size="lg" className="w-full" disabled>
                Registration Closed
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

