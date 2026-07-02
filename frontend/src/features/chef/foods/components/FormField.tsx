import { ReactNode } from "react";

export default function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-right text-sm font-bold text-gray-900">
        {(label)}
      </span>

      {children}
    </label>
  );
}