const axios = require('axios');

const accessCode = '52ae832167194edebca803a3898bb15b';
const secretKey = '89c1207a02ce4a099a468793978303be';
const url = 'https://api.esimaccess.com/api/v1/open/esim/order';

const payloads = [
    {
        name: 'Structure 1: packageInfoList with count',
        data: {
            transactionId: `TEST_${Date.now()}_1`,
            packageInfoList: [
                {
                    packageCode: 'CKH006',
                    count: 1
                }
            ]
        }
    },
    {
        name: 'Structure 2: packageInfoList with quantity',
        data: {
            transactionId: `TEST_${Date.now()}_2`,
            packageInfoList: [
                {
                    packageCode: 'CKH006',
                    quantity: 1
                }
            ]
        }
    },
    {
        name: 'Structure 3: packageInfoList with price',
        data: {
            transactionId: `TEST_${Date.now()}_3`,
            packageInfoList: [
                {
                    packageCode: 'CKH006',
                    price: 1000,
                    count: 1
                }
            ]
        }
    }
];

async function testPayloads() {
    for (const payload of payloads) {
        try {
            console.log(`Testing ${payload.name}...`);
            const response = await axios.post(
                url,
                payload.data,
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
            console.log(`FAILED: ${error.response?.status} ${error.response?.statusText}`);
            console.log('Error data:', JSON.stringify(error.response?.data));
        }
    }
}

testPayloads();
