import React, { useState } from 'react';
import { Product } from '../types';

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void; // New prop
}

const ProductCard: React.FC<Props> = ({ product, onAddToCart, onViewDetails }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleClick = async () => {
  setIsAdding(true);
  // Pass the entire product object now
  await onAddToCart(product); 
  setTimeout(() => setIsAdding(false), 500);
};

  return (
    <div
      className={`bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg shadow-black/5 border border-slate-100 transition-all duration-300 ${isHovered ? 'transform scale-105 shadow-xl shadow-amber-700/10' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <div 
          className="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer"
          onClick={() => onViewDetails(product)}
        >
        <img
          src={imageError ? 'https://picsum.photos/400/400' : (product.images[0]?.src || 'https://picsum.photos/400/400')}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors flex items-center justify-center group">
          <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-800 px-4 py-2 rounded-full text-xs font-bold tracking-widest transition-all translate-y-2 group-hover:translate-y-0">
            QUICK VIEW
          </span>
        </div>
        {product.on_sale && (
          <div className="absolute top-3 left-3 bg-lunarRed text-white text-xs font-bold px-2 py-1 rounded-full">
            SALE
          </div>
        )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="text-xs text-lunarGold tracking-widest uppercase font-semibold mb-2">
          {product.categories?.map(cat => cat.name).join(', ')}
        </div>
        
        <h3 
          className="font-heading text-lg text-slate-800 mb-2 line-clamp-2 cursor-pointer hover:text-amber-700 transition-colors"
          onClick={() => onViewDetails(product)}
        >
          {product.name}
        </h3>
        
        {/* Adjusted this flex container to just show price */}
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-bold text-lunarGold">
              ${product.price}
            </span>
            {product.regular_price !== product.price && (
              <span className="text-xs md:text-sm text-slate-400 line-through">
                ${product.regular_price}
              </span>
            )}
          </div>
          {/* Review section was removed from here */}
        </div>
        
        <button 
          onClick={handleClick}
          disabled={isAdding}
          className={`w-full mt-4 py-2 text-sm md:text-base font-semibold rounded-full transition-all ${
            isAdding ? 'bg-slate-400' : 'bg-amber-700 text-white'
          }`}
        >
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;