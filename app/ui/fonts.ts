import { Inconsolata } from 'next/font/google';
import { Lusitana } from 'next/font/google';
export const inconsolata = Inconsolata({
  subsets: ['latin'],
  weight: '500',
  
});
export const lusitana = Lusitana({
  subsets: ['latin'],
  weight: ['400', '700'],
});
