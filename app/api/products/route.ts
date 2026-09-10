import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllProducts, getProductByIdOrSlug } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const condition = searchParams.get('condition');
    const brand = searchParams.get('brand');
    const featured = searchParams.get('featured');

    if (id || slug) {
      const product = await getProductByIdOrSlug((id || slug)!);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, product }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      });
    }

    let products = await getAllProducts(false);

    if (condition) {
      products = products.filter(p => p.condition === condition);
    }
    if (brand) {
      products = products.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    }
    if (featured === 'true') {
      products = products.filter(p => p.is_featured);
    }

    return NextResponse.json({ success: true, products }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Error in public /api/products:', error);
    return NextResponse.json({ error: 'Failed to retrieve products' }, { status: 500 });
  }
}
