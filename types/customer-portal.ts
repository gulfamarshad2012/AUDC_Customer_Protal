export interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: string;
  status: "active" | "suspended" | "pending";
  users: number;
  storage: string;
  createdAt: string;
}

export interface BillingHistory {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  invoiceUrl: string;
}

export interface Subscription {
  id: string;
  name: string;
  plan: string;
  status: "active" | "cancelled" | "expired";
  nextBilling: string;
  amount: number;
  features: string[];
}

export interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface Server {
  id: string;
  name: string;
  description: string | null;
  provider: string;
  status: string;
  domain: string;
  region: string | null;
  no_of_cpu_cores: number | null;
  ram: number;
  storage_capacity: number;
}

// @/types/customer-portal.ts
export type Product = {
  id: string;
  name: string;
  // config_schema: string
  description: string;
  is_active: boolean;
  created_at: string;
  features: {
    name?: string;
    description?: string;
    quota?: Record<string, any>;
  }[];
  max_users: number;
  monthly_price: number;
  annual_price: number;
  currency: string;
  billing_cycle: "monthly" | "annual" | "both";
  updated_at: string | null;
  off_on_annual: number;
};

export interface TenantFormData {
  Name: string;
  abn: string;
  domain_url: string;
  server: string;
  time_zone: string;
  access_code: string;
  organization_type?: string;
  enabled_features?: string[];
  entity_full_name: string;
  entity_short_name: string;
  entity_email: string;
  entity_website_url: string;
  entity_purpose: string;
  entity_mission: string;
  child_entities_term: string;
  employees_term: string;
  members_term: string;
  groups_term: string;
  entity_description: string;
}

export interface TenantFormPageProps {
  tenantId: string;
}

export interface TenantFormData {
  name: string;
  business_reg_number: string;
  access_code: string;
  subdomain: string;
  server_id: string;
  time_zone: string;
  status: "active" | "inactive";
}

export interface TenantInfoStepProps {
  data: Partial<TenantFormData>;
  errors: Partial<Record<keyof TenantFormData, string>>;
  onChange: (key: keyof TenantFormData, value: string | string[]) => void;
}

export interface ValidationResponse {
  valid: boolean;
}

export interface TimezonesResponse {
  timezones: string[];
}
