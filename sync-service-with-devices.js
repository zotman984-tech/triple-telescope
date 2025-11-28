const axios = require('axios');

module.exports = ({ strapi }) => ({
    async syncPackages() {
        const accessCode = process.env.ESIM_ACCESS_ACCESS_CODE;
        const secretKey = process.env.ESIM_ACCESS_SECRET_KEY;

        try {
            // Appel réel à l'API eSIM Access (POST avec body vide)
            const response = await axios.post('https://api.esimaccess.com/api/v1/open/package/list', {}, {
                headers: {
                    'RT-AccessCode': accessCode,
                    'RT-SecretKey': secretKey,
                    'Content-Type': 'application/json'
                }
            });

            const packages = response.data.obj?.packageList || [];
            let created = 0;
            let updated = 0;

            for (const pkg of packages) {
                // Déterminer le type
                let type = 'standard';
                if (pkg.name?.toLowerCase().includes('unlimited') || pkg.dataType === 2) {
                    type = 'unlimited';
                } else if (pkg.locationCode?.includes(',') || pkg.locationCode?.includes('-')) {
                    type = 'global';
                }

                // Extraire le drapeau du premier pays
                let countryFlag = null;
                if (pkg.locationNetworkList && pkg.locationNetworkList.length > 0) {
                    countryFlag = pkg.locationNetworkList[0].locationLogo;
                }

                // Extraire les opérateurs réseau et vitesses
                let networkOperators = [];
                let networkSpeed = pkg.speed || '4G/5G';

                if (pkg.locationNetworkList && pkg.locationNetworkList.length > 0) {
                    networkOperators = pkg.locationNetworkList.map(location => ({
                        country: location.locationName,
                        countryCode: location.locationCode,
                        operators: location.operatorList?.map(op => ({
                            name: op.operatorName,
                            network: op.networkType
                        })) || []
                    }));
                }

                // Liste des appareils compatibles (générique pour eSIM)
                const compatibleDevices = {
                    apple: [
                        'iPhone XS, XS Max, XR and newer',
                        'iPad Pro 11-inch (all models)',
                        'iPad Pro 12.9-inch (3rd gen and newer)',
                        'iPad Air (3rd gen and newer)',
                        'iPad (7th gen and newer)',
                        'iPad Mini (5th gen and newer)'
                    ],
                    samsung: [
                        'Galaxy S20, S21, S22, S23, S24 series',
                        'Galaxy Z Flip, Z Fold series',
                        'Galaxy Note 20 series'
                    ],
                    google: [
                        'Pixel 3, 3 XL and newer'
                    ],
                    other: [
                        'Most eSIM-compatible devices released after 2018'
                    ]
                };

                // Vérifier si le produit existe déjà
                const existing = await strapi.db.query('api::product.product').findOne({
                    where: { esimAccessPackageId: pkg.packageCode }
                });

                // Tronquer les valeurs trop longues (max 255 caractères)
                const truncate = (str, max = 255) => str ? str.substring(0, max) : null;

                const productData = {
                    name: truncate(pkg.name),
                    type: type,
                    isTopUpAvailable: pkg.supportTopUpType === 1,
                    esimAccessPackageId: truncate(pkg.packageCode),
                    region: truncate(pkg.locationCode?.includes(',') ? pkg.locationCode.split(',')[0] : pkg.locationCode),
                    country: truncate(pkg.location || pkg.locationCode),
                    countryFlag: truncate(countryFlag),
                    dataAmountGB: pkg.volume ? parseFloat((pkg.volume / 1073741824).toFixed(2)) : null,
                    validityDays: pkg.duration || null,
                    networkSpeed: truncate(networkSpeed),
                    networkOperators: networkOperators,
                    compatibleDevices: compatibleDevices,
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
                            price: parseFloat((pkg.price / 100).toFixed(2)),
                            currency: pkg.currencyCode || 'USD',
                            shortDescription: truncate(pkg.description || '', 500),
                            longDescription: truncate(pkg.description || '', 1000)
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
            strapi.log.error('eSIM Access sync error:', error.response?.data || error.message);
            throw new Error(`Sync failed: ${error.message}`);
        }
    },
});
