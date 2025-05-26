import Link from "next/link";

export default function ChartsPage() {
  const charts = [
    { name: "Line Chart", href: "/charts/line" },
    { name: "Bar Chart", href: "/charts/bar" },
    { name: "Area Chart", href: "/charts/area" },
    { name: "Pie Chart", href: "/charts/pie" },
  ];

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Chart Examples</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {charts.map((chart) => (
          <Link
            key={chart.href}
            href={chart.href}
            className="p-6 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <h2 className="text-xl font-semibold">{chart.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
