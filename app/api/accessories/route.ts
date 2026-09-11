import { NextRequest, NextResponse } from 'next/server';
import { getAllAccessories, getAccessoryCategories } from '@/lib/accessories';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search')?.toLowerCase();
    const sort = searchParams.get('sort') || 'featured';

    let list = await getAllAccessories(false);

    if (category) {
      list = list.filter(a => 
        a.category.toLowerCase() === category.toLowerCase() || 
        a.subcategory?.toLowerCase() === category.toLowerCase()
      );
    }

    if (brand) {
      list = list.filter(a => a.brand.toLowerCase() === brand.toLowerCase());
    }

    if (search) {
      list = list.filter(a => 
        a.name.toLowerCase().includes(search) ||
        a.brand.toLowerCase().includes(search) ||
        a.category.toLowerCase().includes(search) ||
        (a.compatibility && a.compatibility.toLowerCase().includes(search)) ||
        (a.description && a.description.toLowerCase().includes(search))
      );
    }

    switch (sort) {
      case 'price_asc':
        list.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
        break;
      case 'price_desc':
        list.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'name_asc':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    const categories = await getAccessoryCategories();

    return NextResponse.json({
      success: true,
      accessories: list,
      categories,
      count: list.length,
    });
  } catch (error: any) {
    console.error('Error fetching accessories API:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch accessories' },
      { status: 500 }
    );
  }
}
