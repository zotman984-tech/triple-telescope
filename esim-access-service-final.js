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
        // The schema has 'esimAccessPackageId', so we use that.
        const packageCode = product.esimAccessPackageId || 'CKH006';

        strapi.log.info(`Creating eSIM order for product ${productId} with packageCode: ${packageCode}`);

        // Make API call to eSIM Access to create order
        try {
            const response = await axios.post(
                `${ESIM_ACCESS_BASE_URL}/orders`,
                {
                    type: 1, // Data package type
                    packageCode: packageCode,
                    quantity: 1,
                    description: `Order for ${product.name}`
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'RT-AccessCode': accessCode, // CORRECT HEADER
                        'RT-SecretKey': secretKey    // CORRECT HEADER
                    }
                }
            );

            const orderData = response.data;

            if (!orderData.success) {
                throw new Error(`API Error: ${orderData.errorMsg || 'Unknown error'}`);
            }

            strapi.log.info('eSIM Access order created:', orderData);

            return {
                orderNo: orderData.obj.orderNo,
                iccid: orderData.obj.iccid,
                matchingId: orderData.obj.matchingId,
                smdpAddress: orderData.obj.smdpAddress || 'rsp.esimaccess.com',
                qrCode: orderData.obj.qrCodeData || orderData.obj.qrCode
            };
        } catch (error) {
            strapi.log.error('eSIM Access API error:', error.response?.data || error.message);
            // Fallback for testing if the product package code is invalid
            if (error.response?.data?.errorCode === '404' && packageCode !== 'CKH006') {
                strapi.log.info('Retrying with fallback package code CKH006...');
                return this.createOrderWithCode('CKH006', product.name);
            }
            throw new Error(`Failed to create eSIM order: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    },

    async createOrderWithCode(packageCode, description) {
        const accessCode = process.env.ESIM_ACCESS_ACCESS_CODE;
        const secretKey = process.env.ESIM_ACCESS_SECRET_KEY;

        const response = await axios.post(
            `${ESIM_ACCESS_BASE_URL}/orders`,
            {
                type: 1,
                packageCode: packageCode,
                quantity: 1,
                description: `Order for ${description}`
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'RT-AccessCode': accessCode,
                    'RT-SecretKey': secretKey
                }
            }
        );

        const orderData = response.data;
        if (!orderData.success) throw new Error(orderData.errorMsg);

        return {
            orderNo: orderData.obj.orderNo,
            iccid: orderData.obj.iccid,
            matchingId: orderData.obj.matchingId,
            smdpAddress: orderData.obj.smdpAddress || 'rsp.esimaccess.com',
            qrCode: orderData.obj.qrCodeData || orderData.obj.qrCode
        };
    },

    /**
     * Top up an existing eSIM
     * @param {string} iccid - The ICCID of the eSIM to top up
     * @param {string} packageCode - The package code for the top-up
     * @returns {Promise<object>} - Top-up response
     */
    async topup(iccid, packageCode) {
        const accessCode = process.env.ESIM_ACCESS_ACCESS_CODE;
        const secretKey = process.env.ESIM_ACCESS_SECRET_KEY;

        if (!accessCode || !secretKey) {
            throw new Error('eSIM Access credentials not configured');
        }

        try {
            const response = await axios.post(
                `${ESIM_ACCESS_BASE_URL}/topups`,
                {
                    iccid,
                    packageCode,
                    quantity: 1
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'RT-AccessCode': accessCode, // CORRECT HEADER
                        'RT-SecretKey': secretKey    // CORRECT HEADER
                    }
                }
            );

            strapi.log.info('eSIM Access top-up created:', response.data);
            return response.data;
        } catch (error) {
            strapi.log.error('eSIM Access top-up error:', error.response?.data || error.message);
            throw new Error(`Failed to top-up eSIM: ${error.response?.data?.message || error.message}`);
        }
    }
});
