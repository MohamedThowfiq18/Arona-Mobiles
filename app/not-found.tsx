import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      background: 'var(--bg-primary, #0f172a)',
      color: 'var(--text-primary, #f8fafc)',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#6366f1' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', margin: '0 0 1rem 0' }}>Page Not Found</h2>
      <p style={{ color: '#94a3b8', maxWidth: '400px', marginBottom: '2rem' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          backgroundColor: '#6366f1',
          color: '#ffffff',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Return Home
      </Link>
    </div>
  );
}
