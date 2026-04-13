import { Product, Category } from '../types';

const WC_API_URL = 'https://baguavibes.com/shop/wp-json/wc/v3';
const CONSUMER_KEY = 'ck_283a933db9df4fbefe3cec3793451c1e56c031fd';
const CONSUMER_SECRET = 'cs_88e7aa66bed21cb4b99aa1bf3b367432d4e76d6b';

export const WooCommerceService = {
  
  // --- NEW: Helper function to loop and fetch ALL pages ---
  async fetchAllPages(baseUrlWithKeys: string): Promise<any[]> {
    let allData: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      // Ask for 100 items per page, starting at page 1, then page 2, etc.
      const response = await fetch(`${baseUrlWithKeys}&per_page=100&page=${page}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('WooCommerce API Error:', errorData);
        throw new Error(`Failed to fetch data from WooCommerce (Page ${page})`);
      }
      
      const data = await response.json();
      allData = [...allData, ...data]; // Combine the new data with the old data
      
      // If WooCommerce sends back less than 100 items, we know we've reached the end!
      if (data.length < 100) {
        hasMore = false;
      } else {
        page++; // Go to the next page and loop again
      }
    }
    
    return allData;
  },

  // Fetch all products (bypassing the 100 limit)
  async getProducts(): Promise<Product[]> {
    try {
      const url = `${WC_API_URL}/products?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
      return await WooCommerceService.fetchAllPages(url);
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Fetch products by category (bypassing the 100 limit)
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    try {
      const url = `${WC_API_URL}/products?category=${categoryId}&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
      return await WooCommerceService.fetchAllPages(url);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  },

  // Fetch product categories
  async getCategories(): Promise<Category[]> {
    try {
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

  // Fetch variations
  async getVariations(productId: number) {
    try {
      // Added &per_page=100 here as well, just in case a product has many variations
      const response = await fetch(
        `${WC_API_URL}/products/${productId}/variations?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&per_page=100`
      );
      if (!response.ok) throw new Error('Failed to fetch variations');
      return await response.json();
    } catch (error) {
      console.error("Error fetching variations:", error);
      return [];
    }
  },

  // Add to cart (using WooCommerce Cart API - placeholder)
  async addToCart(productId: number, quantity: number = 1): Promise<boolean> {
    try {
      console.log(`Adding ${quantity} of product ${productId} to cart`);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  },
};