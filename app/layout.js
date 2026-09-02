import './globals.css';
import ScrollToTop from '../components/ScrollToTop';

export const metadata = {
  title: 'metierRef | Référentiel des Métiers & Compétences',
  description: "Plateforme d'exploration des métiers, cartographie des compétences, passerelles professionnelles et grilles salariales.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
