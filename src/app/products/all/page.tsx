'use client';

import { useState, useEffect } from 'react';
import { Search, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getProducts, Product } from '../../../lib/api';

type FilterTab = 'local' | 'region' | 'global' | 'unlimited';

export default function AllDestinations() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<FilterTab>('local');
    const [searchQuery, setSearchQuery] = useState('');

    // Filters state
    // const [selectedData, setSelectedData] = useState<number | 'all'>('all');
    // const [selectedValidity, setSelectedValidity] = useState<number | 'all'>('all');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('https://api.esimfree.store/api/products?pagination[limit]=5000', { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();

                // Handle direct array response (custom controller or Strapi v3 style)
                if (Array.isArray(result)) {
                    setProducts(result);
                }
                // Handle Strapi v4 default response structure: { data: [{ id, attributes: { ... } }] }
                else if (result.data && Array.isArray(result.data)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const mappedProducts = result.data.map((item: any) => {
                        // Strapi v4 has attributes
                        if (item.attributes) {
                            return {
                                id: item.id,
                                ...item.attributes
                            };
                        }
                        // Strapi v5 is flat
                        return item;
                    });
                    setProducts(mappedProducts);
                } else {
                    console.error('Unexpected API response structure:', result);
                    setProducts([]);
                }
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const getCountryName = (code: string) => {
        try {
            const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
            return regionNames.of(code) || code;
        } catch (e) {
            return code;
        }
    };

    // Filter products by type
    const getProductsByType = (type: string) => {
        let filtered = products;

        if (type === 'unlimited') {
            // Filter by isUnlimited field instead of type
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            filtered = products.filter((p: any) => p.isUnlimited === true);
        } else if (type === 'local') {
            // Only include local type (excluding unlimited which are now also local)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            filtered = products.filter((p: any) => p.type === 'local' && p.country && !p.isUnlimited);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            filtered = products.filter((p: any) => p.type === type);
        }

        // Group by country for local types
        if (type === 'local') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const grouped = filtered.reduce((acc: any, product: any) => {
                if (!product.country) return acc;
                if (!acc[product.country]) {
                    acc[product.country] = {
                        code: product.country,
                        price: product.price,
                        currency: product.currency,
                        flag: product.countryFlag,
                    };
                } else {
                    if (product.price < acc[product.country].price) {
                        acc[product.country].price = product.price;
                    }
                }
                return acc;
            }, {} as Record<string, { code: string, price: number, currency: string, flag: string }>);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return Object.values(grouped).map((group: any) => ({
                ...group,
                displayName: getCountryName(group.code)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            })).sort((a: any, b: any) => a.displayName.localeCompare(b.displayName));
        }

        // For region/global/unlimited, show as-is
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return filtered.map((p: any) => ({
            displayName: p.name,
            code: p.region || p.country,
            price: p.price,
            currency: p.currency,
            flag: p.countryFlag,
            // Preserve original properties for filtering
            dataAmountGB: p.dataAmountGB,
            validityDays: p.validityDays,
            isTopUpAvailable: p.isTopUpAvailable
        }));
    };



    // Get unique filter options
    // const uniqueDataAmounts = Array.from(new Set(products.map(p => p.dataAmountGB).filter(Boolean))).sort((a, b) => a - b);
    // const uniqueValidities = Array.from(new Set(products.map(p => p.validityDays).filter(Boolean))).sort((a, b) => a - b);

    // Filter logic based on active tab, search, and additional filters
    const filteredItems = () => {
        const query = searchQuery.toLowerCase();
        let items = getProductsByType(activeTab);

        // Apply search filter
        items = items.filter(item =>
            item.displayName?.toLowerCase().includes(query) ||
            item.code?.toLowerCase().includes(query)
        );

        // Apply additional filters (only for non-grouped items, or we need to filter BEFORE grouping?)
        // The current structure groups 'local' items by country, losing individual product details like data/validity.
        // If we want to filter by data/validity, we should probably filter the PRODUCTS first, then group.
        // But the current UI shows COUNTRIES for 'local' tab, not products.
        // So filtering 'local' tab by data/validity might be confusing if it hides the whole country?
        // OR, does it mean "Show countries that have at least one product matching the filter"?

        // Let's refactor getProductsByType to accept filters or filter before calling it.
        // Actually, for 'local' tab, we display a list of COUNTRIES. 
        // If I filter by "10GB", should I show countries that have a 10GB plan? Yes.

        // Let's re-implement the filtering logic to be cleaner.

        let filteredProducts = products;

        // 1. Filter by Tab Type
        if (activeTab === 'local') {
            filteredProducts = filteredProducts.filter(p => (p.type === 'local' || p.type === 'topup') && p.country);
        } else {
            filteredProducts = filteredProducts.filter(p => p.type === activeTab);
        }

        // 2. Apply Search (on product name/country/region)
        if (query) {
            filteredProducts = filteredProducts.filter(p =>
                p.name?.toLowerCase().includes(query) ||
                p.country?.toLowerCase().includes(query) ||
                p.region?.toLowerCase().includes(query)
            );
        }

        // 3. Apply Filters
        // if (selectedData !== 'all') {
        //     filteredProducts = filteredProducts.filter(p => p.dataAmountGB === selectedData);
        // }
        // if (selectedValidity !== 'all') {
        //     filteredProducts = filteredProducts.filter(p => p.validityDays === selectedValidity);
        // }

        // 4. Group/Format for Display
        if (activeTab === 'local') {
            const grouped = filteredProducts.reduce((acc, product) => {
                if (!product.country) return acc;
                // Only consider 'local' type for grouping (double check)
                if (product.type !== 'local') return acc;

                if (!acc[product.country]) {
                    acc[product.country] = {
                        code: product.country,
                        price: product.price,
                        currency: product.currency,
                        flag: product.countryFlag,
                        displayName: getCountryName(product.country)
                    };
                } else {
                    if (product.price < acc[product.country].price) {
                        acc[product.country].price = product.price;
                    }
                }
                return acc;
            }, {} as Record<string, { code: string, price: number, currency: string, flag: string, displayName: string }>);

            return Object.values(grouped).sort((a, b) => a.displayName.localeCompare(b.displayName));
        } else {
            return filteredProducts.map(p => ({
                displayName: p.name,
                code: p.region || p.country,
                price: p.price,
                currency: p.currency,
                flag: p.countryFlag
            }));
        }
    };

    const items = filteredItems();

    const formatPrice = (price: number, currency: string) => {
        const value = price / 100;
        const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency;
        return `${symbol}${value.toFixed(2)}`;
    };

    return (
        <main className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        E
                    </div>
                    <span className="text-xl font-bold text-gray-900">esim0</span>
                </div>
                <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">All Destinations</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Find the best data plans in over 190+ countries — and enjoy easy and safe internet access wherever you go.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8 overflow-x-auto">
                    <div className="bg-gray-100 p-1 rounded-full inline-flex gap-1">
                        <button
                            onClick={() => setActiveTab('local')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'local'
                                ? 'bg-black text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Local
                        </button>
                        <button
                            onClick={() => setActiveTab('region')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'region'
                                ? 'bg-black text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Region
                        </button>
                        <button
                            onClick={() => setActiveTab('global')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'global'
                                ? 'bg-black text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Global
                        </button>
                        <button
                            onClick={() => setActiveTab('unlimited')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'unlimited'
                                ? 'bg-black text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Unlimited
                        </button>
                    </div>
                </div>

                {/* Filters */}
                {/* <div className="flex flex-wrap gap-4 justify-center mb-8">
                    <select 
                        value={selectedData} 
                        onChange={(e) => setSelectedData(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    >
                        <option value="all">Any Data Amount</option>
                        {uniqueDataAmounts.map(amount => (
                            <option key={amount} value={amount}>{amount} GB</option>
                        ))}
                    </select>

                    <select 
                        value={selectedValidity} 
                        onChange={(e) => setSelectedValidity(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    >
                        <option value="all">Any Validity</option>
                        {uniqueValidities.map(days => (
                            <option key={days} value={days}>{days} Days</option>
                        ))}
                    </select>
                </div> */}

                {/* Search */}
                <div className="max-w-xl mx-auto mb-12 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search for a country..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item, i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                                        {/* Use flagcdn if country code exists, else use item.flag if it's a URL */}
                                        <img
                                            src={item.code ? `https://flagcdn.com/w80/${item.code.toLowerCase()}.png` : item.flag}
                                            alt={item.displayName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://flagcdn.com/w80/un.png';
                                            }}
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{item.displayName}</h3>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-gray-500 text-sm">
                                        Starting at <span className="text-gray-900 font-bold text-lg">{formatPrice(item.price, item.currency)}</span>
                                    </div>
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && items.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        No destinations found.
                    </div>
                )}
            </div>
        </main>
    );
}
