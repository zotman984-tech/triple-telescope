module.exports = {
    async order(ctx) {
        const { productId, userId, email } = ctx.request.body;
        try {
            const session = await strapi.service('api::esim-operation.esim-operation').createOrderSession(productId, userId, email);
            ctx.body = { sessionId: session.id, url: session.url };
        } catch (err) {
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
