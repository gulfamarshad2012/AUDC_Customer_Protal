import { Product } from "@/types/customer-portal";
import { ApiService } from "./service";

// with console show api url
export async function getTimeZones(): Promise<string[]> {
  var response = await ApiService.makeGet<any>("/api/timezones");
  console.log(response);
    return response['data'].timezones || [];
}

export function isValidAccessCode(access_code: string): Promise<boolean> {
  return ApiService.makeGet<boolean>("/api/validate/access_code", {
    access_code: access_code,
  });
}

export function isValidDomain(domain: string): Promise<boolean> {
  return ApiService.makeGet<boolean>("/api/validate/subdomain", {
    subdomain: domain,
  });
}

export async function fetchProductsHelper(): Promise<Product[]> {
  return (await ApiService.makeGet<any>("/api/customer/products"))['data'];
}

export async function fetchProductConfiguration(id: string): Promise<any[]> {
  return (await ApiService.makeGet<any>(`/api/customer/products/config?product_id=${id}`))['data'];
}

// Helper function correction
export async function createTenantApi(tenantData: any): Promise<any> {
  return await ApiService.makePost<any>(`/api/customer/tenants/create`, tenantData);
}

export async function fetchStorageHelper() {
  return await ApiService.makeGet(`/api/storage/stats`);
}