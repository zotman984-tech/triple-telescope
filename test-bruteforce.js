const axios = require('axios');

const accessCode = '52ae832167194edebca803a3898bb15b';
const secretKey = '89c1207a02ce4a099a468793978303be';
const baseUrl = 'https://api.esimaccess.com/api/v1';

const endpoints = [
    '/esim/order',
    '/open/esim/order',
    '/common/esim/order',
    '/order/create',
    '/orders/create',
    '/purchase',
    '/open/purchase',
    '/esim/create',
    '/open/esim/create',
    '/open/order/create'
];

async function testEndpoints() {
    for (const endpoint of endpoints) {
        try {
            console.log(`Testing POST ${baseUrl}${endpoint}...`);
            const response = await axios.post(
                `${baseUrl}${endpoint}`,
                {
                    type: 1,
                    packageCode: 'CKH006',
                    quantity: 1,
                    transactionId: `TEST_${Date.now()}`
                },
                {
                    headers: {
                        'RT-AccessCode': accessCode,
                        'RT-SecretKey': secretKey,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log(`SUCCESS: ${endpoint}`);
            console.log(JSON.stringify(response.data, null, 2));
            return;
        } catch (error) {
            console.log(`FAILED: ${endpoint} - ${error.response?.status} ${error.response?.statusText}`);
        }
    }
}

testEndpoints();
