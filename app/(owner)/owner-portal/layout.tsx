import type { Metadata } from 'next';
import OwnerSidebar from '@/components/owner/OwnerSidebar/OwnerSidebar';
import SessionIdleTimer from '@/components/owner/SessionIdleTimer';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: { default: 'Owner Portal', template: '%s | Arona Owner Portal' },
  robots: 'noindex,nofollow',
};

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <SessionIdleTimer />
      <OwnerSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
