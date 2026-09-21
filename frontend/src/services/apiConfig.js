const RENDER_ORIGIN = 'https://sponsormetrics.onrender.com';

const isVercelHost = () =>
  typeof window !== 'undefined' && /\.vercel\.app$/i.test(window.location.hostname);

export const apiBaseUrl = () => {
  const fromEnv = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  if (fromEnv && fromEnv !== '/api') return fromEnv;
  if (isVercelHost()) return `${RENDER_ORIGIN}/api`;
  return fromEnv || '/api';
};

export const uploadsOrigin = () => apiBaseUrl().replace(/\/api\/?$/, '');
