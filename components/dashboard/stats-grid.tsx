interface StatCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  trend?: { label: string; value: number; positive: boolean };
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

const variantColors: Record<string, string> = {
  default: "bg-card text-card-foreground border border-border",
  primary: "bg-primary text-primary-foreground",
  success: "bg-green-500 text-white",
  warning: "bg-amber-500 text-white",
  destructive: "bg-destructive text-destructive-foreground",
};

export function StatsGrid({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className={cn(
            "rounded-xl border border-border p-5 shadow-sm",
            variantColors[stat.variant ?? "default"]
          )}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <stat.icon className="size-5" aria-hidden="true" />
              <span className="ml-auto text-sm text-muted-foreground">
                {stat.subtitle}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{stat.value}</span>
              {stat.trend && (
                <span className={`text-xs font-medium ${
                  stat.trend.positive
                    ? "text-green-600 dark:text-green-400"
                    : "text-destructive dark:text-destructive/80"
                }`}>
                  {stat.trend.positive ? "↑" : "↓"} {stat.trend.value}%
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}