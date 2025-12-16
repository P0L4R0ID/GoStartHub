import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'programme-registrations.json');

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
    const programmeId = searchParams.get('programmeId');
    const innovatorId = searchParams.get('innovatorId');
    const status = searchParams.get('status');

    const registrations = readRegistrations();
    let filtered = registrations;

    if (programmeId) {
      filtered = filtered.filter((reg: any) => reg.programmeId === programmeId);
    }

    if (innovatorId) {
      filtered = filtered.filter((reg: any) => reg.innovatorId === innovatorId);
    }

    if (status) {
      filtered = filtered.filter((reg: any) => reg.status === status);
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    console.error('Error fetching programme registrations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { programmeId, innovatorId, prototypeId, applicationMessage } = body;

    if (!programmeId || !innovatorId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const registrations = readRegistrations();
    const duplicate = registrations.find(
      (reg: any) => reg.programmeId === programmeId && reg.innovatorId === innovatorId
    );

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'Already registered for this programme' },
        { status: 400 }
      );
    }

    const newRegistration = {
      id: body.id || Date.now().toString(),
      programmeId,
      innovatorId,
      innovatorName: body.innovatorName,
      innovatorEmail: body.innovatorEmail,
      prototypeId: prototypeId || undefined,
      prototypeTitle: body.prototypeTitle,
      applicationMessage: applicationMessage || undefined,
      status: 'pending',
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    registrations.push(newRegistration);
    writeRegistrations(registrations);

    return NextResponse.json({ success: true, data: newRegistration }, { status: 201 });
  } catch (error) {
    console.error('Error creating programme registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create registration' },
      { status: 500 }
    );
  }
}

