import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import OwnerAccessoryForm from '@/components/owner/OwnerAccessoryForm/OwnerAccessoryForm';
import { getAccessoryById, getAccessoryCategories } from '@/lib/accessories';

export const metadata: Metadata = {
  title: 'Edit Accessory — Owner Portal | Arona Mobiles',
};

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function OwnerEditAccessoryPage({ params }: Props) {
  const { id } = await params;
  const [accessory, categories] = await Promise.all([
    getAccessoryById(id),
    getAccessoryCategories(),
  ]);

  if (!accessory) {
    notFound();
  }

  return (
    <div>
      <OwnerAccessoryForm mode="edit" accessory={accessory} categories={categories} />
    </div>
  );
}
