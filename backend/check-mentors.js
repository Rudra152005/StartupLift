import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const checkMentors = async () => {
    try {
        console.log('1. Logging in as Admin/User...');
        // Login as the test user we verified earlier
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'testsetup@example.com',
            password: 'password123'
        });
        const token = loginRes.data.token;

        console.log('2. Fetching Mentors...');
        const response = await axios.get(`${API_URL}/mentors`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
            console.log(`Found ${response.data.count} mentors.`);
            if (response.data.count === 0) {
                console.log("No mentors found. You might need to create one manually or update a user's role.");
            } else {
                console.log("Mentors found:", response.data.data.map(m => m.name));
            }
        } else {
            console.log("Failed to fetch mentors:", response.data);
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

checkMentors();
