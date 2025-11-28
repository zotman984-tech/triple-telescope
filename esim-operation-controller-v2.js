'use strict';

/**
 * A set of functions called "actions" for `esim-operation`
 */

module.exports = {
    createOrderSession: async (ctx, next) => {
        try {
            const { productId, email } = ctx.request.body;

            if (!productId || !email) {
                ctx.status = 400;
                ctx.body = { error: 'Product ID and Email are required' };
                return;
            }

            const session = await strapi
                .service('api::esim-operation.esim-operation')
                .createOrderSession(productId, null, email);

            ctx.body = { url: session.url };
        } catch (err) {
            ctx.status = 500;
            ctx.body = { error: err.message };
        }
    },

    createTopupSession: async (ctx, next) => {
        try {
            const { iccid, packageId } = ctx.request.body;

            if (!iccid || !packageId) {
                ctx.status = 400;
                ctx.body = { error: 'ICCID and Package ID are required' };
                return;
            }

            const session = await strapi
                .service('api::esim-operation.esim-operation')
                .createTopupSession(iccid, packageId);

            ctx.body = { url: session.url };
        } catch (err) {
            ctx.status = 500;
            ctx.body = { error: err.message };
        }
    },

    getOrderBySession: async (ctx, next) => {
        try {
            const { sessionId } = ctx.params;

            if (!sessionId) {
                ctx.status = 400;
                ctx.body = { error: 'Session ID is required' };
                return;
            }

            // Find the eSIM with this stripeSessionId
            const esims = await strapi.entityService.findMany('api::esim.esim', {
                filters: { stripeSessionId: sessionId },
                populate: ['product']
            });

            if (!esims || esims.length === 0) {
                ctx.status = 404;
                ctx.body = { error: 'Order not found' };
                return;
            }

            const esim = esims[0];

            ctx.body = {
                id: esim.id,
                iccid: esim.iccid,
                activationCode: esim.activationCode,
                smDpAddress: esim.smDpAddress,
                qrCode: esim.qrcode?.code,
                productName: esim.product?.name,
                status: esim.status
            };

        } catch (err) {
            ctx.status = 500;
            ctx.body = { error: err.message };
        }
    }
};
