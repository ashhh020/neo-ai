import { DHNavbar } from "@/components/drhomeos/DHNavbar";
import { DHHero } from "@/components/drhomeos/DHHero";
import { DHFeatures } from "@/components/drhomeos/DHFeatures";
import { DHAuthors } from "@/components/drhomeos/DHAuthors";
import { DHHowItWorks } from "@/components/drhomeos/DHHowItWorks";
import { DHPricing } from "@/components/drhomeos/DHPricing";
import { DHCTA } from "@/components/drhomeos/DHCTA";
import { DHFooter } from "@/components/drhomeos/DHFooter";

export const metadata = {
  title: "DrHomeos — AI Platform for Homeopathy Professionals",
  description:
    "AI-powered study platform for BHMS students and homeopathic practitioners. Materia Medica (9 authors), Repertory (74,667 rubrics), Organon Tutor, SM2 Flashcards, and Quiz Engine — all in one place.",
  keywords: [
    "homeopathy AI", "BHMS study", "materia medica", "repertory", "organon",
    "homeopathy student", "Hahnemann AI", "Kent repertory", "Boericke",
    "homeopathy flashcards", "homeopathy quiz", "DrHomeos",
  ],
  openGraph: {
    title: "DrHomeos — AI Platform for Homeopathy Professionals",
    description: "74,667 rubrics · 9 classical authors · Hahnemann AI Tutor · SM2 Flashcards",
    url: "https://drhomeos.com",
    siteName: "DrHomeos",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DrHomeos — AI Platform for Homeopathy Professionals",
    description: "Study smarter. Prescribe better. Free for BHMS students.",
  },
};

export default function HomePage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--silica-bg)",
        fontFamily: "var(--font-jakarta)",
      }}
    >
      <DHNavbar />
      <main>
        <DHHero />
        <DHFeatures />
        <DHAuthors />
        <DHHowItWorks />
        <DHPricing />
        <DHCTA />
      </main>
      <DHFooter />
    </div>
  );
}
