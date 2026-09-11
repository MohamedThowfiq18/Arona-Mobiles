import type { Metadata } from 'next';
import { getAllAccessories, getAccessoryCategories } from '@/lib/accessories';
import OwnerAccessoriesManager from '@/components/owner/OwnerAccessoriesManager/OwnerAccessoriesManager';

export const metadata: Metadata = {
  title: 'Accessories Management — Owner Portal | Arona Mobiles',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OwnerAccessoriesPage() {
  const [accessories, categories] = await Promise.all([
    getAllAccessories(true),
    getAccessoryCategories(),
  ]);

  return (
    <div>
      <OwnerAccessoriesManager initialAccessories={accessories} categories={categories} />
    </div>
  );
}
