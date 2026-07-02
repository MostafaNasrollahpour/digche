import { apiRequest } from "@/shared/api/api-client";
import type { ApiResponse } from "@/shared/api/api-types";
import { endpoints } from "@/shared/api/endpoints";
import type { ChefDashboardDto } from "../types/chef-dashboard.types";
import { mapChefDashboardDtoToData } from "../mappers/chef-dashboard.mapper";

function unwrapData<T>(response: T | ApiResponse<T>): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

export async function getChefDashboard() {
  const response = await apiRequest<
    ChefDashboardDto | ApiResponse<ChefDashboardDto>
  >(endpoints.chefDashboard.get, {
    auth: true,
  });

  return mapChefDashboardDtoToData(unwrapData(response));
}