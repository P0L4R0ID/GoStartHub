// Native fetch is available in Node.js 18+
// If node-fetch is not available, we can use the built-in http/https module or assume Node 18+ has fetch.
// Let's try using built-in fetch first (Node 18+).

async function verifyLogin() {
    const email = 'test@example.com';
    const password = 'password123';

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Login successful!');
            console.log('Response:', data);

            // Check for cookies
            const cookies = response.headers.get('set-cookie');
            if (cookies) {
                console.log('Cookies received:', cookies);
            } else {
                console.log('No cookies received (might be an issue if session depends on it).');
            }
        } else {
            console.error('Login failed with status:', response.status);
            const errorText = await response.text();
            console.error('Error details:', errorText);
        }
    } catch (error) {
        console.error('Network error during login verification:', error);
    }
}

verifyLogin();
