// Хук: ставит title, description и OG-теги для соцсетей.
// При unmount возвращает базовые значения.
import { useEffect } from 'react';

const BASE = {
  title: 'Stellar Wiki — энциклопедия Wuthering Waves',
  description: 'Персонажи, сборки, ротации, карта и тир-листы. Фан-проект для игроков WuWa.',
  image: '/og-default.png', // заглушка; позже подставишь свою картинку в /public
};

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function useDocumentMeta(opts: { title?: string; description?: string; image?: string; path?: string } = {}) {
  useEffect(() => {
    const title = opts.title ? `${opts.title} · Stellar Wiki` : BASE.title;
    const description = opts.description ?? BASE.description;
    const image = opts.image ?? BASE.image;
    const url = typeof window !== 'undefined' ? window.location.origin + (opts.path ?? window.location.pathname) : '';

    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:image', image, true);
    setMeta('og:url', url, true);
    setMeta('og:type', 'website', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    return () => {
      document.title = BASE.title;
      setMeta('description', BASE.description);
      setMeta('og:title', BASE.title, true);
      setMeta('og:description', BASE.description, true);
      setMeta('og:image', BASE.image, true);
    };
  }, [opts.title, opts.description, opts.image, opts.path]);
}