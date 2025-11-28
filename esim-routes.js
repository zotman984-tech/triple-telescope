module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/esims',
            handler: 'esim.find',
            config: {
                auth: false,
            },
        },
        {
            method: 'GET',
            path: '/esims/:id',
            handler: 'esim.findOne',
            config: {
                auth: false,
            },
        },
    ],
};
