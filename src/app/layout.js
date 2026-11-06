import { cssFunc } from '@/utils';
import './globals.css'
import { Inter, Manrope, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import siteMetadata from '@/utils/metaData';
import Script from 'next/script';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Index';
import { bannerStuff } from '@/data/utilities';
import InsightBanner from '@/components/Portfolio/InsightBanner';
import FloatingContactButton from '@/components/Contact/FloatingContactButton';
import MotionProvider from '@/components/Motion/MotionProvider';

const inter = Inter({
  subsets: ['latin'],
  display: "swap",
  variable: "--font-in",
});

const manrope = Manrope({
  subsets: ['latin'],
  display: "swap",
  variable: "--font-mr",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: "swap",
  weight: ['500', '600', '700'],
  variable: "--font-sg",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: "swap",
  weight: ['400', '500'],
  variable: "--font-jb",
});

export const metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    template: `%s | ${siteMetadata.title}`,
    default: siteMetadata.title, // a default is required when creating a template
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    images: [siteMetadata.socialBanner],
  },
  alternates: {
    types: {
      'application/rss+xml': `${siteMetadata.siteUrl}/feed.xml`,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={cssFunc("scroll-smooth", inter.variable, manrope.variable, spaceGrotesk.variable, jetbrainsMono.variable)}
      suppressHydrationWarning
    >
      <body className="font-mr min-h-screen bg-paper text-dark dark:bg-ink dark:text-[#e8e9ee]">
        <Script id="theme-switcher" strategy="beforeInteractive">
          {`if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }`}
        </Script>
        <div className="atmosphere" aria-hidden="true">
          <div className="atmosphere-blob a" />
          <div className="atmosphere-blob b" />
          <div className="atmosphere-blob c" />
          <div className="atmosphere-grain" />
        </div>
        <a href="#main" className="skip-link">Skip to content</a>
        <MotionProvider>
          <Header/>
          <InsightBanner insights={bannerStuff} />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <FloatingContactButton />
          <Footer/>
        </MotionProvider>
      </body>
    </html>
  );
}
