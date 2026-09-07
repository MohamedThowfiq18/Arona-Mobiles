import { notFound } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Product, Review, ProductQA } from '@/lib/types';
import ProductDetailClient from '@/components/customer/ProductDetail/ProductDetailClient';
import type { Metadata } from 'next';
import { getProductByIdOrSlug, getAllProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

async function getProduct(id: string): Promise<Product | null> {
  const p = await getProductByIdOrSlug(id);
  if (p && p.is_active !== false) return p;
  return null;
}

async function getReviews(productId: string): Promise<Review[]> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from('reviews')
    .select('*, users(name, avatar_url)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(20);
  return (data as Review[]) || [];
}

async function getQA(productId: string): Promise<ProductQA[]> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from('product_qa')
    .select('*')
    .eq('product_id', productId)
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  return (data as ProductQA[]) || [];
}

async function getSimilar(product: Product): Promise<Product[]> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('brand', product.brand)
      .eq('is_active', true)
      .neq('id', product.id)
      .limit(5);
    if (data && data.length > 0) return data as Product[];
  } catch {
    // fallback
  }

  const all = await getAllProducts();
  return all.filter(p => p.brand.toLowerCase() === product.brand.toLowerCase() && p.id !== product.id).slice(0, 5);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: `${product.brand} ${product.model}`,
    description: product.short_description || `Buy ${product.brand} ${product.model} at Arona Mobiles.`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  const [reviews, qa, similar] = await Promise.all([
    getReviews(id),
    getQA(id),
    getSimilar(product),
  ]);

  return (
    <ProductDetailClient
      product={product}
      reviews={reviews}
      qa={qa}
      similar={similar}
    />
  );
}

