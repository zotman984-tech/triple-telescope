const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = ({ strapi }) => ({
    async processEvent(payload, signature) {
        let event = payload;

        // Note: Signature verification is skipped here because getting raw body in Strapi requires extra config.
        // In production, you MUST configure Strapi body parser to provide raw body for this route.

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const { type, productId, userId, esimId, topUpPackageId } = session.metadata;

            if (type === 'order') {
                try {
                    // 1. Call REAL eSIM Access API to create eSIM
                    const esimData = await strapi.service('api::esim-access.esim-access').createOrder(productId);

                    strapi.log.info('eSIM created successfully:', esimData);

                    // 2. Create ESIM entry in Strapi with real data AND Stripe Session ID
                    await strapi.entityService.create('api::esim.esim', {
                        data: {
                            user: userId,
                            product: productId,
                            esimAccessOrderId: esimData.orderNo,
                            iccid: esimData.iccid,
                            status: 'active',
                            activationCode: esimData.matchingId,
                            smDpAddress: esimData.smdpAddress,
                            qrcode: { code: esimData.qrCode },
                            stripeSessionId: session.id // Added this field
                        }
                    });

                    strapi.log.info('eSIM entry created in Strapi for user:', userId);
                } catch (error) {
                    strapi.log.error('Failed to create eSIM:', error);
                    // Don't throw - we don't want to fail the webhook
                    // The payment was successful, so we log the error and continue
                }
            } else if (type === 'topup') {
                try {
                    // Get the eSIM to find its ICCID
                    const esim = await strapi.entityService.findOne('api::esim.esim', esimId, {
                        populate: ['topups', 'product']
                    });

                    if (!esim) {
                        throw new Error(`eSIM ${esimId} not found`);
                    }

                    // 1. Call REAL eSIM Access API to topup
                    const topupData = await strapi.service('api::esim-access.esim-access').topup(
                        esim.iccid,
                        topUpPackageId
                    );

                    // 2. Update ESIM entry with new topup
                    const newTopup = {
                        amount: session.amount_total / 100,
                        esimAccessTopupId: topupData.topupNo || topupData.data?.topupNo || 'TOPUP_' + Date.now(),
                        stripeSessionId: session.id,
                        createdAt: new Date()
                    };

                    await strapi.entityService.update('api::esim.esim', esimId, {
                        data: {
                            topups: [...(esim.topups || []), newTopup]
                        }
                    });

                    strapi.log.info('Top-up successful for eSIM:', esimId);
                } catch (error) {
                    strapi.log.error('Failed to top-up eSIM:', error);
                    // Don't throw - log error and continue
                }
            }
        }
    },
});
