module.exports = ({ env }) => ({
    'users-permissions': {
        config: {
            register: {
                allowedFields: ['username', 'email', 'password'],
            },
        },
    },
});
