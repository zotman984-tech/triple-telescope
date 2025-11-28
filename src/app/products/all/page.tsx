'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Product } from '../../../lib/api';

type FilterTab = 'local' | 'region' | 'unlimited';

const TAB_MAPPING: Record<string, FilterTab> = {
    '1': 'local',
    '2': 'region',
    '5': 'unlimited'
};

const REVERSE_TAB_MAPPING: Record<FilterTab, string> = {
    'local': '1',
    'region': '2',
    'unlimited': '5'
};

const ITEMS_PER_PAGE = 24;

function AllDestinationsContent() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Get active tab from URL or default to 'local'
    const tabParam = searchParams.get('tab');
    const activeTab: FilterTab = (tabParam && TAB_MAPPING[tabParam]) ? TAB_MAPPING[tabParam] : 'local';

    // Get current page from URL or default to 1
    const pageParam = searchParams.get('page');
    const currentPage = Number(pageParam) || 1;

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

    const handleTabChange = (tab: FilterTab) => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', REVERSE_TAB_MAPPING[tab]);
        params.set('page', '1'); // Reset to page 1
        router.push(`${pathname}?${params.toString()}`);
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        router.push(`${pathname}?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getCountryName = (code: string) => {
        try {
            const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
            return regionNames.of(code) || code;
        } catch (e) {
            return code;
        }
    };

    const getRegionName = (code: string) => {
        // Extract region prefix (e.g., "EU" from "EU-30")
        const prefix = code.split('-')[0].toUpperCase();

        const regionMap: Record<string, string> = {
            'EU': 'Europe',
            'AS': 'Asia',
            'AF': 'Africa',
            'NA': 'North America',
            'SA': 'South America',
            'CA': 'Central America & Caribbean',
            'CB': 'Caribbean',
            'ME': 'Middle East',
            'OC': 'Oceania / Pacific',
            'AUNZ': 'Australia & New Zealand',
            'CN': 'China',
            'CNJPKR': 'China, Japan & Korea',
            'SGMYTH': 'Singapore, Malaysia & Thailand',
            'USCA': 'USA & Canada',
            'SAAEQAKWOMBH': 'Saudi Arabia & Gulf States',
            'GLOBAL': 'Global',
            'WORLD': 'Worldwide'
        };
        return regionMap[prefix] || code;
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
        } else if (type === 'region') {
            // Only include region type
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            filtered = products.filter((p: any) => p.type === 'region' && p.region);
        } else {
            // Fallback for any other types
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

        // Group by region for region types
        if (type === 'region') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const grouped = filtered.reduce((acc: any, product: any) => {
                if (!product.region) return acc;

                // Extract prefix (EU from EU-30, AS from AS-12, etc.)
                const prefix = product.region.split('-')[0].toUpperCase();

                if (!acc[prefix]) {
                    acc[prefix] = {
                        code: prefix,
                        price: product.price,
                        currency: product.currency,
                        flag: product.countryFlag,
                    };
                } else {
                    if (product.price < acc[prefix].price) {
                        acc[prefix].price = product.price;
                    }
                }
                return acc;
            }, {} as Record<string, { code: string, price: number, currency: string, flag: string }>);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return Object.values(grouped).map((group: any) => ({
                ...group,
                displayName: getRegionName(group.code)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            })).sort((a: any, b: any) => a.displayName.localeCompare(b.displayName));
        }

        // For global/unlimited, show as-is
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

    // Filter logic based on active tab, search
    const filteredItems = () => {
        const query = searchQuery.toLowerCase();
        let items = getProductsByType(activeTab);

        // Apply search filter
        if (query) {
            items = items.filter(item =>
                item.displayName?.toLowerCase().includes(query) ||
                item.code?.toLowerCase().includes(query)
            );
        }

        return items;
    };

    const allItems = filteredItems();
    const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
    const paginatedItems = allItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
                            onClick={() => handleTabChange('local')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'local'
                                ? 'bg-black text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Local
                        </button>
                        <button
                            onClick={() => handleTabChange('region')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'region'
                                ? 'bg-black text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Region
                        </button>
                        <button
                            onClick={() => handleTabChange('unlimited')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'unlimited'
                                ? 'bg-black text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Unlimited
                        </button>
                    </div>
                </div>

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
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedItems.map((item, i) => (
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-12">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-full border ${currentPage === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-gray-600 font-medium">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-full border ${currentPage === totalPages ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}

                {!loading && allItems.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        No destinations found.
                    </div>
                )}
            </div>
        </main>
    );
}

export default function AllDestinations() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AllDestinationsContent />
        </Suspense>
    );
}
