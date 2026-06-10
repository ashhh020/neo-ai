import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { RefractionCursor } from "@/components/shared/RefractionCursor";

const BASE_URL = "https://www.neohomeo.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "NeoHomeo — AI-Powered Homeopathic Healthcare",
    template: "%s | NeoHomeo",
  },
  description:
    "NeoHomeo is an AI-powered homeopathic healthcare platform. Patient-Centric. Root-Cause Focused. Book appointments, consult with doctors, and get personalised homeopathic care powered by Hahnemann AI.",
  keywords: [
    "homeopathy", "homeopathic doctor", "AI healthcare", "Hahnemann AI",
    "online homeopathy", "homeopathic treatment", "holistic healthcare",
    "homeopathic consultation", "NeoHomeo",
  ],
  authors: [{ name: "NeoHomeo", url: BASE_URL }],
  creator: "NeoHomeo",
  publisher: "NeoHomeo",
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "NeoHomeo",
    title: "NeoHomeo — AI-Powered Homeopathic Healthcare",
    description: "Patient-Centric. Root-Cause Focused. Book homeopathic consultations and get AI-powered care with Hahnemann AI.",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "NeoHomeo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NeoHomeo — AI-Powered Homeopathic Healthcare",
    description: "Patient-Centric. Root-Cause Focused. Powered by Hahnemann AI.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico", apple: "/apple-icon.png" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  name: "NeoHomeo",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description: "AI-powered homeopathic healthcare platform offering patient-centric, root-cause focused consultations powered by Hahnemann AI.",
  medicalSpecialty: "Homeopathic",
  availableService: { "@type": "MedicalTherapy", name: "Homeopathic Consultation" },
  sameAs: ["https://www.neohomeo.in"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <RefractionCursor />
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
