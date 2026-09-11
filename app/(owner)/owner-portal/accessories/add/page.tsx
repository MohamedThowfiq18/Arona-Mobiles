import type { Metadata } from 'next';
import OwnerAccessoryForm from '@/components/owner/OwnerAccessoryForm/OwnerAccessoryForm';
import { getAccessoryCategories } from '@/lib/accessories';

export const metadata: Metadata = {
  title: 'Add New Accessory — Owner Portal | Arona Mobiles',
};

export const dynamic = 'force-dynamic';

export default async function OwnerAddAccessoryPage() {
  const categories = await getAccessoryCategories();

  return (
    <div>
      <OwnerAccessoryForm mode="add" categories={categories} />
    </div>
  );
}
