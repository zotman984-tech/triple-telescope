const axios = require('axios');

const accessCode = '52ae832167194edebca803a3898bb15b';
const secretKey = '89c1207a02ce4a099a468793978303be';
const baseUrl = 'https://api.esimaccess.com/api/v1';
const orderNo = 'B25112620120003'; // The order we just created

const endpoints = [
    '/open/esim/query',
    '/esim/query',
    '/open/order/query',
    '/order/query'
];

async function testQuery() {
    for (const endpoint of endpoints) {
        try {
            console.log(`Testing POST ${baseUrl}${endpoint}...`);
            const response = await axios.post(
                `${baseUrl}${endpoint}`,
                {
                    orderNo: orderNo
                },
                {
                    headers: {
                        'RT-AccessCode': accessCode,
                        'RT-SecretKey': secretKey,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('SUCCESS!');
            console.log(JSON.stringify(response.data, null, 2));
            return;
        } catch (error) {
            console.log(`FAILED: ${endpoint} - ${error.response?.status} ${error.response?.statusText}`);
            if (error.response?.data) {
                console.log('Error data:', JSON.stringify(error.response.data));
            }
        }
    }
}

testQuery();
