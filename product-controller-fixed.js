module.exports = {
    async find(ctx) {
        const products = await strapi.entityService.findMany('api::product.product', {
            ...ctx.query,
        });
        return products;
    },

    async findOne(ctx) {
        const { id } = ctx.params;

        // Try to find by documentId first (for string IDs)
        const products = await strapi.entityService.findMany('api::product.product', {
            filters: {
                documentId: id
            },
            ...ctx.query,
        });

        if (products && products.length > 0) {
            return products[0];
        }

        // Fallback to numeric ID
        const product = await strapi.entityService.findOne('api::product.product', id, {
            ...ctx.query,
        });
        return product;
    },
};
