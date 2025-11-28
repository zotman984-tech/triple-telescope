const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '.env') });

const Strapi = require('@strapi/strapi');

async function listLatestEsims() {
    // Correct way to initialize Strapi v5/v4
    const strapi = await Strapi.createStrapi({ distDir: './dist' }).load();

    try {
        const esims = await strapi.entityService.findMany('api::esim.esim', {
            sort: { createdAt: 'desc' },
            limit: 5,
            populate: ['user', 'product']
        });

        console.log('Latest 5 eSIMs:');
        esims.forEach(esim => {
            console.log(JSON.stringify({
                id: esim.id,
                createdAt: esim.createdAt,
                stripeSessionId: esim.stripeSessionId,
                user: esim.user ? esim.user.email : 'none',
                product: esim.product ? esim.product.name : 'none'
            }, null, 2));
        });

    } catch (error) {
        console.error('Error:', error);
    }

    process.exit(0);
}

listLatestEsims();
