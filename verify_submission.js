const fs = require('fs');
const path = require('path');

async function submit() {
    try {
        if (!global.FormData || !global.Blob) {
            console.log('FormData or Blob not available globally.');
            return;
        }

        const formData = new FormData();
        formData.append('title', 'Test Script');
        formData.append('description', 'Test Description from Script');
        formData.append('category', 'AI/ML');
        formData.append('stage', 'MVP');
        formData.append('projectType', 'Individual');
        formData.append('linkedIn', 'https://linkedin.com');
        formData.append('email', 'test@script.com');
        formData.append('teamMembers', JSON.stringify([{ name: 'Script User', role: 'Tester' }]));

        const filePath = path.join(__dirname, 'pitchdeck', 'SmartCampus IoT Pitch Deck.pdf');
        const fileBuffer = fs.readFileSync(filePath);
        const blob = new Blob([fileBuffer], { type: 'application/pdf' });
        formData.append('pitchDeck', blob, 'SmartCampus IoT Pitch Deck.pdf');

        const response = await fetch('http://localhost:3000/api/submit-startup', {
            method: 'POST',
            body: formData
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Body:', text);
    } catch (error) {
        console.error('Error:', error);
    }
}

submit();
