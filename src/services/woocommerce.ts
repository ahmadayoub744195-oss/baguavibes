import { Product, Category } from '../types';

const WC_API_URL = 'https://baguavibes.com/shop/wp-json/wc/v3';
const CONSUMER_KEY = 'ck_283a933db9df4fbefe3cec3793451c1e56c031fd';
const CONSUMER_SECRET = 'cs_88e7aa66bed21cb4b99aa1bf3b367432d4e76d6b';


export const WooCommerceService = {
  // Fetch all products
  async getProducts(): Promise<Product[]> {
    try {
      // 2. We remove CORS_PROXY and append keys directly to the URL
      // This bypasses the need for the "Authorization" header which causes CORS issues
      const url = `${WC_API_URL}/products?per_page=100&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('WooCommerce Error:', errorData);
        throw new Error('Failed to fetch products');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Fetch products by category
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    try {
      // Build the URL with keys directly in the query string
      const url = `${WC_API_URL}/products?category=${categoryId}&per_page=20&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('WooCommerce API Error:', errorData);
        throw new Error('Failed to fetch products by category');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Fetch product categories
  async getCategories(): Promise<Category[]> {
    try {
      // We append the keys to the URL and remove the CORS proxy
      const url = `${WC_API_URL}/products/categories?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&per_page=100&hide_empty=true`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('WooCommerce API Error:', errorData);
        throw new Error('Failed to fetch categories');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Add this inside your WooCommerceService object/class
  getVariations: async (productId: number) => {
    try {
      const response = await fetch(
        `${WC_API_URL}/products/${productId}/variations?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`
      );
      if (!response.ok) throw new Error('Failed to fetch variations');
      return await response.json();
    } catch (error) {
      console.error("Error fetching variations:", error);
      return [];
    }
  },

  // Add to cart (using WooCommerce Cart API)
  async addToCart(productId: number, quantity: number = 1): Promise<boolean> {
    try {
      // Note: For cart functionality, you'll need to implement proper session handling
      // This is a placeholder - you'll need to use WooCommerce's Cart API with authentication
      console.log(`Adding ${quantity} of product ${productId} to cart`);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  },
};