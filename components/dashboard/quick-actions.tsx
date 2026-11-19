import Link from "next/link";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ElementType;
  variant?: "default" | "outline";
}

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <section className="rounded-xl border border-border p-6">
      <h2 className="text-sm font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-lg p-3 text-center text-sm font-medium transition-colors",
              action.variant === "outline"
                ? "border border-border hover:bg-muted"
                : "bg-accent text-accent-foreground hover:bg-accent/80"
            )}
          >
            <action.icon className="size-5" aria-hidden="true" />
            <span>{action.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}