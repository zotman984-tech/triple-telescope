const axios = require('axios');

const accessCode = '52ae832167194edebca803a3898bb15b';
const secretKey = '89c1207a02ce4a099a468793978303be';
const baseUrl = 'https://api.esimaccess.com/api/v1';

async function listPackages() {
    try {
        console.log('Testing with RT- headers...');
        const response = await axios.post(
            `${baseUrl}/open/package/list`,
            { locationCode: 'FR' },
            {
                headers: {
                    'RT-AccessCode': accessCode,
                    'RT-SecretKey': secretKey,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log(JSON.stringify(response.data, null, 2).substring(0, 1000));
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

listPackages();
