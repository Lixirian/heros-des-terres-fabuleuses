import book1 from './book1';
import book2 from './book2';
import book3 from './book3';
import book4 from './book4';
import book5 from './book5';
import book6 from './book6';
import { BookData } from '../types';

export const books: BookData[] = [book1, book2, book3, book4, book5, book6];

export function getBook(id: number): BookData | undefined {
  return books.find(b => b.id === id);
}
