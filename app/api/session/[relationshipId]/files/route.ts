import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { verifyMentorSession, verifyUserSession } from '@/lib/auth-helpers';

interface Params {
    params: Promise<{ relationshipId: string }>;
}

export async function GET(request: Request, { params }: Params) {
    try {
        const user = await verifyMentorSession() || await verifyUserSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { relationshipId } = await params;

        // Verify user has access
        const relationship = await prisma.mentorshipRelationship.findUnique({
            where: { id: relationshipId },
            include: {
                startup: true,
            },
        });

        if (!relationship) {
            return NextResponse.json(
                { error: 'Relationship not found' },
                { status: 404 }
            );
        }

        const hasAccess = relationship.mentorId === user.id || relationship.startup.innovatorId === user.id;

        if (!hasAccess) {
            return NextResponse.json(
                { error: 'You do not have access to this session' },
                { status: 403 }
            );
        }

        // Get files
        const files = await prisma.sessionFile.findMany({
            where: {
                relationshipId: relationshipId,
            },
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ files });
    } catch (error) {
        console.error('Error fetching session files:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request, { params }: Params) {
    try {
        const user = await verifyMentorSession() || await verifyUserSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { relationshipId } = await params;

        // Verify user has access
        const relationship = await prisma.mentorshipRelationship.findUnique({
            where: { id: relationshipId },
            include: {
                startup: true,
            },
        });

        if (!relationship) {
            return NextResponse.json(
                { error: 'Relationship not found' },
                { status: 404 }
            );
        }

        const hasAccess = relationship.mentorId === user.id || relationship.startup.innovatorId === user.id;

        if (!hasAccess) {
            return NextResponse.json(
                { error: 'You do not have access to this session' },
                { status: 403 }
            );
        }

        // Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Upload file to Supabase Storage
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name}`;
        const filePath = `session-files/${relationshipId}/${filename}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(filePath, buffer, {
                contentType: file.type || 'application/octet-stream',
                upsert: false
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return NextResponse.json(
                { error: 'Failed to upload file' },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;

        // Create database record
        const sessionFile = await prisma.sessionFile.create({
            data: {
                relationshipId: relationshipId,
                uploadedById: user.id,
                fileName: file.name,
                filePath: publicUrl,
                fileSize: file.size,
            },
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({ file: sessionFile }, { status: 201 });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
