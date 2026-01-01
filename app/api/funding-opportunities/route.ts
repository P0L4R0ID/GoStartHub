import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch funding opportunities
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const id = searchParams.get('id');

        const where: any = {};

        if (id) {
            where.id = id;
        }

        if (status) {
            where.status = status.toUpperCase();
        }

        const opportunities = await prisma.fundingOpportunity.findMany({
            where,
            include: {
                _count: {
                    select: { applications: true },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ success: true, data: opportunities });
    } catch (error) {
        console.error('Error fetching funding opportunities:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch funding opportunities' },
            { status: 500 }
        );
    }
}

// POST - Create a new funding opportunity (admin only)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, providerName, amount, deadline, requirements } = body;

        // Validation
        if (!title || !description || !providerName || !amount || !deadline) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: title, description, providerName, amount, deadline' },
                { status: 400 }
            );
        }

        const newOpportunity = await prisma.fundingOpportunity.create({
            data: {
                title,
                description,
                providerName,
                amount: parseInt(amount),
                deadline: new Date(deadline),
                requirements: Array.isArray(requirements) ? JSON.stringify(requirements) : requirements || '[]',
                status: 'ACTIVE',
            },
        });

        return NextResponse.json({ success: true, data: newOpportunity }, { status: 201 });
    } catch (error) {
        console.error('Error creating funding opportunity:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create funding opportunity' },
            { status: 500 }
        );
    }
}

// PATCH - Update a funding opportunity (admin only)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Missing required field: id' },
                { status: 400 }
            );
        }

        // Process data for update
        const data: any = {};
        if (updateData.title) data.title = updateData.title;
        if (updateData.description) data.description = updateData.description;
        if (updateData.providerName) data.providerName = updateData.providerName;
        if (updateData.amount) data.amount = parseInt(updateData.amount);
        if (updateData.deadline) data.deadline = new Date(updateData.deadline);
        if (updateData.requirements) {
            data.requirements = Array.isArray(updateData.requirements)
                ? JSON.stringify(updateData.requirements)
                : updateData.requirements;
        }
        if (updateData.status) data.status = updateData.status.toUpperCase();

        const updatedOpportunity = await prisma.fundingOpportunity.update({
            where: { id },
            data,
        });

        return NextResponse.json({ success: true, data: updatedOpportunity });
    } catch (error) {
        console.error('Error updating funding opportunity:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update funding opportunity' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a funding opportunity (admin only)
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Missing required parameter: id' },
                { status: 400 }
            );
        }

        await prisma.fundingOpportunity.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: 'Funding opportunity deleted successfully' });
    } catch (error) {
        console.error('Error deleting funding opportunity:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete funding opportunity' },
            { status: 500 }
        );
    }
}
