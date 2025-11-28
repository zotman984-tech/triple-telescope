'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Wifi, Calendar, Globe, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const REGION_IMAGES: Record<string, string> = {
    'EU': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Europe_green_light.svg/600px-Europe_green_light.svg.png',
    'AS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Asia_green_light.svg/600px-Asia_green_light.svg.png',
    'AF': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Africa_green_light.svg/600px-Africa_green_light.svg.png',
    'NA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/North_America_green_light.svg/600px-North_America_green_light.svg.png',
    'SA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/South_America_green_light.svg/600px-South_America_green_light.svg.png',
    'OC': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Oceania_green_light.svg/600px-Oceania_green_light.svg.png',
    'ME': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Middle_East_green_light.svg/600px-Middle_East_green_light.svg.png',
    'GLOBAL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/600px-World_map_blank_without_borders.svg.png',
};

export default function DestinationPage() {
    const params = useParams();
    // params.slug will be the part matched by [slug], e.g. "morocco" from "best-esim-morocco"
    // Wait, if the folder is "best-esim-[slug]", then params.slug is just the "morocco" part?
    // Yes, Next.js extracts the dynamic segment.
    const slug = params.slug as string;

    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [products, setProducts] = useState<any[]>([]);
    const [destinationName, setDestinationName] = useState('');
    const [destinationFlag, setDestinationFlag] = useState('');
    const [currency, setCurrency] = useState('USD');

    useEffect(() => {
        if (!slug) return;

        const fetchDestinationProducts = async () => {
            setLoading(true);
            try {
                // Convert slug to display name for searching
                // e.g. "united-states" -> "United States"
                const name = slug.split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                setDestinationName(name);

                // Fetch all products and filter client-side to ensure accuracy
                // (Since API filtering might be limited or we want to be fuzzy)
                const response = await fetch('https://api.esimfree.store/api/products');
                const data = await response.json();

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let allProducts = data.data || [];
                if (Array.isArray(data) && !data.data) allProducts = data;

                // Normalize string for comparison (remove special chars, lowercase)
                const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

                // Filter products that match the destination name
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const filtered = allProducts.filter((p: any) => {
                    const productName = normalize(p.name);
                    const searchName = normalize(name);
                    // Check if normalized product name contains normalized search name
                    return productName.includes(searchName);
                });

                // Sort by price
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                filtered.sort((a: any, b: any) => a.price - b.price);

                setProducts(filtered);

                // Set flag/image from the first product
                if (filtered.length > 0) {
                    const first = filtered[0];
                    setCurrency(first.currency || 'USD');

                    // Determine flag/image
                    if (first.type === 'region' && first.region) {
                        const prefix = first.region.split('-')[0].toUpperCase();
                        setDestinationFlag(REGION_IMAGES[prefix] || first.countryFlag);
                    } else if (first.country) {
                        setDestinationFlag(`https://flagcdn.com/w80/${first.country.toLowerCase()}.png`);
                    } else {
                        setDestinationFlag(first.countryFlag || 'https://flagcdn.com/w80/un.png');
                    }
                }

            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDestinationProducts();
    }, [slug]);

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
        }).format(price);
    };

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            E
                        </div>
                        <span className="text-xl font-bold text-gray-900">eSIM Fox</span>
                    </Link>
                </div>
                <Link href="/products/all" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">All Destinations</span>
                </Link>
            </nav>

            {/* Header */}
            <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-16 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-12 w-12 bg-white/20 rounded-full"></div>
                            <div className="h-10 w-64 bg-white/20 rounded"></div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/20 shadow-xl bg-white">
                                    <img
                                        src={destinationFlag || 'https://flagcdn.com/w80/un.png'}
                                        alt={destinationName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://flagcdn.com/w80/un.png';
                                        }}
                                    />
                                </div>
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-bold mb-2">{destinationName}</h1>
                                    <div className="flex items-center gap-2 text-blue-100">
                                        <Globe className="w-4 h-4" />
                                        <span>eSIM Data Plans</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-blue-100 text-lg max-w-2xl">
                                Stay connected in {destinationName} with our high-speed eSIM plans.
                                Instant delivery, no roaming fees, and reliable coverage.
                            </p>
                        </>
                    )}
                </div>
            </section>

            {/* Plans Grid */}
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Available Plans</h2>
                        {!loading && (
                            <span className="text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 text-sm">
                                {products.length} plans found
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map((n) => (
                                <div key={n} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="h-9 w-24 bg-gray-200 rounded mb-2"></div>
                                            <div className="h-5 w-16 bg-gray-100 rounded"></div>
                                        </div>
                                        <div className="text-right">
                                            <div className="h-9 w-20 bg-gray-200 rounded mb-1 ml-auto"></div>
                                            <div className="h-3 w-24 bg-gray-100 rounded ml-auto"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-3 mb-8">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-5 h-5 bg-gray-100 rounded-full"></div>
                                                <div className="h-4 w-40 bg-gray-100 rounded"></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-14 w-full bg-gray-200 rounded-xl"></div>
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {products.map((plan: any) => (
                                <div
                                    key={plan.id}
                                    className="relative bg-white rounded-2xl p-6 border border-gray-200 transition-all hover:shadow-xl hover:border-blue-500 group"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-3xl font-bold text-gray-900">{plan.dataAmount}</h3>
                                            <p className="text-gray-600 flex items-center gap-1 mt-2 font-medium">
                                                <Calendar className="w-4 h-4 text-blue-500" />
                                                {plan.duration} days
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-blue-600">{formatPrice(plan.price, plan.currency)}</div>
                                            <div className="text-xs text-gray-400 mt-1">One-time payment</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <div className="p-1 bg-green-100 rounded-full">
                                                <Check className="w-3 h-3 text-green-600" />
                                            </div>
                                            <span>High-speed 4G/5G Data</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <div className="p-1 bg-green-100 rounded-full">
                                                <Check className="w-3 h-3 text-green-600" />
                                            </div>
                                            <span>Instant QR Code Delivery</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <div className="p-1 bg-green-100 rounded-full">
                                                <Check className="w-3 h-3 text-green-600" />
                                            </div>
                                            <span>Hotspot Enabled</span>
                                        </div>
                                    </div>

                                    <button className="w-full py-4 rounded-xl font-bold text-lg transition-all bg-gray-900 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2">
                                        Buy Now
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Globe className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No plans found</h3>
                            <p className="text-gray-500">We couldn't find any eSIM plans for {destinationName}.</p>
                            <Link href="/products/all" className="inline-block mt-6 text-blue-600 font-bold hover:underline">
                                Browse all destinations
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Info Section */}
            <section className="py-12 px-6 bg-white border-t border-gray-100">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How it works</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: '1', title: 'Purchase', desc: 'Select your plan and complete payment securely.' },
                            { step: '2', title: 'Receive QR', desc: 'Get your eSIM QR code via email instantly.' },
                            { step: '3', title: 'Activate', desc: 'Scan the QR code and start using data immediately.' }
                        ].map((item) => (
                            <div key={item.step} className="text-center p-6 rounded-2xl bg-gray-50">
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-blue-600/20">
                                    {item.step}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">{item.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
