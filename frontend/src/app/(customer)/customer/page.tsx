// src/app/(customer)/customer/page.tsx

import { redirect } from "next/navigation";

export default function CustomerDashboardPage() {
  redirect("/customer/addresses");
}