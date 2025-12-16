import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        // Extract fields
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;
        const stage = formData.get('stage') as string;
        const projectType = formData.get('projectType') as string;
        const companyName = formData.get('companyName') as string | null;
        const linkedIn = formData.get('linkedIn') as string;
        const email = formData.get('email') as string;
        const website = formData.get('website') as string | null;
        const teamMembers = formData.get('teamMembers') as string;
        const pitchDeck = formData.get('pitchDeck') as File;
        const milestones = formData.get('milestones') as string | null;

        // New fields
        const logo = formData.get('logo') as File | null;
        const bannerImage = formData.get('bannerImage') as File | null;
        const problem = formData.get('problem') as string | null;
        const solution = formData.get('solution') as string | null;
        const targetCustomers = formData.get('targetCustomers') as string | null;
        const demoVideoUrl = formData.get('demoVideoUrl') as string | null;
        const university = formData.get('university') as string | null;

        if (!pitchDeck) {
            return NextResponse.json({ error: 'Pitch deck is required' }, { status: 400 });
        }

        // Validate teamMembers JSON
        try {
            JSON.parse(teamMembers);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid team members data' }, { status: 400 });
        }

        // Upload Pitch Deck
        const bytes = await pitchDeck.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = pitchDeck.name.replace(/\.[^/.]+$/, "") + '-' + uniqueSuffix + '.pdf';
        const filePath = `pitch-decks/${filename}`;

        const { error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(filePath, buffer, { contentType: 'application/pdf', upsert: false });

        if (uploadError) {
            console.error('Supabase upload error (pitch deck):', uploadError);
            return NextResponse.json({ error: 'Failed to upload pitch deck' }, { status: 500 });
        }

        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
        const publicUrl = urlData.publicUrl;

        // Upload Logo (if provided)
        let logoUrl = null;
        if (logo) {
            const logoBytes = await logo.arrayBuffer();
            const logoBuffer = Buffer.from(logoBytes);
            const logoFilename = 'logo-' + uniqueSuffix + (logo.name.endsWith('.png') ? '.png' : '.jpg');
            const logoPath = `logos/${logoFilename}`;

            const { error: logoUploadError } = await supabase.storage
                .from('uploads')
                .upload(logoPath, logoBuffer, { contentType: logo.type, upsert: false });

            if (!logoUploadError) {
                const { data: logoUrlData } = supabase.storage.from('uploads').getPublicUrl(logoPath);
                logoUrl = logoUrlData.publicUrl;
            } else {
                console.error('Supabase upload error (logo):', logoUploadError);
            }
        }

        // Upload Banner Image (if provided)
        let bannerImageUrl = null;
        if (bannerImage) {
            const bannerBytes = await bannerImage.arrayBuffer();
            const bannerBuffer = Buffer.from(bannerBytes);
            const bannerExt = bannerImage.name.split('.').pop() || 'jpg';
            const bannerFilename = 'banner-' + uniqueSuffix + '.' + bannerExt;
            const bannerPath = `banners/${bannerFilename}`;

            const { error: bannerUploadError } = await supabase.storage
                .from('uploads')
                .upload(bannerPath, bannerBuffer, { contentType: bannerImage.type, upsert: false });

            if (!bannerUploadError) {
                const { data: bannerUrlData } = supabase.storage.from('uploads').getPublicUrl(bannerPath);
                bannerImageUrl = bannerUrlData.publicUrl;
            } else {
                console.error('Supabase upload error (banner):', bannerUploadError);
            }
        }

        // Read user ID from cookie
        const cookieStore = cookies();
        const innovatorId = cookieStore.get('gostarthub_user_id')?.value;

        // Save to database
        const startup = await prisma.startup.create({
            data: {
                title,
                description,
                category,
                stage,
                projectType,
                companyName,
                contactLinkedIn: linkedIn,
                contactEmail: email,
                contactWebsite: website,
                teamMembers, // Stored as JSON string
                milestones,
                pitchDeck: publicUrl,

                // New fields
                logo: logoUrl,
                bannerImage: bannerImageUrl,
                problem,
                solution,
                targetCustomers,
                demoVideoUrl,
                university,

                status: 'PENDING',
                innovatorId: innovatorId || undefined // Save innovatorId if available
            }
        });

        return NextResponse.json(
            { message: 'Your startup has been submitted successfully and is pending approval.' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Submission error:', error);
        return NextResponse.json(
            { error: 'Failed to submit startup: ' + error.message },
            { status: 500 }
        );
    }
}
