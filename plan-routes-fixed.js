module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/plans',
            handler: 'product.find',
            config: {
                auth: false,
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/plans/:id',
            handler: 'product.findOne',
            config: {
                auth: false,
                policies: [],
                middlewares: [],
            },
        },
    ],
};
