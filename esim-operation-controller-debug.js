module.exports = {
    async order(ctx) {
        console.log('Order request received:', JSON.stringify(ctx.request.body));
        const { productId, userId, email } = ctx.request.body;
        try {
            const session = await strapi.service('api::esim-operation.esim-operation').createOrderSession(productId, userId, email);
            ctx.body = { sessionId: session.id, url: session.url };
        } catch (err) {
            console.error('Order error:', err);
            ctx.throw(500, err);
        }
    },
    async topup(ctx) {
        const { esimId, topUpPackageId } = ctx.request.body;
        try {
            const session = await strapi.service('api::esim-operation.esim-operation').createTopupSession(esimId, topUpPackageId);
            ctx.body = { sessionId: session.id, url: session.url };
        } catch (err) {
            ctx.throw(500, err);
        }
    },
};
