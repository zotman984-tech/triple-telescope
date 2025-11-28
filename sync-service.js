const axios = require('axios');

module.exports = ({ strapi }) => ({
    async syncPackages() {
        const accessCode = process.env.ESIM_ACCESS_ACCESS_CODE;
        const secretKey = process.env.ESIM_ACCESS_SECRET_KEY;

        try {
            // Appel réel à l'API eSIM Access
            const response = await axios.get('https://api.esimaccess.com/api/v1/open/package/list', {
                headers: {
                    'RT-AccessCode': accessCode,
                    'RT-SecretKey': secretKey
                }
            });

            const packages = response.data.obj?.packageList || [];
            let created = 0;
            let updated = 0;

            for (const pkg of packages) {
                // Déterminer le type
                let type = 'standard';
                if (pkg.name?.toLowerCase().includes('unlimited') || pkg.dataAmount === -1) {
                    type = 'unlimited';
                } else if (pkg.regionList?.length > 1 || pkg.name?.toLowerCase().includes('global')) {
                    type = 'global';
                }

                // Vérifier si le produit existe déjà
                const existing = await strapi.db.query('api::product.product').findOne({
                    where: { esimAccessPackageId: pkg.packageCode }
                });

                const productData = {
                    name: pkg.name,
                    type: type,
                    isTopUpAvailable: pkg.isTopUpAvailable || false,
                    esimAccessPackageId: pkg.packageCode,
                    region: pkg.regionList?.[0] || null,
                    country: pkg.countryList?.[0] || null,
                    dataAmountGB: pkg.dataAmount > 0 ? pkg.dataAmount / 1024 : null, // Convert MB to GB
                    validityDays: pkg.validityDays || null,
                    provider: 'esimAccess'
                };

                if (existing) {
                    // Update sans écraser price, shortDescription, longDescription
                    await strapi.entityService.update('api::product.product', existing.id, {
                        data: productData
                    });
                    updated++;
                } else {
                    // Créer nouveau produit
                    await strapi.entityService.create('api::product.product', {
                        data: {
                            ...productData,
                            price: 0, // Prix par défaut, à configurer manuellement
                            currency: 'EUR',
                            shortDescription: '',
                            longDescription: ''
                        }
                    });
                    created++;
                }
            }

            return {
                success: true,
                message: `Synchronization complete: ${created} created, ${updated} updated`,
                total: packages.length
            };
        } catch (error) {
            strapi.log.error('eSIM Access sync error:', error);
            throw new Error(`Sync failed: ${error.message}`);
        }
    },
});
