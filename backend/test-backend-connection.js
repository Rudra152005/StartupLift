import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const testUser = {
    email: 'testsetup@example.com',
    password: 'password123'
};

const testBackend = async () => {
    try {
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, testUser);
        console.log('Login successful.');
        const token = loginRes.data.token;

        console.log('2. Fetching Dashboard Overview...');
        const dashboardRes = await axios.get(`${API_URL}/dashboard/overview`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Dashboard Data Response:');
        console.log(JSON.stringify(dashboardRes.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
        } else {
            console.error('Connection Error:', error.message);
        }
    }
};

testBackend();
