const fs = require('fs');
const path = require('path');

async function verifyIsolation() {
    const baseUrl = 'http://localhost:3000';
    let cookie = '';
    let userId = '';

    // 1. Login
    console.log('1. Logging in...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }

    const loginData = await loginRes.json();
    userId = loginData.user.id;
    console.log('Logged in as:', userId);

    // Extract cookies
    const setCookie = loginRes.headers.get('set-cookie');
    if (setCookie) {
        cookie = setCookie.split(',').map(c => c.split(';')[0]).join('; ');
        console.log('Cookie obtained');
    } else {
        console.error('No cookie received');
        return;
    }

    // 2. Submit Startup
    console.log('2. Submitting startup...');
    const formData = new FormData();
    formData.append('title', 'Isolated Startup ' + Date.now());
    formData.append('description', 'Test description');
    formData.append('category', 'Software');
    formData.append('stage', 'Idea');
    formData.append('projectType', 'Individual');
    formData.append('linkedIn', 'https://linkedin.com/in/test');
    formData.append('email', 'test@example.com');
    formData.append('teamMembers', JSON.stringify([{ name: 'Test User', role: 'Founder' }]));

    // Create dummy PDF
    const pdfPath = path.join(__dirname, 'dummy.pdf');
    fs.writeFileSync(pdfPath, 'dummy pdf content');
    const file = new Blob([fs.readFileSync(pdfPath)], { type: 'application/pdf' });
    formData.append('pitchDeck', file, 'dummy.pdf');

    const submitRes = await fetch(`${baseUrl}/api/submit-startup`, {
        method: 'POST',
        headers: {
            'Cookie': cookie
        },
        body: formData
    });

    if (!submitRes.ok) {
        console.error('Submission failed:', await submitRes.text());
        return;
    }
    console.log('Startup submitted');

    // 3. Fetch Startups for User
    console.log('3. Fetching startups for user...');
    const fetchRes = await fetch(`${baseUrl}/api/startups?status=all&innovatorId=${userId}`, {
        headers: { 'Cookie': cookie }
    });

    const fetchData = await fetchRes.json();
    const myStartups = fetchData.startups;

    const found = myStartups.some(s => s.title.startsWith('Isolated Startup'));
    if (found) {
        console.log('SUCCESS: Startup found in user list');
    } else {
        console.error('FAILURE: Startup NOT found in user list');
    }

    // 4. Fetch Startups for Another User (simulate)
    console.log('4. Fetching startups for another user...');
    const otherRes = await fetch(`${baseUrl}/api/startups?status=all&innovatorId=other-user`, {
        headers: { 'Cookie': cookie }
    });

    const otherData = await otherRes.json();
    const otherStartups = otherData.startups;

    const foundInOther = otherStartups.some(s => s.title.startsWith('Isolated Startup'));
    if (!foundInOther) {
        console.log('SUCCESS: Startup NOT found in other user list');
    } else {
        console.error('FAILURE: Startup FOUND in other user list (Isolation failed)');
    }

    // Cleanup
    fs.unlinkSync(pdfPath);
}

verifyIsolation().catch(console.error);
