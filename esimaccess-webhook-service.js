module.exports = ({ strapi }) => ({
    async handleOrderEvent(data) {
        strapi.log.info('Processing eSIM Access order event:', data);

        // Update eSIM status if order is completed/activated
        // This is a placeholder - adjust based on actual webhook payload structure
        const orderId = data.orderId || data.orderNo;

        if (orderId) {
            const esim = await strapi.db.query('api::esim.esim').findOne({
                where: { esimAccessOrderId: orderId }
            });

            if (esim) {
                await strapi.entityService.update('api::esim.esim', esim.id, {
                    data: {
                        status: 'active',
                        // Update other fields as needed from webhook data
                    }
                });
            }
        }
    },

    async handleTopupEvent(data) {
        strapi.log.info('Processing eSIM Access topup event:', data);

        // Update eSIM with topup information
        // This is a placeholder - adjust based on actual webhook payload structure
    },
});
