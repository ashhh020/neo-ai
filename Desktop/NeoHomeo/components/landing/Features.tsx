import { MessageSquareText, Stethoscope, GraduationCap, ShoppingBag, BarChart3 } from "lucide-react";

const features = [
  {
    icon: MessageSquareText,
    title: "Patient Portal",
    color: "#4ECDC4",
    items: ["AI pre-assessment with Dr. Neo", "Doctor discovery & booking", "Remedy tracker & diary", "Medical records timeline"],
  },
  {
    icon: Stethoscope,
    title: "Clinic OS",
    color: "#2A5C8D",
    items: ["Morning overview & schedule", "AI prescription suggestions", "Patient case management", "Revenue analytics"],
  },
  {
    icon: GraduationCap,
    title: "Student Platform",
    color: "#8A2BE2",
    items: ["50+ remedy Materia Medica", "Spaced-repetition flashcards", "AI Socratic tutor", "Quiz engine with case studies"],
  },
  {
    icon: ShoppingBag,
    title: "Pharmacy Console",
    color: "#5BB85A",
    items: ["Prescription fulfillment", "Inventory management", "Dispensing workflow", "Patient communication"],
  },
  {
    icon: BarChart3,
    title: "Admin Panel",
    color: "#F59E0B",
    items: ["Platform metrics overview", "Doctor verification queue", "AI monitoring dashboard", "Revenue & MRR tracking"],
  },
];

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4">
            Five Surfaces. One Platform.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            NeoHomeo connects every stakeholder in the homeopathic ecosystem on a single intelligent platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border bg-card p-5 card-hover">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: feature.color + "20" }}
              >
                <feature.icon className="h-5 w-5" style={{ color: feature.color }} strokeWidth={1.75} />
              </div>
              <h3 className="font-semibold font-poppins mb-3">{feature.title}</h3>
              <ul className="space-y-1.5">
                {feature.items.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground flex items-start gap-1.5">
                    <span className="mt-1.5 h-1 w-1 rounded-full flex-shrink-0" style={{ backgroundColor: feature.color }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
