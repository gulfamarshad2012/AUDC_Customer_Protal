"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Building2, User, CreditCard, Settings } from "lucide-react";
import { BASE_URL } from "@/config/constants";
import { colors } from "@/config/color-scheme";

interface FormData {
  company_name: string;
  company_registration_no: string;
  contact_name: string;
  contact_number: string;
  contact_email: string;
  billing_name: string;
  billing_email: string;
  billing_address_line1: string;
  billing_address_line2: string;
  billing_city: string;
  billing_state: string;
  billing_postal_code: string;
  billing_country: string;
  tax_no: string;
  preference_currency: string;
  timezone: string;
  payment_method: string;
  is_active: boolean;
}

export default function AccountViewPage() {
  const [account, setAccount] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) {
        window.location.href = `${BASE_URL}/app/onboard/welcome`;
        return;
      }

      const userId = userData.user.id;

      // Fetch account of current user
      const { data, error } = await supabase
        .schema("customer_portal")
        .from("accounts")
        .select("*")
        .eq("created_by", userId)
        .maybeSingle();

      if (error || !data) {
        window.location.href = `${BASE_URL}/app/onboard/welcome`;
      } else {
        setAccount(data as FormData);
      }

      setLoading(false);
    };

    fetchAccount();
  }, []);

  if (loading) {
    return (
      <div 
        className="text-center p-6" 
        style={{ color: colors.onBackground }}
      >
        Loading account...
      </div>
    );
  }

  if (!account) return null;

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen p-6"
      style={{ backgroundColor: colors.background }}
    >
      <Card 
        className="w-full max-w-5xl mx-auto rounded-xl"
        style={{ 
          backgroundColor: colors.card,
          borderColor: colors.border,
          border: `1px solid ${colors.border}`,
          boxShadow: `0 4px 6px -1px ${colors.shadow}`,
        }}
      >
        <CardHeader>
          <CardTitle 
            className="text-2xl font-bold text-center"
            style={{ color: colors.onCard }}
          >
            Your Account
          </CardTitle>
          <CardDescription 
            className="text-center"
            style={{ color: colors.muted }}
          >
            Below are your company account details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Company Details */}
            <div 
              className="space-y-2 p-4 rounded-lg"
              style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                border: `1px solid ${colors.border}`,
              }}
            >
              <h4 
                className="font-semibold flex items-center gap-2"
                style={{ color: colors.onCard }}
              >
                <Building2 
                  className="w-5 h-5" 
                  style={{ color: colors.primary }} 
                /> 
                <span>Company Details</span>
              </h4>
              <p style={{ color: colors.onCard }}>
                <Label style={{ color: colors.muted }}>Company Name:</Label> {account.company_name}
              </p>
              <p style={{ color: colors.onCard }}>
                <Label style={{ color: colors.muted }}>Registration No:</Label>{" "}
                {account.company_registration_no || "N/A"}
              </p>
            </div>

            {/* Contact Info */}
            <div 
              className="space-y-2 p-4 rounded-lg"
              style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                border: `1px solid ${colors.border}`,
              }}
            >
              <h4 
                className="font-semibold flex items-center gap-2"
                style={{ color: colors.onCard }}
              >
                <User 
                  className="w-5 h-5" 
                  style={{ color: colors.primary }} 
                /> 
                <span>Contact Information</span>
              </h4>
              <p style={{ color: colors.onCard }}>
                <Label style={{ color: colors.muted }}>Contact Name:</Label> {account.contact_name}
              </p>
              <p style={{ color: colors.onCard }}>
                <Label style={{ color: colors.muted }}>Email:</Label> {account.contact_email}
              </p>
              <p style={{ color: colors.onCard }}>
                <Label style={{ color: colors.muted }}>Phone:</Label> {account.contact_number || "N/A"}
              </p>
            </div>

            {/* Billing Info */}
            <div 
              className="space-y-2 p-4 rounded-lg"
              style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                border: `1px solid ${colors.border}`,
              }}
            >
              <h4 
                className="font-semibold flex items-center gap-2"
                style={{ color: colors.onCard }}
              >
                <CreditCard 
                  className="w-5 h-5" 
                  style={{ color: colors.primary }} 
                /> 
                <span>Billing Information</span>
              </h4>
              <p style={{ color: colors.onCard }}>
                <Label style={{ color: colors.muted }}>Name:</Label> {account.billing_name}
              </p>
              <p style={{ color: colors.onCard }}>
                <Label style={{ color: colors.muted }}>Email:</Label> {account.billing_email}
              </p>
              <p style={{ color: colors.onCard }}>
                <Label style={{ color: colors.muted }}>Address:</Label> {account.billing_address_line1},{" "}
                {account.billing_address_line2 || ""}
              </p>
              <p style={{ color: colors.onCard }}>
                <Label style={{ color: colors.muted }}>City:</Label> {account.billing_city}
              </p>
              <p style={{ color: colors.onCard }}>
                <Label style={{ color: colors.muted }}>State:</Label> {account.billing_state}
              </p>
              <p style={{ color: colors.onCard }}>
                <Label style={{ color: colors.muted }}>Postal Code:</Label> {account.billing_postal_code}
              </p>
              <p style={{ color: colors.onCard }}>
                <Label style={{ color: colors.muted }}>Country:</Label> {account.billing_country}
              </p>
              <p style={{ color: colors.onCard }}>
                <Label style={{ color: colors.muted }}>Tax No:</Label> {account.tax_no || "N/A"}
              </p>
            </div>

            {/* Account Settings */}
            <div 
              className="space-y-2 p-4 rounded-lg"
              style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                border: `1px solid ${colors.border}`,
              }}
            >
              <h4 
                className="font-semibold flex items-center gap-2"
                style={{ color: colors.onCard }}
              >
                <Settings 
                  className="w-5 h-5" 
                  style={{ color: colors.primary }} 
                /> 
                <span>Account Settings</span>
              </h4>
              <p style={{ color: colors.onCard }}>
                <Label style={{ color: colors.muted }}>Currency:</Label> {account.preference_currency}
              </p>
              <p style={{ color: colors.onCard }}>
                <Label style={{ color: colors.muted }}>Timezone:</Label> {account.timezone}
              </p>
              <p style={{ color: colors.onCard }}>
                <Label style={{ color: colors.muted }}>Payment Method:</Label> {account.payment_method}
              </p>
              <p style={{ color: colors.onCard }}>
                <Label style={{ color: colors.muted }}>Status:</Label>{" "}
                <span 
                  style={{ 
                    color: account.is_active ? colors.success : colors.error,
                    fontWeight: 'bold'
                  }}
                >
                  {account.is_active ? "Active ✅" : "Inactive ❌"}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}