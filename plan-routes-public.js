module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/plans',
            handler: 'plan.find',
            config: {
                auth: false, // Disable authentication
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/plans/:id',
            handler: 'plan.findOne',
            config: {
                auth: false, // Disable authentication
                policies: [],
                middlewares: [],
            },
        },
    ],
};
