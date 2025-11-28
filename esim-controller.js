module.exports = {
    async find(ctx) {
        const { query } = ctx;
        const entities = await strapi.service('api::esim.esim').find(query);
        return entities;
    },
    async findOne(ctx) {
        const { id } = ctx.params;
        const entity = await strapi.service('api::esim.esim').findOne(id);
        return entity;
    },
};
