import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAccessoryById, getAllAccessories } from '@/lib/accessories';
import AccessoryDetailClient from '@/components/customer/AccessoryDetail/AccessoryDetailClient';
import CartProvider from '@/components/customer/CartProvider/CartProvider';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const accessory = await getAccessoryById(id);
  if (!accessory) return { title: 'Accessory Not Found | Arona Mobiles' };

  return {
    title: `${accessory.brand} ${accessory.name} | Arona Mobiles`,
    description: accessory.description || `Buy genuine ${accessory.name} at Arona Mobiles.`,
  };
}

export default async function AccessoryDetailPage({ params }: Props) {
  const { id } = await params;
  const accessory = await getAccessoryById(id);

  if (!accessory) {
    notFound();
  }

  const all = await getAllAccessories(false);
  const similar = all
    .filter(a => a.category.toLowerCase() === accessory.category.toLowerCase() && a.id !== accessory.id)
    .slice(0, 4);

  return (
    <CartProvider>
      <AccessoryDetailClient accessory={accessory} similarAccessories={similar} />
    </CartProvider>
  );
}
