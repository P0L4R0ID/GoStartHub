const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetPassword() {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });
        console.log(`Password for ${email} reset to ${password}`);
    } catch (error) {
        console.error('Error resetting password:', error);
    }
}

resetPassword()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
