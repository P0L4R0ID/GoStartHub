'use server';

import { loginAdmin } from '@/lib/auth';

export async function loginAdminAction(formData: FormData) {
    return await loginAdmin(formData);
}
