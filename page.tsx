import { Search, Globe, Shield, Zap, Smartphone, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            E
          </div>
          <span className="text-xl font-bold text-gray-900">esim0</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="#" className="hover:text-blue-600 transition-colors">Destinations</Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">How it works</Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">Support</Link>
        </div>
        <button className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
          My eSIMs
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6">
            Global connectivity, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              zero roaming fees.
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Instant eSIM delivery for 190+ countries. No physical SIM required.
            Keep your number, get data instantly.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white p-2 rounded-2xl shadow-xl flex items-center border border-gray-100">
              <Search className="w-6 h-6 text-gray-400 ml-3" />
              <input
                type="text"
                placeholder="Where are you traveling?"
                className="flex-1 p-3 outline-none text-gray-700 placeholder-gray-400 text-lg"
              />
              <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Instant Activation", desc: "Get connected in minutes via QR code." },
            { icon: Globe, title: "190+ Countries", desc: "Local rates in destinations worldwide." },
            { icon: Shield, title: "Secure & Private", desc: "No personal ID required for most plans." }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quelle sera votre prochaine destination ?</h2>
            <p className="text-gray-600">Choisissez d&apos;abord votre destination, puis le forfait de données adapté à vos besoins.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Allemagne', code: 'de' },
              { name: 'États-Unis', code: 'us' },
              { name: 'Turquie', code: 'tr' },
              { name: 'Égypte', code: 'eg' },
              { name: 'Émirats Arabes Unis', code: 'ae' },
              { name: 'Chine', code: 'cn' },
              { name: 'Suisse', code: 'ch' },
              { name: 'Thaïlande', code: 'th' },
              { name: 'Mexique', code: 'mx' },
            ].map((country) => (
              <div key={country.code} className="group bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all cursor-pointer relative overflow-hidden flex items-center gap-5">
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm relative z-10">
                  <img
                    src={`https://flagcdn.com/w160/${country.code}.png`}
                    alt={country.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col relative z-10">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">eSIM</span>
                  <span className="text-lg font-bold text-gray-900">{country.name}</span>
                </div>

                {/* Decorative background curve */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gray-50/80 rounded-full translate-x-12 translate-y-12 group-hover:bg-gray-100/80 transition-colors"></div>

                <div className="absolute bottom-5 right-5 z-10 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/products/all"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg"
            >
              View all destinations
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
