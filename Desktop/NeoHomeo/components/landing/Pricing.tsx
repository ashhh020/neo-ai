import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const doctorTiers = [
  {
    name: "Basic",
    price: 999,
    period: "/mo",
    features: ["Up to 30 patients", "AI prescription assist (50/mo)", "Basic analytics", "Email support"],
    cta: "Start Free Trial",
  },
  {
    name: "Pro",
    price: 2499,
    period: "/mo",
    features: ["Up to 150 patients", "AI prescription assist (unlimited)", "Advanced analytics", "Teleconsult integration", "Priority support"],
    cta: "Start Free Trial",
    featured: true,
  },
  {
    name: "Clinic",
    price: 5999,
    period: "/mo",
    features: ["Unlimited patients", "Multiple doctors", "Custom branding", "API access", "Dedicated support", "Training sessions"],
    cta: "Contact Sales",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground">For doctors, clinics, and students</p>
        </div>

        <h3 className="text-lg font-semibold font-poppins mb-6 text-center">Doctor Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          {doctorTiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border bg-card p-6 ${tier.featured ? "ring-2 shadow-lg" : ""}`}
              style={tier.featured ? { boxShadow: "0 0 0 2px #2A5C8D, 0 8px 32px rgba(42,92,141,0.12)" } : {}}
            >
              {tier.featured && (
                <div className="text-xs font-medium mb-3 text-primary">MOST POPULAR</div>
              )}
              <div className="font-semibold font-poppins text-lg mb-1">{tier.name}</div>
              <div className="mb-4">
                <span className="text-3xl font-bold font-poppins">₹{tier.price.toLocaleString()}</span>
                <span className="text-muted-foreground text-sm">{tier.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={tier.featured ? "default" : "outline"}
                style={tier.featured ? { background: "linear-gradient(135deg, #2A5C8D, #4ECDC4)", color: "white", border: "none" } : {}}
                asChild
              >
                <Link href="/register">{tier.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
