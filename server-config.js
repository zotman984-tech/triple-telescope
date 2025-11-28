module.exports = ({ env }) => ({
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    app: {
        keys: env.array('APP_KEYS'),
    },
    webhooks: {
        populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
    },
    // Allow the domain for admin access
    url: env('PUBLIC_URL', 'https://api.esimfree.store'),
    proxy: env.bool('IS_PROXIED', true),
});
