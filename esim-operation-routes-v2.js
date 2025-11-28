module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/esim/order',
            handler: 'esim-operation.createOrderSession',
            config: {
                policies: [],
                middlewares: [],
                auth: false
            },
        },
        {
            method: 'POST',
            path: '/esim/topup',
            handler: 'esim-operation.createTopupSession',
            config: {
                policies: [],
                middlewares: [],
                auth: false
            },
        },
        {
            method: 'GET',
            path: '/esim/order/:sessionId',
            handler: 'esim-operation.getOrderBySession',
            config: {
                policies: [],
                middlewares: [],
                auth: false // Allow public access for now, or secure as needed
            },
        }
    ],
};
