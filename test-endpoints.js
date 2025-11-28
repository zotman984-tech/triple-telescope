const axios = require('axios');

const accessCode = '52ae832167194edebca803a3898bb15b';
const secretKey = '89c1207a02ce4a099a468793978303be';
const baseUrl = 'https://api.esimaccess.com/api/v1';

const endpoints = [
    { method: 'POST', url: '/open/package/list' },
    { method: 'POST', url: '/packages' },
    { method: 'POST', url: '/package/list' },
    { method: 'GET', url: '/products' }
];

async function testEndpoints() {
    for (const endpoint of endpoints) {
        try {
            console.log(`Testing ${endpoint.method} ${baseUrl}${endpoint.url}...`);
            const config = {
                method: endpoint.method,
                url: `${baseUrl}${endpoint.url}`,
                headers: {
                    'AccessCode': accessCode,
                    'SecretKey': secretKey,
                    'Content-Type': 'application/json'
                },
                data: endpoint.method === 'POST' ? { locationCode: 'FR' } : undefined
            };

            const response = await axios(config);
            console.log(`SUCCESS: ${endpoint.url}`);
            console.log(JSON.stringify(response.data, null, 2).substring(0, 500)); // Print first 500 chars
            return; // Stop if success
        } catch (error) {
            console.log(`FAILED: ${endpoint.url} - ${error.response?.status} ${error.response?.statusText}`);
        }
    }
}

testEndpoints();
