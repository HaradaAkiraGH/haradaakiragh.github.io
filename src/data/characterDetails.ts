// Индекс глубоких данных персонажей.
// Каждая волна — отдельный файл в ./details; здесь они просто соединяются.
// Чтобы добавить волну: создай файл и допиши его в спред ниже одной строкой.
import { WAVE2A } from './details/wave2a';

export const CHARACTER_DETAILS: Record<string, any> = {
  ...WAVE2A,
};