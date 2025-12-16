import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// File-based storage for API routes
const DATA_FILE = path.join(process.cwd(), 'data', 'funding-applications.json');

const ensureDataDir = () => {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const readApplications = (): any[] => {
  try {
    ensureDataDir();
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading applications:', e);
  }
  return [];
};

const writeApplications = (applications: any[]) => {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(applications, null, 2));
  } catch (e) {
    console.error('Error writing applications:', e);
  }
};

// GET - Fetch funding applications
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const opportunityId = searchParams.get('opportunityId');
    const innovatorId = searchParams.get('innovatorId');
    const prototypeId = searchParams.get('prototypeId');
    const status = searchParams.get('status');

    const applications = readApplications();
    let filteredApplications = applications;

    if (opportunityId) {
      filteredApplications = filteredApplications.filter(
        (app: any) => app.opportunityId === opportunityId
      );
    }

    if (innovatorId) {
      filteredApplications = filteredApplications.filter(
        (app: any) => app.innovatorId === innovatorId
      );
    }

    if (prototypeId) {
      filteredApplications = filteredApplications.filter(
        (app: any) => app.prototypeId === prototypeId
      );
    }

    if (status) {
      filteredApplications = filteredApplications.filter(
        (app: any) => app.status === status
      );
    }

    return NextResponse.json({ success: true, data: filteredApplications });
  } catch (error) {
    console.error('Error fetching funding applications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch funding applications' },
      { status: 500 }
    );
  }
}

// POST - Create a new funding application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prototypeId, opportunityId, innovatorId, message } = body;

    // Validation - only require core fields
    if (!prototypeId || !opportunityId || !innovatorId || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: prototypeId, opportunityId, innovatorId, message' },
        { status: 400 }
      );
    }

    // Check for duplicate applications
    const applications = readApplications();
    const duplicate = applications.find(
      (app: any) =>
        app.opportunityId === opportunityId &&
        app.innovatorId === innovatorId &&
        app.status === 'pending'
    );

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted an application for this opportunity' },
        { status: 400 }
      );
    }

    // Accept all fields from body
    const newApplication = {
      ...body, // Include all fields from the request
      id: body.id || Date.now().toString(),
      status: 'pending' as const,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    applications.push(newApplication);
    writeApplications(applications);

    return NextResponse.json({ success: true, data: newApplication }, { status: 201 });
  } catch (error) {
    console.error('Error creating funding application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create funding application' },
      { status: 500 }
    );
  }
}

