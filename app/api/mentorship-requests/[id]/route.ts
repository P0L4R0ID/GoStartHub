import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// File-based storage for API routes
const DATA_FILE = path.join(process.cwd(), 'data', 'mentorship-requests.json');

const ensureDataDir = () => {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

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

const writeRequests = (requests: any[]) => {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(requests, null, 2));
  } catch (e) {
    console.error('Error writing requests:', e);
  }
};

// PATCH - Update mentorship request status (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, mentorResponse } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    const requests = readRequests();
    const requestIndex = requests.findIndex((req: any) => req.id === params.id);

    if (requestIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Mentorship request not found' },
        { status: 404 }
      );
    }

    const updatedRequest = {
      ...requests[requestIndex],
      status,
      mentorResponse: mentorResponse || undefined,
      updatedAt: new Date().toISOString(),
    };

    requests[requestIndex] = updatedRequest;
    writeRequests(requests);

    return NextResponse.json({ success: true, data: updatedRequest });
  } catch (error) {
    console.error('Error updating mentorship request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update mentorship request' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a mentorship request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requests = readRequests();
    const filteredRequests = requests.filter((req: any) => req.id !== params.id);

    if (requests.length === filteredRequests.length) {
      return NextResponse.json(
        { success: false, error: 'Mentorship request not found' },
        { status: 404 }
      );
    }

    writeRequests(filteredRequests);

    return NextResponse.json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting mentorship request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete mentorship request' },
      { status: 500 }
    );
  }
}

