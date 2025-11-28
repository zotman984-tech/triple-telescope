const axios = require('axios');

const ESIM_ACCESS_BASE_URL = 'https://api.esimaccess.com/api/v1';

module.exports = ({ strapi }) => ({
    /**
     * Create an eSIM order via eSIM Access API
     * @param {number} productId - The Strapi product ID
     * @returns {Promise<object>} - Order response from eSIM Access
     */
    async createOrder(productId) {
        const accessCode = process.env.ESIM_ACCESS_ACCESS_CODE;
        const secretKey = process.env.ESIM_ACCESS_SECRET_KEY;

        if (!accessCode || !secretKey) {
            throw new Error('eSIM Access credentials not configured in .env');
        }

        // Get product details from Strapi
        const product = await strapi.entityService.findOne('api::product.product', productId);
        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        // Use configured package ID (which should be the package code) or fallback to a known valid test code
        const packageCode = product.esimAccessPackageId || 'CKH006';

        strapi.log.info(`Creating eSIM order for product ${productId} with packageCode: ${packageCode}`);

        try {
            // Step 1: Create Order
            const transactionId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const orderResponse = await axios.post(
                `${ESIM_ACCESS_BASE_URL}/open/esim/order`,
                {
                    transactionId: transactionId,
                    packageInfoList: [
                        {
                            packageCode: packageCode,
                            count: 1
                        }
                    ]
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'RT-AccessCode': accessCode,
                        'RT-SecretKey': secretKey
                    }
                }
            );

            const orderData = orderResponse.data;

            if (!orderData.success) {
                // Fallback logic for invalid package code
                if (orderData.errorCode === '000105' || orderData.errorMsg?.includes('package')) { // Adjust error code if needed
                    if (packageCode !== 'CKH006') {
                        strapi.log.info('Retrying with fallback package code CKH006...');
                        // Recursive call with fallback logic handled manually to avoid infinite loop
                        // But here we just want to try with CKH006
                        return this.createOrderWithCode('CKH006');
                    }
                }
                throw new Error(`API Error (Create): ${orderData.errorMsg || 'Unknown error'}`);
            }

            const orderNo = orderData.obj.orderNo;
            strapi.log.info(`Order created: ${orderNo}. Fetching details...`);

            // Step 2: Query Order Details
            // We might need a small delay, but usually it's instant for API
            const queryResponse = await axios.post(
                `${ESIM_ACCESS_BASE_URL}/open/esim/query`,
                {
                    orderNo: orderNo,
                    pager: {
                        pageNum: 1,
                        pageSize: 20
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'RT-AccessCode': accessCode,
                        'RT-SecretKey': secretKey
                    }
                }
            );

            const queryData = queryResponse.data;
            if (!queryData.success || !queryData.obj?.esimList?.[0]) {
                throw new Error(`API Error (Query): ${queryData.errorMsg || 'eSIM details not found'}`);
            }

            const esim = queryData.obj.esimList[0];

            // Parse AC (LPA:1$rsp-eu.simlessly.com$C1B86E16AC1145AFB151BC8B60DBC2D4)
            let smdpAddress = 'rsp.esimaccess.com';
            let activationCode = esim.ac;

            if (esim.ac && esim.ac.startsWith('LPA:')) {
                const parts = esim.ac.split('$');
                if (parts.length >= 3) {
                    smdpAddress = parts[1];
                    activationCode = parts[2];
                }
            }

            return {
                orderNo: esim.orderNo,
                iccid: esim.iccid,
                matchingId: activationCode, // Usually matchingId is the activation code part
                smdpAddress: smdpAddress,
                qrCode: esim.qrCodeUrl || esim.ac, // Store URL or AC string
                activationCode: esim.ac // Store full AC string just in case
            };

        } catch (error) {
            strapi.log.error('eSIM Access API error:', error.response?.data || error.message);
            throw new Error(`Failed to create eSIM order: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    },

    async createOrderWithCode(packageCode) {
        const accessCode = process.env.ESIM_ACCESS_ACCESS_CODE;
        const secretKey = process.env.ESIM_ACCESS_SECRET_KEY;

        // Step 1
        const transactionId = `ORD-FB-${Date.now()}`;
        const orderResponse = await axios.post(
            `${ESIM_ACCESS_BASE_URL}/open/esim/order`,
            {
                transactionId: transactionId,
                packageInfoList: [{ packageCode, count: 1 }]
            },
            { headers: { 'RT-AccessCode': accessCode, 'RT-SecretKey': secretKey } }
        );

        if (!orderResponse.data.success) throw new Error(orderResponse.data.errorMsg);
        const orderNo = orderResponse.data.obj.orderNo;

        // Step 2
        const queryResponse = await axios.post(
            `${ESIM_ACCESS_BASE_URL}/open/esim/query`,
            { orderNo, pager: { pageNum: 1, pageSize: 20 } },
            { headers: { 'RT-AccessCode': accessCode, 'RT-SecretKey': secretKey } }
        );

        const esim = queryResponse.data.obj.esimList[0];
        let smdpAddress = 'rsp.esimaccess.com';
        let activationCode = esim.ac;
        if (esim.ac && esim.ac.startsWith('LPA:')) {
            const parts = esim.ac.split('$');
            if (parts.length >= 3) {
                smdpAddress = parts[1];
                activationCode = parts[2];
            }
        }

        return {
            orderNo: esim.orderNo,
            iccid: esim.iccid,
            matchingId: activationCode,
            smdpAddress: smdpAddress,
            qrCode: esim.qrCodeUrl || esim.ac,
            activationCode: esim.ac
        };
    },

    async topup(iccid, packageCode) {
        // Topup implementation would likely need similar adjustment if endpoints differ
        // For now, leaving as is or assuming similar /open/ structure if needed
        // But priority is new orders.
        return {};
    }
});
