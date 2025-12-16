const fs = require('fs');
const path = require('path');

async function verifyDeleteUnauthorized() {
    const baseUrl = 'http://localhost:3000';
    let cookie = '';
    let startupId = '';

    // 1. Login as User (John)
    console.log('1. Logging in as User (John)...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'John@gmail.com', password: 'password123' })
    });

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }

    // Extract cookies
    const setCookie = loginRes.headers.get('set-cookie');
    if (setCookie) {
        cookie = setCookie.split(',').map(c => c.split(';')[0]).join('; ');
        console.log('Cookie obtained');
    } else {
        console.error('No cookie received');
        return;
    }

    // 2. Submit a dummy startup (to have something to try to delete)
    console.log('2. Submitting dummy startup...');
    const formData = new FormData();
    formData.append('title', 'User Startup ' + Date.now());
    formData.append('description', 'To be deleted by user (should fail)');
    formData.append('category', 'Test');
    formData.append('stage', 'Idea');
    formData.append('projectType', 'Individual');
    formData.append('linkedIn', 'https://linkedin.com/in/test');
    formData.append('email', 'John@gmail.com');
    formData.append('teamMembers', JSON.stringify([{ name: 'John', role: 'Founder' }]));

    const pdfPath = path.join(__dirname, 'dummy_delete_user.pdf');
    fs.writeFileSync(pdfPath, 'dummy pdf content');
    const file = new Blob([fs.readFileSync(pdfPath)], { type: 'application/pdf' });
    formData.append('pitchDeck', file, 'dummy_delete_user.pdf');

    const submitRes = await fetch(`${baseUrl}/api/submit-startup`, {
        method: 'POST',
        headers: { 'Cookie': cookie },
        body: formData
    });

    if (!submitRes.ok) {
        console.error('Submission failed:', await submitRes.text());
        return;
    }
    console.log('Startup submitted');

    // 3. Get the startup ID
    // We need to fetch startups to find the one we just created
    // Note: /api/startups might return all startups or just user's depending on implementation
    // Let's try to find it.
    const listRes = await fetch(`${baseUrl}/api/startups?status=all`, {
        headers: { 'Cookie': cookie }
    });
    // If status=all is admin only, this might fail or return empty.
    // Let's try without status param which usually returns approved ones, but our new one is pending.
    // If we can't list it, we can't get ID easily without admin.
    // BUT, we can login as admin to get the ID, then try to delete as user.

    // Let's login as admin to get ID
    console.log('3. Logging in as Admin to get ID...');
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    const adminCookie = adminLoginRes.headers.get('set-cookie').split(',').map(c => c.split(';')[0]).join('; ');

    const listDataRes = await fetch(`${baseUrl}/api/startups?status=all`, {
        headers: { 'Cookie': adminCookie }
    });
    const listData = await listDataRes.json();
    const startup = listData.startups.find(s => s.title.startsWith('User Startup'));

    if (!startup) {
        console.error('Could not find created startup');
        return;
    }
    startupId = startup.id;
    console.log('Startup created with ID:', startupId);

    // 4. Try to delete as User
    console.log('4. Attempting to delete as User...');
    const deleteRes = await fetch(`${baseUrl}/api/startups/${startupId}`, {
        method: 'DELETE',
        headers: { 'Cookie': cookie } // User cookie
    });

    if (deleteRes.status === 401) {
        console.log('SUCCESS: Delete request failed with 401 Unauthorized as expected');
    } else {
        console.error('FAILURE: Delete request returned status:', deleteRes.status);
    }

    // Cleanup (delete it as admin)
    await fetch(`${baseUrl}/api/startups/${startupId}`, {
        method: 'DELETE',
        headers: { 'Cookie': adminCookie }
    });
    fs.unlinkSync(pdfPath);
}

verifyDeleteUnauthorized().catch(console.error);
