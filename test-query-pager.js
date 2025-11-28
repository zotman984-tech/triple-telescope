const axios = require('axios');

const accessCode = '52ae832167194edebca803a3898bb15b';
const secretKey = '89c1207a02ce4a099a468793978303be';
const url = 'https://api.esimaccess.com/api/v1/open/esim/query';
const orderNo = 'B25112620120003';

async function testQuery() {
    try {
        console.log(`Testing POST ${url}...`);
        const response = await axios.post(
            url,
            {
                orderNo: orderNo,
                pager: {
                    pageNum: 1,
                    pageSize: 20
                }
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
    } catch (error) {
        console.log(`FAILED: ${error.response?.status} ${error.response?.statusText}`);
        console.log('Error data:', JSON.stringify(error.response?.data));
    }
}

testQuery();
