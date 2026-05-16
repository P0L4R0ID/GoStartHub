'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { Event, EventRegistration } from '@/types';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function EventRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const session = storage.getSession();
    if (!session) {
      router.push('/login?redirect=/events/' + params.id + '/register');
      return;
    }

    const events = storage.getEvents();
    const found = events.find((e: Event) => e.id === params.id);
    
    if (!found) {
      setError('Event not found');
      return;
    }

    if (found.status !== 'open') {
      setError('This event is not currently accepting registrations');
      return;
    }

    if (found.maxAttendees && found.currentAttendees >= found.maxAttendees) {
      setError('This event is full');
      return;
    }

    setEvent(found);
  }, [params.id, router]);

  const handleRegister = async () => {
    setError(null);
    setLoading(true);

    try {
      const session = storage.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Check if already registered
      const existingRegistrations = storage.getEventRegistrations();
      const alreadyRegistered = existingRegistrations.some(
        (reg: EventRegistration) => 
          reg.eventId === params.id && 
          reg.attendeeId === session.id
      );

      if (alreadyRegistered) {
        setError('You are already registered for this event');
        setLoading(false);
        return;
      }

      const newRegistration: EventRegistration = {
        id: Date.now().toString(),
        eventId: params.id as string,
        attendeeId: session.id,
        attendeeName: session.name,
        attendeeEmail: session.email,
        status: 'registered',
        createdAt: new Date().toISOString(),
      };

      storage.saveEventRegistrations([...existingRegistrations, newRegistration]);

      // Update event attendee count
      if (event) {
        const events = storage.getEvents();
        const eventIndex = events.findIndex((e: Event) => e.id === params.id);
        if (eventIndex !== -1) {
          events[eventIndex].currentAttendees += 1;
          storage.saveEvents(events);
        }
      }

      await fetch('/api/event-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRegistration),
      });

      setSuccess(true);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error registering for event:', error);
      setError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error && !event) {
    return (
      <div className="min-h-screen  py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link href="/events">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </Link>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen  py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen  py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-2 border-green-500">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Registration Successful!</CardTitle>
              <CardDescription>
                You have successfully registered for {event.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                We look forward to seeing you at the event!
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
                <Link href="/events">
                  <Button variant="outline">View More Events</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href={`/events/${params.id}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Button>
        </Link>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-3xl mb-2">Register for {event.title}</CardTitle>
            <CardDescription className="text-base">
              Confirm your registration for this event
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Event Details</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString('en-MY', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}</p>
                  <p><strong>Time:</strong> {event.startTime} - {event.endTime}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Format:</strong> {event.format}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleRegister} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Confirm Registration'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

