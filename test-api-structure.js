const axios = require('axios');

async function testAPI() {
    try {
        const response = await axios.get('http://188.137.254.45:1337/api/products?pagination[limit]=5');

        console.log('=== STRUCTURE DE LA RÉPONSE ===\n');
        console.log('Type de réponse:', typeof response.data);
        console.log('Clés principales:', Object.keys(response.data));

        if (response.data && response.data.length > 0) {
            console.log('\n=== PREMIER PRODUIT (exemple) ===\n');
            const first = response.data[0];
            console.log(JSON.stringify(first, null, 2));

            console.log('\n=== CHAMPS COUNTRY ===\n');
            response.data.slice(0, 5).forEach((p, i) => {
                console.log(`${i + 1}. country: "${p.country}" | region: "${p.region}"`);
                const slug = p.country?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                console.log(`   → slug généré: "${slug}"`);
            });
        }

    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

testAPI();
