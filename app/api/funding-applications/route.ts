import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch funding applications
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const opportunityId = searchParams.get('opportunityId');
    const innovatorId = searchParams.get('innovatorId');
    const startupId = searchParams.get('startupId');
    const status = searchParams.get('status');

    const where: any = {};

    if (opportunityId) {
      where.opportunityId = opportunityId;
    }

    if (innovatorId) {
      where.innovatorId = innovatorId;
    }

    if (startupId) {
      where.startupId = startupId;
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    const applications = await prisma.fundingApplication.findMany({
      where,
      include: {
        opportunity: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: applications });
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
    const { startupId, opportunityId, innovatorId, innovatorName, innovatorEmail, message } = body;

    // Validation - only require core fields
    if (!opportunityId || !innovatorId || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: opportunityId, innovatorId, message' },
        { status: 400 }
      );
    }

    // Check for duplicate applications
    const duplicate = await prisma.fundingApplication.findFirst({
      where: {
        opportunityId,
        innovatorId,
        status: 'PENDING',
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted an application for this opportunity' },
        { status: 400 }
      );
    }

    // Create the application
    const newApplication = await prisma.fundingApplication.create({
      data: {
        opportunityId,
        startupId: startupId || null,
        innovatorId,
        innovatorName: innovatorName || '',
        innovatorEmail: innovatorEmail || '',
        message,
        status: 'PENDING',
        // Optional fields
        fullName: body.fullName || null,
        icNumber: body.icNumber || null,
        phoneNumber: body.phoneNumber || null,
        country: body.country || null,
        hasRegisteredCompany: body.hasRegisteredCompany || false,
        companyName: body.companyName || null,
        companyWebsite: body.companyWebsite || null,
        companyDescription: body.companyDescription || null,
        companyIncorporatedDate: body.companyIncorporatedDate || null,
        officeAddress: body.officeAddress || null,
        hasOfficeInMalaysia: body.hasOfficeInMalaysia || null,
        companyStage: body.companyStage || null,
        focusArea: body.focusArea ? JSON.stringify(body.focusArea) : null,
        technologyArea: body.technologyArea ? JSON.stringify(body.technologyArea) : null,
        proposedActivities: body.proposedActivities ? JSON.stringify(body.proposedActivities) : null,
        industryFocus: body.industryFocus ? JSON.stringify(body.industryFocus) : null,
      },
    });

    return NextResponse.json({ success: true, data: newApplication }, { status: 201 });
  } catch (error) {
    console.error('Error creating funding application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create funding application' },
      { status: 500 }
    );
  }
}

// PATCH - Update application status (for admin approval/rejection)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: id, status' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be PENDING, APPROVED, or REJECTED' },
        { status: 400 }
      );
    }

    const updatedApplication = await prisma.fundingApplication.update({
      where: { id },
      data: { status: status.toUpperCase() },
    });

    return NextResponse.json({ success: true, data: updatedApplication });
  } catch (error) {
    console.error('Error updating funding application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update funding application' },
      { status: 500 }
    );
  }
}
