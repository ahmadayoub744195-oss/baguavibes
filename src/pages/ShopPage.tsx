import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Product, Category } from '../types';
import { WooCommerceService } from '../services/woocommerce';
import { useCart } from '../context/CartContext';

interface ShopPageProps {
  onNavigateHome: () => void;
  initialCategory: string;
}

// Helper interface for Variations
interface Variation {
  id: number;
  price: string;
  image: { src: string };
  attributes: { name: string; option: string }[];
}

const ShopPage: React.FC<ShopPageProps> = ({ onNavigateHome, initialCategory }) => {
  const { totalItems, addToCart, cartItems, totalPrice, removeFromCart } = useCart();
  
  // --- UI STATES ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);
  
  // --- DATA STATES ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // --- VARIATION STATES ---
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [loadingVariations, setLoadingVariations] = useState(false);
  const [activeImage, setActiveImage] = useState<string>(''); // For Gallery

  // --- FILTER & INTERACTION ---
  const [maxPrice, setMaxPrice] = useState<number>(1000); 
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [customerInfo, setCustomerInfo] = useState({ name: '', address: '', phone: '' });

  // --- PAGINATION CONFIG ---
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setCurrentPage(1); 
      try {
        const wcCategories = await WooCommerceService.getCategories();
        setCategories(wcCategories);

        // Handle initial category from Home Page
        let categoryIdToLoad = selectedCategory;
        if (initialCategory && initialCategory !== 'all' && selectedCategory === 'all') {
             const foundCat = wcCategories.find(c => c.name.toLowerCase() === initialCategory.toLowerCase());
             if (foundCat) {
                categoryIdToLoad = foundCat.id.toString();
                setSelectedCategory(foundCat.id.toString());
             }
        }

        let productsData: Product[] = [];
        if (categoryIdToLoad === 'all') {
          // Ensure WooCommerceService.ts uses per_page=100
          productsData = await WooCommerceService.getProducts();
        } else {
          productsData = await WooCommerceService.getProductsByCategory(parseInt(categoryIdToLoad));
        }
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory, initialCategory]);

  // --- VARIATION FETCH LOGIC ---
  useEffect(() => {
    if (selectedProduct) {
      // 1. Reset states
      setActiveImage(selectedProduct.images[0]?.src || '');
      setVariations([]);
      setSelectedVariation(null);

      // 2. Check if Variable
      if (selectedProduct.type === 'variable') {
        setLoadingVariations(true);
        WooCommerceService.getVariations(selectedProduct.id)
          .then((data: Variation[]) => {
            setVariations(data);
          })
          .catch(err => console.error(err))
          .finally(() => setLoadingVariations(false));
      }
    }
  }, [selectedProduct]);

  // --- FILTERING & PAGINATION ---
  const filteredProducts = products.filter(p => {
    const price = p.price ? parseFloat(p.price) : 0;
    return price <= maxPrice;
  })
  .sort((a, b) => {
      // This forces WooCommerce "Starred" (Featured) products to the top
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'whish'>('cod');

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- ADD TO CART HANDLER ---
  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    if (selectedProduct.type === 'variable') {
      if (!selectedVariation) {
        alert("Please select an option first.");
        return;
      }
      
      // FIX: Cast this object 'as Product' to satisfy TypeScript
      const variationProduct = {
        ...selectedProduct,
        id: selectedVariation.id,
        name: `${selectedProduct.name} - ${selectedVariation.attributes.map(a => a.option).join(', ')}`,
        price: selectedVariation.price,
        images: selectedVariation.image ? [selectedVariation.image] : selectedProduct.images
      } as Product;

      await addToCart(variationProduct);
    } else {
      // Add standard product
      await addToCart(selectedProduct);
    }
    setSelectedProduct(null); // Close modal
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleWhatsAppOrder = () => {
    if (!customerInfo.name || !customerInfo.address) {
      alert("Please fill in your details");
      return;
    }
    const itemsList = cartItems.map(item => 
      `• ${item.name} (Qty: ${item.quantity}) - $${(Number(item.price) * item.quantity).toFixed(2)}`
    ).join('%0A');

    const paymentText = paymentMethod === 'whish' ? 'Whish Money 🔴' : 'Cash on Delivery 💵';

    const message = 
      `✨ *New Order from Bagua Vibes* ✨%0A%0A` +
      `👤 *Customer:* ${customerInfo.name}%0A` +
      `📍 *Address:* ${customerInfo.address}%0A` +
      `💳 *Payment:* ${paymentText}%0A%0A` +
      `🛍️ *Items:*%0A${itemsList}%0A%0A` +
      `💰 *Total:* $${totalPrice.toFixed(2)}%0A%0A` +
      (paymentMethod === 'whish' ? `_I will send the Whish Money transfer receipt shortly!_%0A` : '') +
      `Please confirm my order!`;

    const whatsappNumber = "9613953615";
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  // Combine images for Gallery (Main + Variations)
  const getAllGalleryImages = () => {
    if (!selectedProduct) return [];
    const mainImages = selectedProduct.images || [];
    const varImages = variations.map(v => v.image).filter(img => img && img.src);
    // Filter duplicates based on src
    const combined = [...mainImages, ...varImages];
    const unique = combined.filter((v, i, a) => a.findIndex(t => t.src === v.src) === i);
    return unique;
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen pt-24 px-4 md:px-8 relative overflow-hidden flex flex-col"
      style={{
        background: `
          radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(180, 83, 9, 0.08), transparent 40%),
          radial-gradient(circle at top left, #bae6fd, #ffffff 60%),
          radial-gradient(circle at bottom right, #fca5a5, #ffffff 60%)
        `
      }}
    >
      {/* 1. HOME BUTTON */}
      <button 
        onClick={onNavigateHome}
        className="fixed top-6 left-6 z-100 flex items-center gap-2 bg-white/80 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-full shadow-lg hover:border-amber-700 hover:text-amber-700 transition-all group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-xs font-bold uppercase tracking-widest">Home</span>
      </button>

      {/* 2. CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-110 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-heading text-slate-800">Your Sacred Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-800">✕ Close</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <p className="text-center text-slate-500 mt-10 italic">Your cart is empty.</p>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="flex gap-4 mb-4 border-b border-slate-100 pb-4">
                    <img src={item.images[0]?.src} className="w-20 h-20 object-cover rounded-lg" alt={item.name} />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">{item.name}</h4>
                      <p className="text-sm text-amber-700 font-medium">{item.quantity} x ${item.price}</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-400 mt-2 hover:text-red-600 transition-colors">Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-slate-100 pt-6 mt-6">
              {!isCheckout ? (
                <>
                  <div className="flex justify-between text-xl font-bold mb-6 text-slate-800">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <button onClick={() => setIsCheckout(true)} className="w-full bg-amber-700 text-white py-4 rounded-full font-bold tracking-widest hover:bg-amber-800 transition-colors shadow-lg shadow-amber-700/20">PROCEED TO CHECKOUT</button>
                </>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800">Delivery Details</h3>
                  <input type="text" placeholder="Full Name" className="w-full p-3 border border-slate-200 rounded-xl focus:border-amber-700 outline-none" onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} />
                  <input type="text" placeholder="Delivery Address" className="w-full p-3 border border-slate-200 rounded-xl focus:border-amber-700 outline-none" onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})} />
                  
                  {/* Payment Method Selection */}
                  <div className="pt-2">
                    <h4 className="text-sm font-bold text-slate-700 mb-3">Payment Method</h4>
                    <div className="flex flex-col gap-3">
                      
                      {/* Cash on Delivery */}
                      <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-amber-700 bg-amber-50 shadow-sm' : 'border-slate-200 hover:border-amber-300'}`}>
                        <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-amber-700 w-4 h-4" />
                        <span className="font-medium text-slate-700 flex items-center gap-2">💵 Cash on Delivery</span>
                      </label>

                      {/* Whish Money */}
                      <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'whish' ? 'border-[#e50038] bg-red-50 shadow-sm' : 'border-slate-200 hover:border-red-300'}`}>
                        <input type="radio" name="payment" value="whish" checked={paymentMethod === 'whish'} onChange={() => setPaymentMethod('whish')} className="accent-[#e50038] w-4 h-4" />
                        <span className="font-medium text-slate-700 flex items-center gap-2">
                          <span className="bg-[#e50038] text-white text-[10px] font-bold px-2 py-0.5 rounded">W</span> 
                          Whish Money
                        </span>
                      </label>

                      {/* Whish Instructions (Only shows when Whish is selected) */}
                      {paymentMethod === 'whish' && (
                        <div className="bg-[#e50038]/10 border border-[#e50038]/20 p-4 rounded-xl text-sm text-slate-700 animate-slide-in-left">
                          <p className="font-bold mb-1 text-[#e50038]">How to pay with Whish:</p>
                          <ol className="list-decimal pl-4 space-y-1 mb-3">
                            <li>Transfer the total amount to: <br/><strong className="text-base tracking-widest text-slate-900">3 953 615</strong></li>
                            <li>Click "Send Order" below.</li>
                            <li>Send us a screenshot of the transfer receipt on WhatsApp!</li>
                          </ol>
                        </div>
                      )}

                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button onClick={() => setIsCheckout(false)} className="w-1/3 py-3 text-slate-500 font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Back</button>
                    <button onClick={handleWhatsAppOrder} className="w-2/3 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20">Send Order</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. PRODUCT DETAILS MODAL (VARIABLE SUPPORT) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedProduct(null)} />
          
          <div className="relative bg-white w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full text-slate-400 hover:text-red-500 shadow-md transition-colors">✕ Close</button>

            {/* GALLERY SECTION */}
            <div className="w-full md:w-1/2 bg-slate-50 p-6 flex flex-col gap-4">
              {/* Main Large Image */}
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-sm relative">
                <img 
                  src={activeImage || 'https://picsum.photos/600/600'} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-contain transition-transform duration-500" 
                />
                {/* Sale Badge */}
                {selectedProduct.on_sale && <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full tracking-widest">SALE</span>}
              </div>

              {/* Thumbnails Row (Mixed Parent + Variations) */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {getAllGalleryImages().map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(img.src)}
                    className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === img.src 
                      ? 'border-amber-700 shadow-md scale-95' 
                      : 'border-transparent hover:border-amber-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.src} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* INFO SECTION */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
              <div className="text-xs text-amber-700 tracking-[0.3em] uppercase font-bold mb-4">{selectedProduct.categories?.map(cat => cat.name).join(', ')}</div>
              
              <h2 className="text-3xl font-heading text-slate-800 mb-2 leading-tight">{selectedProduct.name}</h2>
              
              {/* Price Display: Shows Variation Price if selected, else Parent Price */}
              <div className="text-2xl font-bold text-amber-700 mb-6">
                ${selectedVariation ? selectedVariation.price : selectedProduct.price}
              </div>

              {/* VARIATION SELECTOR */}
              {selectedProduct.type === 'variable' && (
                <div className="mb-6 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Choose Option:
                  </label>
                  {loadingVariations ? (
                    <div className="text-sm text-slate-400 italic">Loading options...</div>
                  ) : (
                    <select 
                      className="w-full p-3 bg-white border border-amber-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
                      onChange={(e) => {
                        const v = variations.find(v => v.id === parseInt(e.target.value));
                        if (v) {
                          setSelectedVariation(v);
                          if (v.image?.src) setActiveImage(v.image.src);
                        }
                      }}
                      value={selectedVariation?.id || ''}
                    >
                      <option value="">Select an option</option>
                      {variations.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.attributes.map(a => a.option).join(' / ')} 
                          {v.price ? ` - $${v.price}` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Sacred Details</h4>
                <div className="text-slate-500 leading-relaxed prose prose-sm max-h-48 overflow-y-auto pr-2 custom-scrollbar" dangerouslySetInnerHTML={{ __html: selectedProduct.description || 'Energy flows where intention goes.' }} />
              </div>

              <button 
                onClick={handleAddToCart} 
                className={`mt-8 w-full py-4 rounded-full font-bold tracking-widest transition-all shadow-lg ${
                  selectedProduct.type === 'variable' && !selectedVariation
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-700 text-white hover:bg-amber-800 shadow-amber-700/20'
                }`}
                disabled={selectedProduct.type === 'variable' && !selectedVariation}
              >
                {selectedProduct.type === 'variable' && !selectedVariation ? 'SELECT OPTION' : 'ADD TO CART'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto w-full grow relative z-10">
        
        {/* Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 bg-white/30 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-xl shadow-blue-500/5">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading text-slate-800 mb-3 drop-shadow-sm">Bagua Vibe</h1>
            <p className="text-slate-600 italic tracking-widest font-medium">Discover items for your spiritual journey</p>
          </div>
        </div>

        {/* 5. CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex gap-3">
            <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-3 bg-white/80 border border-slate-200 px-5 py-2.5 rounded-xl shadow-sm hover:border-amber-700 transition-all group">
              <div className="flex flex-col gap-1"><span className="w-5 h-0.5 bg-amber-700 rounded-full"></span><span className="w-5 h-0.5 bg-amber-700 rounded-full"></span><span className="w-3 h-0.5 bg-amber-700 rounded-full"></span></div>
              <span className="font-semibold text-slate-700 group-hover:text-amber-700">Categories</span>
            </button>
            <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-3 bg-white/80 border border-slate-200 px-5 py-2.5 rounded-xl shadow-sm hover:border-amber-700 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              <span className="font-semibold text-slate-700 group-hover:text-amber-700">Filter</span>
            </button>
          </div>

          <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-100 shadow-sm">
            <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">
              <span className="text-amber-700 text-base mr-1">{filteredProducts.length}</span> 
              Sacred Items
            </p>
          </div>
        </div>

        {/* 6. DRAWERS (Menu & Filter) - Omitted for brevity, paste standard drawer code here */}
        {isMenuOpen && (
          <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
                <button 
                  onClick={() => { 
                    window.history.pushState({}, '', '/shop'); // Update URL to base shop
                    setSelectedCategory('all'); 
                    setIsMenuOpen(false); 
                  }} 
                  className={`w-full text-left px-4 py-3 rounded-xl ${selectedCategory === 'all' ? 'bg-amber-50 text-amber-700 font-bold border-l-4 border-amber-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  All Collections
                </button>
                
                {categories.map(category => (
                  <button 
                    key={category.id} 
                    onClick={() => { 
                      const slug = category.name.toLowerCase().replace(/\s+/g, '-');
                      window.history.pushState({}, '', `/${slug}`); // Update URL to slug
                      setSelectedCategory(category.id.toString()); 
                      setIsMenuOpen(false); 
                    }} 
                    className={`w-full text-left px-4 py-3 rounded-xl ${selectedCategory === category.id.toString() ? 'bg-amber-50 text-amber-700 font-bold border-l-4 border-amber-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
        )}

        {isFilterOpen && (
          <div className="fixed inset-0 z-130">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col animate-slide-in-left">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-heading text-slate-800">Filter</h2>
                <button onClick={() => setIsFilterOpen(false)} className="text-slate-400">✕</button>
              </div>
              <div className="p-8 space-y-6">
                <label className="block text-sm font-semibold text-slate-600 mb-4 uppercase tracking-widest">Max Price: <span className="text-amber-700">${maxPrice}</span></label>
                <input type="range" min="0" max="1000" step="10" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full accent-amber-700" />
                <button onClick={() => setIsFilterOpen(false)} className="w-full py-3 bg-amber-700 text-white rounded-xl font-bold shadow-lg shadow-amber-700/20">Apply Filter</button>
              </div>
            </div>
          </div>
        )}

        {/* 7. PRODUCT GRID & PAGINATION */}
        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="w-16 h-16 border-4 border-t-amber-700 border-amber-700/20 rounded-full animate-spin"></div></div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16"><h3 className="text-2xl font-heading text-slate-800">No Products Found</h3></div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProducts.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={() => setSelectedProduct(product)} onViewDetails={(p) => setSelectedProduct(p)} />
              ))}
            </div>

            {/* Pagination Logic */}
            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-16 mb-8">
                <div className="flex items-center gap-4">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="p-3 rounded-full border border-slate-200 bg-white/50 text-slate-600 disabled:opacity-20 hover:border-amber-700 hover:text-amber-700 transition-all shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (totalPages > 7 && Math.abs(currentPage - pageNum) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                         if (Math.abs(currentPage - pageNum) === 3) return <span key={pageNum} className="text-slate-400">...</span>;
                         return null;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 shadow-sm ${
                            currentPage === pageNum 
                            ? 'bg-amber-700 text-white shadow-amber-700/30 scale-110' 
                            : 'bg-white/50 text-slate-400 hover:bg-white hover:text-amber-700 border border-transparent hover:border-amber-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="p-3 rounded-full border border-slate-200 bg-white/50 text-slate-600 disabled:opacity-20 hover:border-amber-700 hover:text-amber-700 transition-all shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
                <div className="text-xs text-slate-400 font-medium uppercase tracking-widest">Page {currentPage} of {totalPages}</div>
              </div>
            )}
          </>
        )}

        {/* 8. GUIDANCE SECTION */}
        <div className="mt-20 bg-white/70 backdrop-blur-md rounded-3xl p-10 border border-slate-100 shadow-lg text-center">
          <h2 className="text-2xl md:text-3xl font-heading text-slate-800 mb-4">Need Spiritual Guidance?</h2>
          <p className="text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">Our collection of sacred items is carefully curated to support your journey. If you need assistance choosing the right energy, we're here to help.</p>
          <a href="https://wa.me/9613953615" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 bg-transparent border-2 border-amber-700 text-amber-700 rounded-full font-semibold hover:bg-amber-700 hover:text-white transition-all duration-300">Contact Us Now</a>
        </div>
      </div>

      {/* 9. FOOTER */}
      <footer className="w-full py-12 border-t border-slate-100/50 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-3 text-center text-slate-500 text-sm">
          <p>© 2026 <span className="font-heading text-slate-800">Bagua Vibes</span>. All rights reserved.</p>
          <p className="uppercase tracking-widest text-[10px]">Powered by <a href="https://theahmadcodes.com" target="_blank" className="text-amber-700 font-bold">theahmadcodes</a></p>
        </div>
      </footer>

      {/* 10. FLOATING CART BUTTON */}
      <div className="fixed bottom-8 right-8 z-40">
        <div className="relative">
          <button onClick={() => setIsCartOpen(true)} className="bg-amber-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </button>
          {totalItems > 0 && (
            <div key={totalItems} className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full h-6 w-6 flex items-center justify-center animate-bounce shadow-lg border-2 border-white">{totalItems}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;