// Script pour mettre à jour tous les prix avec une marge
// Usage: node update-prices.js

const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';
const MARGIN_PERCENTAGE = 300; // 300% de marge (prix x 4)
const TARGET_CURRENCY = 'EUR';
const USD_TO_EUR = 0.92; // Taux de change USD → EUR

async function updateAllPrices() {
    try {
        // 1. Récupérer tous les produits
        console.log('Récupération des produits...');
        const response = await axios.get(`${STRAPI_URL}/api/products?pagination[limit]=10000`);
        const products = response.data.data;

        console.log(`${products.length} produits trouvés`);

        let updated = 0;

        // 2. Mettre à jour chaque produit
        for (const product of products) {
            const currentPrice = parseFloat(product.attributes.price) || 0;
            const currentCurrency = product.attributes.currency || 'USD';

            // Convertir en EUR si nécessaire
            let priceInEur = currentPrice;
            if (currentCurrency === 'USD') {
                priceInEur = currentPrice * USD_TO_EUR;
            }

            // Ajouter la marge
            const newPrice = (priceInEur * (1 + MARGIN_PERCENTAGE / 100)).toFixed(2);

            // Mettre à jour le produit
            await axios.put(`${STRAPI_URL}/api/products/${product.id}`, {
                data: {
                    price: parseFloat(newPrice),
                    currency: TARGET_CURRENCY
                }
            });

            updated++;
            console.log(`✓ ${product.attributes.name}: ${currentPrice} ${currentCurrency} → ${newPrice} ${TARGET_CURRENCY}`);
        }

        console.log(`\n✅ ${updated} produits mis à jour avec succès!`);

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

updateAllPrices();
