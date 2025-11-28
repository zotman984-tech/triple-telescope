module.exports = {
    async handleStripe(ctx) {
        const signature = ctx.request.headers['stripe-signature'];
        const body = ctx.request.body;

        try {
            await strapi.service('api::webhook.webhook').processEvent(body, signature);
            ctx.body = { received: true };
        } catch (err) {
            ctx.throw(400, `Webhook Error: ${err.message}`);
        }
    },
};
