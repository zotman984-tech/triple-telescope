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
                if (orderData.errorCode === '000105' || orderData.errorMsg?.includes('package')) {
                    if (packageCode !== 'CKH006') {
                        strapi.log.info('Retrying with fallback package code CKH006...');
                        return this.createOrderWithCode('CKH006');
                    }
                }
                throw new Error(`API Error (Create): ${orderData.errorMsg || 'Unknown error'}`);
            }

            const orderNo = orderData.obj.orderNo;
            strapi.log.info(`Order created: ${orderNo}. Polling for details...`);

            // Step 2: Query Order Details with Polling (Retry)
            // The API returns "getting resource" if we query too fast. We need to wait.
            let attempts = 0;
            const maxAttempts = 10;
            const delayMs = 2000; // 2 seconds delay between attempts

            while (attempts < maxAttempts) {
                attempts++;
                await new Promise(resolve => setTimeout(resolve, delayMs)); // Wait before querying

                try {
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

                    // Check if we have valid eSIM data
                    if (queryData.success && queryData.obj?.esimList?.[0]) {
                        const esim = queryData.obj.esimList[0];

                        // If status is still "getting resource" or similar, we might need to check specific fields
                        // But usually if it's in the list with an ICCID, it's good.
                        // The error "the batchOrder has been getting resource" came from the API itself, likely when the list was empty or status was pending.

                        if (esim.iccid) {
                            strapi.log.info(`eSIM details retrieved successfully on attempt ${attempts}`);

                            // Parse AC
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
                        }
                    }
                    strapi.log.info(`Attempt ${attempts}: eSIM not ready yet. Retrying...`);
                } catch (err) {
                    strapi.log.warn(`Attempt ${attempts} failed: ${err.message}`);
                }
            }

            throw new Error(`Timeout: Failed to retrieve eSIM details after ${maxAttempts} attempts.`);

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

        // Step 2 with Polling
        let attempts = 0;
        while (attempts < 10) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 2000));

            const queryResponse = await axios.post(
                `${ESIM_ACCESS_BASE_URL}/open/esim/query`,
                { orderNo, pager: { pageNum: 1, pageSize: 20 } },
                { headers: { 'RT-AccessCode': accessCode, 'RT-SecretKey': secretKey } }
            );

            if (queryResponse.data.success && queryResponse.data.obj?.esimList?.[0]?.iccid) {
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
            }
        }
        throw new Error("Timeout waiting for eSIM details");
    },

    async topup(iccid, packageCode) {
        return {};
    }
});
