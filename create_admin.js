const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
    const email = 'admin@gostarthub.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const admin = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'ADMIN',
                name: 'Admin'
            },
            create: {
                email,
                password: hashedPassword,
                name: 'Admin',
                role: 'ADMIN'
            }
        });
        console.log(`✅ Admin account created/updated successfully!`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Admin ID: ${admin.id}`);
    } catch (error) {
        console.error('Error creating admin:', error);
    }
}

createAdmin()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
