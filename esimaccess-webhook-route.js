module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/webhook/esimaccess',
            handler: 'esimaccess-webhook.handleWebhook',
            config: {
                auth: false,
            },
        },
    ],
};
