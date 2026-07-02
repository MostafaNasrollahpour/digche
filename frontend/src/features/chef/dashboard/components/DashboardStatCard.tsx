import type { LucideIcon } from "lucide-react";

type DashboardStatCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  cardClassName?: string;
  iconClassName?: string;
};

export default function DashboardStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  cardClassName = "bg-white",
  iconClassName = "bg-gray-100 text-gray-900",
}: DashboardStatCardProps) {
  return (
    <article
      dir="rtl"
      className={`relative flex min-h-[116px] w-full flex-col rounded-md px-4 py-3 text-right shadow-[0_4px_8px_rgba(0,0,0,0.22)] ${cardClassName}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate text-[11px] font-medium leading-5 text-gray-950">
          {title}
        </p>

        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
        >
          <Icon size={15} strokeWidth={1.8} />
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col items-center justify-center">
        <strong
          dir="ltr"
          className="block max-w-full whitespace-nowrap text-center text-[24px] font-normal leading-none tracking-tight text-black"
        >
          {value}
        </strong>

        <span className="mt-3 block text-center text-[10px] font-medium leading-4 text-black">
          {subtitle}
        </span>
      </div>
    </article>
  );
}