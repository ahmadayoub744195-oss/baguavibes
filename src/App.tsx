import React, { useState, useEffect } from 'react';
import ShopPage from './pages/ShopPage';
import { CartProvider } from './context/CartContext';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'shop'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());
  
  // NEW: State to track which category to open
  const [targetCategory, setTargetCategory] = useState<string>('all');

  const categories = [
    { name: "Keychains", img: ('/keychain image.jpg')  },
    { name: "Money", img: ('/money image.webp') },
    { name: "Love", img: ('/two hearts image.avif')  },
    { name: "Health", img: ('/life tree image.webp') },
    { name: "Positive Vibes", img: ('/light hope image.avif') },
    { name: "Wind Chime", img: ('/onechimeimage.webp')  },
    { name: "Wallets", img: ('/Wallet One.jpeg') },
    { name: "Evil Eye Protection", img: ('/evileye.webp')  },
    { name: "Home Energy Solutions", img: ('/home image.jpg')  },
    { name: "Incense", img: ('/incense.avif') },
    { name: "Accessories", img: ('/accessories image.webp') },
    { name: "Sahha Vibes", img: ('/Lebanese food.jpg') }
  ];

  const menuItems = ["Keychains", "Money", "Love", "Health", "Positive Vibes", "Wind Chime", "Wallets", "Evil Eye Protection", "Home Energy Solutions", "Incense", "Accessories", "Sahha Vibes"];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    document.body.addEventListener('mousemove', handleMouseMove);
    return () => document.body.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisibleElements(prev => new Set(prev).add('title')), 200),
      setTimeout(() => setVisibleElements(prev => new Set(prev).add('subtitle')), 400),
      setTimeout(() => setVisibleElements(prev => new Set(prev).add('cta')), 600),
      setTimeout(() => setVisibleElements(prev => new Set(prev).add('offer')), 800),
      setTimeout(() => setVisibleElements(prev => new Set(prev).add('categories')), 1000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // UPDATED: Now accepts a category name
  const navigateToShop = (category: string = 'all') => { 
    setTargetCategory(category);
    setCurrentPage('shop'); 
    setIsMenuOpen(false); 
  };

  return (
    <CartProvider>
      {currentPage === 'shop' ? (
        // PASS THE CATEGORY TO SHOP PAGE
        <ShopPage 
          onNavigateHome={() => setCurrentPage('home')} 
          initialCategory={targetCategory} 
        />
      ) : (
        <div
          className="min-h-screen font-sans text-slate-700 overflow-x-hidden"
          style={{
            background: `
              radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(180, 83, 9, 0.04), transparent 30%),
              radial-gradient(circle at top left, #bae6fd, #ffffff 50%),
              radial-gradient(circle at bottom right, #fca5a5, #ffffff 50%)
            `,
            backgroundAttachment: 'fixed',
          }}
        >
          <div
            className="fixed inset-0 pointer-events-none opacity-5 z-10"
            style={{
              backgroundImage: 'radial-gradient(circle, #b45309 1px, transparent 1px)',
              backgroundSize: '180px 180px',
            }}
          />

          <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-white/30 border-b border-white/10">
            <div 
              className="text-lg tracking-widest text-slate-800 font-bold cursor-pointer"
              onClick={() => setCurrentPage('home')}
            >
              BAGUA VIBES
            </div>
            <button
              onClick={toggleMenu}
              className={`relative z-50 p-2 focus:outline-none group ${isMenuOpen ? 'burger-active' : ''}`}
              aria-label="Toggle Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-700">
                <rect
                  className="transition-all duration-300 origin-center"
                  x="3"
                  y={isMenuOpen ? 11 : 5}
                  width="18"
                  height="2"
                  rx="1"
                  fill="currentColor"
                  transform={isMenuOpen ? 'rotate(45 12 12)' : ''}
                />
                <rect
                  className={`transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}
                  x="3"
                  y="11"
                  width="18"
                  height="2"
                  rx="1"
                  fill="currentColor"
                />
                <rect
                  className="transition-all duration-300 origin-center"
                  x="3"
                  y={isMenuOpen ? 11 : 17}
                  width="18"
                  height="2"
                  rx="1"
                  fill="currentColor"
                  transform={isMenuOpen ? 'rotate(-45 12 12)' : ''}
                />
              </svg>
            </button>
          </nav>

          <div
            className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-2xl flex flex-col items-center justify-center transition-all duration-500 ${
              isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
            }`}
          >
            <div className="text-center space-y-8 max-w-lg px-6">
              <h4 className="text-amber-700 text-xs uppercase tracking-[0.4em] mb-4 font-bold">
                The Collections
              </h4>
              <div className="mb-8">
                <button
                  onClick={() => navigateToShop('all')}
                  className="text-xl text-slate-700 hover:text-amber-700 transition-colors tracking-widest font-medium"
                >
                  Shop All Products
                </button>
              </div>
              <div className="flex flex-col gap-y-4 md:gap-y-6 w-full max-h-[60vh] overflow-y-auto px-4 custom-scrollbar">
                {menuItems.map((item) => (
                  <a
                    key={item}
                    href="#categories"
                    onClick={() => navigateToShop(item)}
                    className="text-lg sm:text-xl md:text-2xl text-slate-700 hover:text-amber-700 transition-colors tracking-[0.2em] font-medium py-2 border-b border-amber-700/5 last:border-0 block w-full"
                  >
                    {item}
                  </a>
                ))}
              </div>
              <div className="pt-12">
                <div className="h-px w-12 bg-amber-700/30 mx-auto mb-6"></div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  Year of the Horse • 2026
                </p>
              </div>
            </div>
          </div>

          <section className="min-h-screen flex flex-col items-center justify-start pt-32 px-6 relative z-10">
            {/* ... SVG Animation Code ... */}
            <div className="relative w-52 h-52 md:w-64 md:h-64 flex items-center justify-center mb-6">
              <svg viewBox="0 0 200 200" className="w-full h-full" style={{ animation: 'breathing 10s ease-in-out infinite' }}>
                <defs>
                  <linearGradient id="fireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#991b1b" />
                  </linearGradient>
                  <linearGradient id="iceGrad" x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#1e3a8a" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="98" fill="none" stroke="rgba(180, 83, 9, 0.1)" strokeWidth="0.5" />
                <path d="M 100 10 A 90 90 0 0 0 100 190 A 45 45 0 0 0 100 100 A 45 45 0 0 1 100 10" fill="url(#iceGrad)" />
                <path d="M 100 10 A 90 90 0 0 1 100 190 A 45 45 0 0 1 100 100 A 45 45 0 0 0 100 10" fill="url(#fireGrad)" />
                <circle cx="100" cy="55" r="12" fill="#ffffff" />
                <circle cx="100" cy="145" r="12" fill="#1e293b" />
              </svg>
            </div>

            <h1 className={`text-5xl md:text-8xl text-center mb-6 transition-all duration-1000 ${visibleElements.has('title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ filter: 'url(#liquid-filter)', letterSpacing: '0.1em', textShadow: '0 0 8px rgba(180, 83, 9, 0.1)' }}>
              BAGUA VIBES
            </h1>

            <div className={`flex items-center gap-6 mb-10 transition-all duration-1000 ${visibleElements.has('subtitle') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="h-[1px] w-12 bg-amber-700/10"></div>
              <p className="text-amber-700 text-center italic tracking-[0.4em] uppercase text-[10px] md:text-xs font-semibold">Year of the Horse • 2026</p>
              <div className="h-[1px] w-12 bg-amber-700/10"></div>
            </div>

            <div className={`mb-24 transition-all duration-1000 ${visibleElements.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex gap-4">
                <a href="#categories" className="relative px-8 py-3 bg-transparent text-amber-700 border border-amber-700 rounded-full text-[11px] uppercase tracking-widest font-bold transition-all duration-500 hover:bg-amber-700 hover:text-white hover:shadow-lg hover:shadow-amber-700/20 inline-flex items-center">
                  Enter The Sanctuary
                  <span className="inline-block ml-3 transform group-hover:translate-y-1 transition-transform">↓</span>
                </a>
                <button onClick={() => navigateToShop('all')} className="relative px-8 py-3 bg-amber-700 text-white border border-amber-700 rounded-full text-[11px] uppercase tracking-widest font-bold transition-all duration-500 hover:bg-amber-800 hover:shadow-lg hover:shadow-amber-700/20 inline-flex items-center">
                  Shop Now
                  <span className="inline-block ml-3">🛒</span>
                </button>
              </div>
            </div>

            <div id="categories" className="w-full max-w-6xl py-12 mb-20">
              <div className="text-center mb-16">
                <h2 className="text-2xl md:text-4xl text-slate-800 tracking-[0.25em] font-medium">Choose Your Harmony</h2>
                <div className="mt-4 h-[1.5px] w-24 bg-amber-700/20 mx-auto"></div>
              </div>

              <div className="grid grid-cols-4 md:grid-cols-4 gap-x-2 sm:gap-x-8 gap-y-12 sm:gap-y-24 px-2 md:px-0">
                {categories.map((cat, i) => (
                  <div key={cat.name} className={`flex flex-col items-center group transition-all duration-700 ${visibleElements.has('categories') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${i * 100}ms` }}>
                    <div className="relative w-16 h-16 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full bg-white/60 backdrop-blur-md border border-amber-700/15 flex items-center justify-center cursor-pointer overflow-hidden shadow-md shadow-black/5 transition-all duration-700 hover:scale-105 hover:border-amber-700 hover:bg-white/95 mb-4 sm:mb-8">
                      <img
                        src={cat.img}
                        alt={cat.name}
                        onClick={() => navigateToShop(cat.name)} 
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover opacity-80 transition-all duration-1000"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x400/f8fafc/b45309?text=${cat.name}`; }}
                      />
                    </div>
                    <h3 className="text-[7px] sm:text-[10px] md:text-xs tracking-[0.1em] sm:tracking-[0.35em] text-slate-500 group-hover:text-amber-700 transition-colors duration-500 uppercase font-bold text-center">
                      {cat.name}
                    </h3>
                  </div>
                ))}
              </div>
            </div>

            {/* About Us & Footer Logic remains the same... (omitted for brevity, assume standard footer code here) */}
            <div id="about-us" className="w-full max-w-5xl py-20 mb-20 px-6">
              {/* ... About us code ... */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-700/5 to-blue-500/5 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="relative backdrop-blur-xl bg-white/40 border border-white/60 rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-black/5 overflow-hidden">
                  <div className="text-right" dir="rtl">
                    <h2 className="text-3xl md:text-4xl text-slate-800 mb-8 tracking-wide font-medium border-r-4 border-amber-700 pr-6">حول Bagua Vibes</h2>
                    <div className="space-y-6 text-slate-600 leading-relaxed text-lg md:text-xl">
                      <p>في <span className="text-amber-700 font-bold">Bagua Vibes</span> نؤمن أن طاقة المكان تؤثر مباشرة على شعورنا وحياتنا اليومية.</p>
                      <p>لهذا نختار كل قطعة في متجرنا بعناية وفق مبادئ الفنغ شوي وعلم طاقة المكان لتدعم التوازن والراحة والوفرة داخل المنزل.</p>
                      <p>نقدّم رموزاً وقطعاً إيجابية مرتبطة بجوانب الحياة المختلفة مثل المال، الصحة، الحب، العمل والإبداع بحيث لا تكون مجرد ديكور جميل بل عناصر تضيف إحساساً بالانسجام والطاقة المريحة في محيطك.</p>
                      <p className="pt-4 italic border-t border-amber-700/10">ومع توسّع رؤيتنا للحياة المتوازنة، أضفنا أيضاً مجموعة من الأطعمة والبدائل الصحية المختارة بعناية، لأن ما نضعه في أجسامنا لا يقل أهمية عن الطاقة التي نحيط أنفسنا بها في منازلنا.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
             <div id="offer" className={`w-full max-w-4xl mb-32 transition-all duration-1000 ${visibleElements.has('offer') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="rounded-[2.5rem] p-10 md:p-14 text-center border-l-4 border-l-amber-700 backdrop-blur-md bg-white/40">
                <h2 className="text-2xl md:text-4xl mb-4 text-slate-800 tracking-wider font-medium">5% SANCTUARY DISCOUNT</h2>
                <p className="text-slate-500 text-sm italic tracking-widest font-medium">Code: <span className="text-amber-700 font-bold tracking-[0.1em]">HORSE26</span></p>
              </div>
            </div>

            <div id="horse-theme" className="w-full max-w-5xl mb-40">
              <div className="relative overflow-hidden rounded-[3rem] aspect-[16/10] md:aspect-[21/9] shadow-2xl bg-red-900">
                <img src={('/bagualanding.jpeg')} alt="China Horse of the New Year" className="w-full h-full object-cover opacity-90" style={{ animation: 'zoomSlow 15s ease-in-out infinite alternate' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-red-700/60 via-red-700/10 to-transparent mix-blend-multiply"></div>
                <div className="absolute inset-0 ring-2 ring-inset ring-red-700/20 pointer-events-none"></div>
              </div>
            </div>

          </section>

          {/* Footer Code */}
          <footer className="bg-white/90 backdrop-blur-3xl border-t border-slate-100 pt-24 pb-16 px-6 relative z-10">
  <div className="max-w-6xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
      <div className="md:col-span-1 text-center md:text-left">
        <h2 className="text-xl mb-4 font-medium">BAGUA VIBES</h2>
      </div>
      <div className="text-center md:text-left">
        <h4 className="text-[10px] uppercase tracking-[0.5em] text-amber-700 mb-6 font-bold">
          Sanctuary
        </h4>
        <p className="text-sm font-semibold text-stone-700 mb-2 italic">
          Beirut, Lebanon
        </p>
        <a
          href="tel:+9613953615"
          className="text-sm font-medium text-stone-500 hover:text-amber-700 transition-colors tracking-widest"
        >
          +961 3 953 615
        </a>
      </div>
      <div className="text-center md:text-left">
        <h4 className="text-[10px] uppercase tracking-[0.5em] text-amber-700 mb-6 font-bold">
          Follow Us
        </h4>
        <div className="flex justify-center md:justify-start gap-8 text-stone-500 text-sm font-semibold">
          <a href="#" className="hover:text-amber-700 transition-all">
            Instagram
          </a>
          <a href="#" className="hover:text-amber-700 transition-all">
            Facebook
          </a>
        </div>
      </div>
      <div className="text-center md:text-left">
        <h4 className="text-[10px] uppercase tracking-[0.5em] text-amber-700 mb-6 font-bold">
          Secure Payments
        </h4>
        <div className="flex flex-wrap justify-center md:justify-start gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
          <div className="px-3 py-1 border border-stone-200 text-[9px] font-bold rounded bg-stone-50">
            VISA
          </div>
          <div className="px-3 py-1 border border-stone-200 text-[9px] font-bold rounded bg-stone-50">
            APPLE PAY
          </div>
        </div>
      </div>
    </div>
    <div className="pt-12 border-t border-stone-100 text-center flex flex-col gap-2">
      <p className="text-[10px] text-stone-300 tracking-[0.7em] uppercase font-bold">
        &copy; 2026 BAGUA VIBES • THE SPIRIT OF THE HORSE
      </p>
      <p className="text-[9px] text-stone-400 tracking-[0.3em] uppercase">
        Powered by{' '}
        <a 
          href="https://theahmadcodes.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-amber-700 hover:text-amber-900 font-bold transition-colors"
        >
          theahmadcodes
        </a>
      </p>
    </div>
  </div>
</footer>

          <svg style={{ display: 'none' }}><defs><filter id="liquid-filter"><feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="3" /></filter></defs></svg>
          <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(180, 83, 9, 0.2); border-radius: 10px; }
          @keyframes breathing { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(180, 83, 9, 0.15)); } 50% { transform: scale(1.03); filter: drop-shadow(0 0 25px rgba(180, 83, 9, 0.3)); } }
          @keyframes zoomSlow { 0% { transform: scale(1); } 100% { transform: scale(1.08); } }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #f1f5f9; }
          ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: #b45309; }
          ::selection { background: #b45309; color: white; }
          `}</style>
        </div>
      )}
    </CartProvider>
  );
};

export default App;