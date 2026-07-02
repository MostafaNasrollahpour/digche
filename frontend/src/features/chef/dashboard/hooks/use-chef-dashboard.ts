"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { getChefDashboard } from "../api/chef-dashboard.api";

export function useChefDashboard() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["chef-dashboard", currentUser?.publicId ?? currentUser?.id],
    queryFn: getChefDashboard,
    enabled: currentUser?.role === "chef" && Boolean(accessToken),
  });
}