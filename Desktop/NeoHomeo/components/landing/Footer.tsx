import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-12 bg-card">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center text-white font-bold text-sm font-poppins">
                N
              </div>
              <span className="font-semibold font-poppins">NeoHomeo</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered homeopathic healthcare platform. Patient-Centric. Root-Cause Focused.
            </p>
          </div>

          {[
            { title: "Platform", links: ["Patient Portal", "Clinic OS", "Student Platform", "Admin Panel"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "HIPAA Compliance", "Cookie Policy"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 NeoHomeo Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="text-xs">
            ⚕️ NeoHomeo AI is not a replacement for qualified medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
