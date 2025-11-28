module.exports = ({ strapi }) => ({
    async find(query) {
        return strapi.entityService.findMany('api::esim.esim', {
            ...query,
            populate: ['user', 'product', 'topups'],
        });
    },
    async findOne(id) {
        return strapi.entityService.findOne('api::esim.esim', id, {
            populate: ['user', 'product', 'topups'],
        });
    },
});
