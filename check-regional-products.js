require('dotenv').config({ path: './esim0-backend/.env' });
const Strapi = require('@strapi/strapi');

async function main() {
    const strapi = await Strapi().load();

    try {
        const products = await strapi.entityService.findMany('api::product.product', {
            filters: { type: 'region' },
            limit: 10
        });

        console.log(JSON.stringify(products, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }

    await strapi.destroy();
    process.exit(0);
}

main();
