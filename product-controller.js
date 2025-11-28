module.exports = {
    async find(ctx) {
        const products = await strapi.entityService.findMany('api::product.product', {
            ...ctx.query,
        });
        return products;
    },

    async findOne(ctx) {
        const { id } = ctx.params;
        const product = await strapi.entityService.findOne('api::product.product', id, {
            ...ctx.query,
        });
        return product;
    },
};
