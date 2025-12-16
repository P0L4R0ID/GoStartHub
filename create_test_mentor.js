const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestMentor() {
    try {
        // Create a test mentor user
        const hashedPassword = await bcrypt.hash('mentor123', 10);

        const mentor = await prisma.user.create({
            data: {
                email: 'mentor@test.com',
                password: hashedPassword,
                name: 'Test Mentor',
                role: 'mentor',
                bio: 'Experienced entrepreneur and startup advisor with 10+ years in technology',
                company: 'Tech Innovations Inc',
                expertise: JSON.stringify(['Technology', 'Product Development', 'Fundraising']),
                linkedIn: 'https://linkedin.com/in/testmentor',
            },
        });

        console.log('✅ Test mentor created successfully!');
        console.log('Email: mentor@test.com');
        console.log('Password: mentor123');
        console.log('Mentor ID:', mentor.id);
        console.log('\nYou can now login at: http://localhost:3000/mentor/login');

    } catch (error) {
        if (error.code === 'P2002') {
            console.log('⚠️  Mentor already exists. Updating to ensure they have mentor role...');

            const mentor = await prisma.user.update({
                where: { email: 'mentor@test.com' },
                data: {
                    role: 'mentor',
                    bio: 'Experienced entrepreneur and startup advisor with 10+ years in technology',
                    company: 'Tech Innovations Inc',
                    expertise: JSON.stringify(['Technology', 'Product Development', 'Fundraising']),
                    linkedIn: 'https://linkedin.com/in/testmentor',
                },
            });

            console.log('✅ Mentor role updated successfully!');
            console.log('Email: mentor@test.com');
            console.log('Password: mentor123 (if unchanged)');
            console.log('Mentor ID:', mentor.id);
        } else {
            console.error('Error creating mentor:', error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

createTestMentor();
