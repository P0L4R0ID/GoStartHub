const fs = require('fs');
const path = require('path');

async function verifyDelete() {
    const baseUrl = 'http://localhost:3000';
    let cookie = '';
    let startupId = '';

    // 1. Login as Admin
    console.log('1. Logging in as Admin...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
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

    // 2. Submit a dummy startup to delete
    console.log('2. Submitting dummy startup...');
    const formData = new FormData();
    formData.append('title', 'Delete Me ' + Date.now());
    formData.append('description', 'To be deleted');
    formData.append('category', 'Test');
    formData.append('stage', 'Idea');
    formData.append('projectType', 'Individual');
    formData.append('linkedIn', 'https://linkedin.com/in/test');
    formData.append('email', 'test@example.com');
    formData.append('teamMembers', JSON.stringify([{ name: 'Test User', role: 'Founder' }]));

    const pdfPath = path.join(__dirname, 'dummy_delete.pdf');
    fs.writeFileSync(pdfPath, 'dummy pdf content');
    const file = new Blob([fs.readFileSync(pdfPath)], { type: 'application/pdf' });
    formData.append('pitchDeck', file, 'dummy_delete.pdf');

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
    const listRes = await fetch(`${baseUrl}/api/startups?status=all`, {
        headers: { 'Cookie': cookie }
    });
    const listData = await listRes.json();
    const startup = listData.startups.find(s => s.title.startsWith('Delete Me'));

    if (!startup) {
        console.error('Could not find created startup');
        return;
    }
    startupId = startup.id;
    console.log('Startup created with ID:', startupId);

    // 4. Delete the startup
    console.log('4. Deleting startup...');
    const deleteRes = await fetch(`${baseUrl}/api/startups/${startupId}`, {
        method: 'DELETE',
        headers: { 'Cookie': cookie }
    });

    if (deleteRes.ok) {
        console.log('Delete request successful');
    } else {
        console.error('Delete request failed:', await deleteRes.text());
        return;
    }

    // 5. Verify it's gone
    console.log('5. Verifying deletion...');
    const verifyRes = await fetch(`${baseUrl}/api/startups/${startupId}`, {
        headers: { 'Cookie': cookie }
    });

    if (verifyRes.status === 404) {
        console.log('SUCCESS: Startup not found (deleted)');
    } else {
        console.error('FAILURE: Startup still exists or error:', verifyRes.status);
    }

    // Cleanup
    fs.unlinkSync(pdfPath);
}

verifyDelete().catch(console.error);
