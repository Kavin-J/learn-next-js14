import { Inconsolata } from 'next/font/google';
import { Lusitana } from 'next/font/google';
export const inconsolata = Inconsolata({ subsets: ['latin'] });
export const lusitana = Lusitana({
  subsets: ['latin'],
  weight: ['400', '700'],
});
