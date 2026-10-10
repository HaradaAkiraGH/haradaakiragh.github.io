// Новости и баннеры. dateEnd — ISO-дата окончания баннера для таймера.
// Даты ставь любые будущие — таймер посчитает сам.
export interface NewsItem {
  id: string;
  type: 'banner' | 'patch';
  title: string;
  subtitle?: string;   // необязательно: у патчей подписи может не быть
  dateEnd?: string;    // для баннеров (обратный отсчёт)
  dateLabel?: string;  // для патчей (подпись)
  highlights: string[];
  characters?: string[];
}

export const NEWS: NewsItem[] = [
  {
    id: 'n1',
    type: 'banner',
    title: 'Баннер: Camellya',
    subtitle: 'Цветок среди клинков — повышенный шанс 5★',
    dateEnd: '2026-10-20T10:00:00',
    highlights: ['Повышенный шанс 5★ Хаос', 'Сигнатурное оружие в оружейном баннере'],
    characters: ['camellya'],
  },
  {
    id: 'n2',
    type: 'banner',
    title: 'Баннер: Jinhsi',
    subtitle: 'Судья времён возвращается',
    dateEnd: '2026-10-20T10:00:00',
    highlights: ['Повышенный шанс 5★ Спектро', 'Реран сигнатурного broadblade'],
    characters: ['jinhsi'],
  },
  {
    id: 'n3',
    type: 'patch',
    title: 'Патч 3.5 «Мэнчжоу»',
    dateLabel: 'актуальный патч',
    highlights: ['Новый регион: Мэнчжоу', 'Мировой босс: Hecate', 'Ивент: «Тени за занавесом» с наградами'],
  },
  {
    id: 'n4',
    type: 'patch',
    title: 'Патч 3.4',
    dateLabel: 'архив',
    highlights: ['Босс: Lament', 'Костюм для Verina', 'Оптимизация карты Хуанлуна'],
  },
];