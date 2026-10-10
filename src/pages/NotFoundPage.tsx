// Красивая 404: Камеллия съела страницу + OG-теги
import { Link } from 'react-router-dom';
import { Home, Users } from 'lucide-react';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export const NotFoundPage = () => {
  useDocumentMeta({ title: '404', description: 'Камеллия съела эту страницу. Вернись на главную или в каталог персонажей.' });
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <ImagePlaceholder
        id="camellya"
        initials="Ca"
        element="Havoc"
        className="w-40 h-52 rounded-2xl border border-glass-border shadow-glow rotate-[-4deg] mb-6"
      />
      <p className="text-7xl font-extrabold text-gradient">404</p>
      <h2 className="text-xl font-bold text-ivory mt-3">Камеллия съела эту страницу</h2>
      <p className="text-gray-400 text-sm mt-2 max-w-sm">
        «Хехе… Я всего лишь играла. Хочешь, покажу то, что действительно существует?»
      </p>
      <div className="flex gap-3 mt-6">
        <Link
          to="/characters"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg font-bold text-sm hover:shadow-glow transition-all focus-ring"
        >
          <Users size={16} /> К персонажам
        </Link>
        <Link
          to="/home"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-glass border border-glass-border text-ivory text-sm font-semibold hover:border-accent/40 transition-colors focus-ring"
        >
          <Home size={16} /> На главную
        </Link>
      </div>
    </div>
  );
};