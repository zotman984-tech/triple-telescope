const axios = require('axios');

const accessCode = '52ae832167194edebca803a3898bb15b';
const secretKey = '89c1207a02ce4a099a468793978303be';

async function listPackages() {
    try {
        const response = await axios.get(
            'https://api.esimaccess.com/api/v1/packages',
            {
                headers: {
                    'AccessCode': accessCode,
                    'SecretKey': secretKey
                },
                params: {
                    locationCode: 'FR' // Try to get packages for France
                }
            }
        );
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

listPackages();
