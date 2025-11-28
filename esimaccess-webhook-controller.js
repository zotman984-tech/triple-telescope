module.exports = {
    async handleWebhook(ctx) {
        const body = ctx.request.body;

        try {
            strapi.log.info('eSIM Access webhook received:', body);

            // Process different event types
            const eventType = body.eventType || body.type;

            switch (eventType) {
                case 'order.completed':
                case 'order.activated':
                    // Handle order completion/activation
                    await strapi.service('api::esimaccess-webhook.esimaccess-webhook').handleOrderEvent(body);
                    break;

                case 'topup.completed':
                    // Handle top-up completion
                    await strapi.service('api::esimaccess-webhook.esimaccess-webhook').handleTopupEvent(body);
                    break;

                default:
                    strapi.log.warn('Unknown eSIM Access event type:', eventType);
            }

            ctx.body = { received: true };
        } catch (err) {
            strapi.log.error('eSIM Access webhook error:', err);
            ctx.throw(400, `Webhook Error: ${err.message}`);
        }
    },
};
