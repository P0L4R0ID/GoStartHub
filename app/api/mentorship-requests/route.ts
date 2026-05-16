import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// File-based storage for API routes (works on server)
// In production, replace this with a database
const DATA_FILE = path.join(process.cwd(), 'data', 'mentorship-requests.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Read requests from file
const readRequests = (): any[] => {
  try {
    ensureDataDir();
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading requests:', e);
  }
  return [];
};

// Write requests to file
const writeRequests = (requests: any[]) => {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(requests, null, 2));
  } catch (e) {
    console.error('Error writing requests:', e);
  }
};

// GET - Fetch mentorship requests
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mentorId = searchParams.get('mentorId');
    const innovatorId = searchParams.get('innovatorId');
    const status = searchParams.get('status');

    const requests = readRequests();
    let filteredRequests = requests;

    if (mentorId) {
      filteredRequests = filteredRequests.filter((req: any) => req.mentorId === mentorId);
    }

    if (innovatorId) {
      filteredRequests = filteredRequests.filter((req: any) => req.innovatorId === innovatorId);
    }

    if (status) {
      filteredRequests = filteredRequests.filter((req: any) => req.status === status);
    }

    return NextResponse.json({ success: true, data: filteredRequests });
  } catch (error) {
    console.error('Error fetching mentorship requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mentorship requests' },
      { status: 500 }
    );
  }
}

// POST - Create a new mentorship request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mentorId,
      mentorName,
      innovatorId,
      innovatorName,
      innovatorEmail,
      prototypeId,
      prototypeTitle,
      message,
      goals,
    } = body;

    // Validation
    if (!mentorId || !innovatorId || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newRequest = {
      id: Date.now().toString(),
      mentorId,
      mentorName,
      innovatorId,
      innovatorName,
      innovatorEmail,
      prototypeId: prototypeId || undefined,
      prototypeTitle: prototypeTitle || undefined,
      message,
      goals: goals || undefined,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to file
    const requests = readRequests();
    requests.push(newRequest);
    writeRequests(requests);

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
  } catch (error) {
    console.error('Error creating mentorship request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create mentorship request' },
      { status: 500 }
    );
  }
}

