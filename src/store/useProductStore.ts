import { create } from 'zustand';
import { Product } from '@/types';
import { SEED_PRODUCTS } from '@/lib/seedData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'live';
  title: string;
  description: string;
}

interface ProductStore {
  products: Product[];
  isLoading: boolean;
  toasts: ToastMessage[];
  searchQuery: string;
  selectedBrand: string;
  selectedCondition: string;
  selectedSort: string;

  setProducts: (products: Product[]) => void;
  fetchProducts: () => Promise<void>;
  addProduct: (newProduct: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  setSearchQuery: (query: string) => void;
  setSelectedBrand: (brand: string) => void;
  setSelectedCondition: (condition: string) => void;
  setSelectedSort: (sort: string) => void;

  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: SEED_PRODUCTS,
  isLoading: false,
  toasts: [],
  searchQuery: '',
  selectedBrand: 'all',
  selectedCondition: 'all',
  selectedSort: 'featured',

  setProducts: (products) => set({ products }),

  fetchProducts: async () => {
    set({ isLoading: true });
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (!error && data && data.length > 0) {
          // Map DB columns to Product type
          const mapped: Product[] = data.map((item: any) => ({
            id: item.id,
            brand: item.brand,
            model: item.model,
            condition: item.condition,
            gradeIfPreowned: item.grade_if_preowned,
            price: Number(item.price),
            originalPrice: item.original_price ? Number(item.original_price) : undefined,
            stock: Number(item.stock),
            badge: item.badge,
            rating: item.rating ? Number(item.rating) : 4.9,
            reviewsCount: item.reviews_count || 12,
            images: item.images || [],
            variants: item.variants || [],
            specs: item.specs || {},
            inspectionReport: item.inspection_report || undefined
          }));
          set({ products: mapped, isLoading: false });
          return;
        }
      } catch (e) {
        console.warn('Using local seed data for products:', e);
      }
    }
    set({ products: SEED_PRODUCTS, isLoading: false });
  },

  addProduct: async (newProdData) => {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...newProdData,
      id: newId
    };

    // Update local state immediately (Optimistic)
    set((state) => ({ products: [newProduct, ...state.products] }));

    get().addToast({
      type: 'live',
      title: '⚡ Product Added (Realtime)',
      description: `${newProduct.brand} ${newProduct.model} is now live in store!`
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').insert({
          id: newId,
          brand: newProduct.brand,
          model: newProduct.model,
          condition: newProduct.condition,
          grade_if_preowned: newProduct.gradeIfPreowned,
          price: newProduct.price,
          original_price: newProduct.originalPrice,
          stock: newProduct.stock,
          badge: newProduct.badge,
          rating: newProduct.rating,
          reviews_count: newProduct.reviewsCount,
          images: newProduct.images,
          variants: newProduct.variants,
          specs: newProduct.specs,
          inspection_report: newProduct.inspectionReport
        });
      } catch (err) {
        console.error('Failed to sync to Supabase DB:', err);
      }
    }

    return newProduct;
  },

  updateProduct: async (id, updates) => {
    // Update local state immediately
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p))
    }));

    const updatedItem = get().products.find((p) => p.id === id);
    if (updatedItem) {
      get().addToast({
        type: 'live',
        title: '⚡ Live Stock/Price Update',
        description: `${updatedItem.brand} ${updatedItem.model} updated live (Price: $${updatedItem.price}, Stock: ${updatedItem.stock})`
      });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const payload: any = {};
        if (updates.price !== undefined) payload.price = updates.price;
        if (updates.stock !== undefined) payload.stock = updates.stock;
        if (updates.model !== undefined) payload.model = updates.model;
        if (updates.badge !== undefined) payload.badge = updates.badge;

        await supabase.from('products').update(payload).eq('id', id);
      } catch (err) {
        console.error('Failed to update Supabase DB:', err);
      }
    }
  },

  deleteProduct: async (id) => {
    const target = get().products.find((p) => p.id === id);
    set((state) => ({
      products: state.products.filter((p) => p.id !== id)
    }));

    if (target) {
      get().addToast({
        type: 'warning',
        title: '🗑️ Inventory Removed',
        description: `${target.brand} ${target.model} was deleted from catalog.`
      });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete from Supabase DB:', err);
      }
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedBrand: (brand) => set({ selectedBrand: brand }),
  setSelectedCondition: (condition) => set({ selectedCondition: condition }),
  setSelectedSort: (sort) => set({ selectedSort: sort }),

  addToast: (toastData) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { ...toastData, id };
    set((state) => ({ toasts: [newToast, ...state.toasts].slice(0, 5) }));

    setTimeout(() => {
      get().removeToast(id);
    }, 4500);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  }
}));
