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

        // Make API call to eSIM Access to create order
        try {
            const response = await axios.post(
                `${ESIM_ACCESS_BASE_URL}/orders`,
                {
                    type: 1, // Data package type
                    packageCode: product.esimAccessPackageCode || product.name, // Use package code from product or fallback to name
                    quantity: 1,
                    description: `Order for ${product.name}`
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'AccessCode': accessCode,
                        'SecretKey': secretKey
                    }
                }
            );

            const orderData = response.data;
            strapi.log.info('eSIM Access order created:', orderData);

            return {
                orderNo: orderData.orderNo || orderData.data?.orderNo,
                iccid: orderData.iccid || orderData.data?.iccid,
                matchingId: orderData.matchingId || orderData.data?.matchingId,
                smdpAddress: orderData.smdpAddress || orderData.data?.smdpAddress || 'rsp.esimaccess.com',
                qrCode: orderData.qrCode || orderData.data?.qrCode || orderData.data?.qrCodeData
            };
        } catch (error) {
            strapi.log.error('eSIM Access API error:', error.response?.data || error.message);
            throw new Error(`Failed to create eSIM order: ${error.response?.data?.message || error.message}`);
        }
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
                        'AccessCode': accessCode,
                        'SecretKey': secretKey
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
