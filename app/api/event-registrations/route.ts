import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'event-registrations.json');

const ensureDataDir = () => {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const readRegistrations = (): any[] => {
  try {
    ensureDataDir();
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading registrations:', e);
  }
  return [];
};

const writeRegistrations = (registrations: any[]) => {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(registrations, null, 2));
  } catch (e) {
    console.error('Error writing registrations:', e);
  }
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    const attendeeId = searchParams.get('attendeeId');
    const status = searchParams.get('status');

    const registrations = readRegistrations();
    let filtered = registrations;

    if (eventId) {
      filtered = filtered.filter((reg: any) => reg.eventId === eventId);
    }

    if (attendeeId) {
      filtered = filtered.filter((reg: any) => reg.attendeeId === attendeeId);
    }

    if (status) {
      filtered = filtered.filter((reg: any) => reg.status === status);
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, attendeeId } = body;

    if (!eventId || !attendeeId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const registrations = readRegistrations();
    const duplicate = registrations.find(
      (reg: any) => reg.eventId === eventId && reg.attendeeId === attendeeId
    );

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'Already registered for this event' },
        { status: 400 }
      );
    }

    const newRegistration = {
      id: body.id || Date.now().toString(),
      eventId,
      attendeeId,
      attendeeName: body.attendeeName,
      attendeeEmail: body.attendeeEmail,
      status: 'registered',
      createdAt: body.createdAt || new Date().toISOString(),
    };

    registrations.push(newRegistration);
    writeRegistrations(registrations);

    return NextResponse.json({ success: true, data: newRegistration }, { status: 201 });
  } catch (error) {
    console.error('Error creating event registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create registration' },
      { status: 500 }
    );
  }
}

