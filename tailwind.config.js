/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arona: {
          bg: "#08090d",
          card: "rgba(18, 22, 34, 0.7)",
          cardHover: "rgba(28, 34, 52, 0.9)",
          border: "rgba(255, 255, 255, 0.08)",
          accent: "#3b82f6",
          purple: "#a855f7",
          cyan: "#06b6d4",
          amber: "#f59e0b",
          emerald: "#10b981",
        }
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'glow-accent': '0 0 35px rgba(59, 130, 246, 0.35)',
        'glow-purple': '0 0 35px rgba(168, 85, 247, 0.35)',
        'glow-cyan': '0 0 35px rgba(6, 182, 212, 0.35)',
        'glow-amber': '0 0 35px rgba(245, 158, 11, 0.35)',
      }
    },
  },
  plugins: [],
}
