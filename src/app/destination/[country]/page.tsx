import { ArrowLeft, Wifi, Calendar, Globe, Check } from 'lucide-react';
import Link from 'next/link';

export default function DestinationPage() {
    const plans = [
        { id: 1, data: '1GB', days: 7, price: 4.50, features: ['4G/5G', 'Hotspot', 'Instant'] },
        { id: 2, data: '3GB', days: 15, price: 9.99, features: ['4G/5G', 'Hotspot', 'Instant'] },
        { id: 3, data: '5GB', days: 30, price: 14.99, features: ['4G/5G', 'Hotspot', 'Instant'], popular: true },
        { id: 4, data: '10GB', days: 30, price: 24.99, features: ['4G/5G', 'Hotspot', 'Instant'] },
    ];

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        E
                    </div>
                    <span className="text-xl font-bold text-gray-900">eSIM Fox</span>
                </div>
                <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
            </nav>

            {/* Header */}
            <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="text-5xl">🇺🇸</div>
                        <h1 className="text-4xl font-bold">United States</h1>
                    </div>
                    <p className="text-blue-100 text-lg">
                        Stay connected across all 50 states with our reliable eSIM plans.
                    </p>
                </div>
            </section>

            {/* Plans Grid */}
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Available Plans</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-lg ${plan.popular ? 'border-blue-600' : 'border-gray-100'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                                        MOST POPULAR
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-3xl font-bold text-gray-900">{plan.data}</h3>
                                        <p className="text-gray-600 flex items-center gap-1 mt-1">
                                            <Calendar className="w-4 h-4" />
                                            {plan.days} days
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-gray-900">${plan.price}</div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-gray-600">
                                            <Check className="w-4 h-4 text-green-500" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button className={`w-full py-3 rounded-xl font-medium transition-colors ${plan.popular
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                    }`}>
                                    Buy Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Info Section */}
            <section className="py-12 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">How it works</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { step: '1', title: 'Purchase', desc: 'Select your plan and complete payment' },
                            { step: '2', title: 'Receive QR', desc: 'Get your eSIM QR code via email instantly' },
                            { step: '3', title: 'Activate', desc: 'Scan the QR code and start using data' }
                        ].map((item) => (
                            <div key={item.step} className="text-center">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                                    {item.step}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
