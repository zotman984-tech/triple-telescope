module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/products',
            handler: 'product.find',
            config: {
                auth: false,
            },
        },
        {
            method: 'GET',
            path: '/products/:id',
            handler: 'product.findOne',
            config: {
                auth: false,
            },
        },
    ],
};
