export function Stats() {
  const stats = [
    { value: "500M+", label: "People use homeopathy globally" },
    { value: "$11.2B", label: "Global market size" },
    { value: "18%", label: "CAGR through 2030" },
    { value: "200K+", label: "Registered practitioners in India" },
  ];

  return (
    <section className="border-y bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold font-poppins text-gradient-brand mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
