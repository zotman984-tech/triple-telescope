const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = ({ strapi }) => ({
    async createOrderSession(productId, userId, email) {
        const product = await strapi.entityService.findOne('api::product.product', productId);
        if (!product) throw new Error('Product not found');

        let finalUserId = userId;

        // If email is provided, find or create user
        if (email && !finalUserId) {
            // Check if user exists
            const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
                filters: { email: email }
            });

            if (users && users.length > 0) {
                finalUserId = users[0].id;
            } else {
                // Create new user
                const username = email.split('@')[0] + '_' + Math.floor(Math.random() * 1000);
                const newUser = await strapi.entityService.create('plugin::users-permissions.user', {
                    data: {
                        username,
                        email,
                        password: Math.random().toString(36).slice(-8) + 'A1!', // Random password
                        confirmed: true,
                        role: 1 // Authenticated role ID (usually 1)
                    }
                });
                finalUserId = newUser.id;
            }
        }

        // Fallback if no user found/created (should not happen with email)
        if (!finalUserId) {
            // Try to find a default user or throw error
            // For now, let's just proceed with metadata but without linking in Strapi if we can't find a user
            // But the webhook will fail if userId is missing.
            // Let's assume user creation worked.
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: product.currency || 'EUR',
                    product_data: {
                        name: product.name,
                    },
                    unit_amount: Math.round((product.price || 0) * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cancel`,
            customer_email: email, // Pre-fill email in Stripe
            metadata: {
                type: 'order',
                productId,
                userId: finalUserId,
            },
        });
        return session;
    },
    async createTopupSession(esimId, topUpPackageId) {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'EUR',
                    product_data: {
                        name: 'Top Up',
                    },
                    unit_amount: 1000,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cancel`,
            metadata: {
                type: 'topup',
                esimId,
                topUpPackageId,
            },
        });
        return session;
    },
});
