import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const brush = localFont({
  src: './fonts/edosz.ttf',
  variable: '--font-brush',
  display: 'swap',
  weight: '400',
});

export const metadata = {
  title: {
    default: `${process.env.NEXT_PUBLIC_SITE_NAME || 'NomadeFace'} - Plataforma de video aulas`,
    template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME || 'NomadeFace'}`,
  },
  description:
    'Plataforma de video aulas com liberacao progressiva de conteudo. Aprenda no seu ritmo, uma aula por vez.',
};

export const viewport = {
  themeColor: '#07070a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${brush.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
