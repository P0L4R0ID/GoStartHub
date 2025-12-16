const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateCredentials() {
    try {
        // Update Admin
        const adminPassword = await bcrypt.hash('admin123', 10);

        const admin = await prisma.user.upsert({
            where: { email: 'admin@gostarthub.com' },
            update: {
                password: adminPassword,
                name: 'Admin',
                role: 'admin',
            },
            create: {
                email: 'admin@gostarthub.com',
                password: adminPassword,
                name: 'Admin',
                role: 'admin',
            },
        });

        console.log('✅ Admin updated/created successfully!');
        console.log('   Email: admin@gostarthub.com');
        console.log('   Password: admin123');

        // Update Mentor
        const mentorPassword = await bcrypt.hash('mentor123', 10);

        const mentor = await prisma.user.upsert({
            where: { email: 'mentor@gostarthub.com' },
            update: {
                password: mentorPassword,
                name: 'Test Mentor',
                role: 'mentor',
                bio: 'Experienced entrepreneur and startup advisor with 10+ years in technology',
                company: 'Tech Innovations Inc',
                expertise: JSON.stringify(['Technology', 'Product Development', 'Fundraising']),
                linkedIn: 'https://linkedin.com/in/testmentor',
            },
            create: {
                email: 'mentor@gostarthub.com',
                password: mentorPassword,
                name: 'Test Mentor',
                role: 'mentor',
                bio: 'Experienced entrepreneur and startup advisor with 10+ years in technology',
                company: 'Tech Innovations Inc',
                expertise: JSON.stringify(['Technology', 'Product Development', 'Fundraising']),
                linkedIn: 'https://linkedin.com/in/testmentor',
            },
        });

        console.log('✅ Mentor updated/created successfully!');
        console.log('   Email: mentor@gostarthub.com');
        console.log('   Password: mentor123');
        console.log('\n🎉 All credentials updated!');

    } catch (error) {
        console.error('Error updating credentials:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateCredentials();
