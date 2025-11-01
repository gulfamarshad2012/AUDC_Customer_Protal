// File: components/AccountRegistrationForm.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, User, CreditCard, Settings, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
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

const initialFormData: FormData = {
  company_name: "",
  company_registration_no: "",
  contact_name: "",
  contact_number: "",
  contact_email: "",
  billing_name: "",
  billing_email: "",
  billing_address_line1: "",
  billing_address_line2: "",
  billing_city: "",
  billing_state: "",
  billing_postal_code: "",
  billing_country: "",
  tax_no: "",
  preference_currency: "USD",
  timezone: "",
  payment_method: "",
  is_active: true,
};

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
];

const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
];

const paymentMethods = [
  { value: "credit_card", label: "Credit Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "paypal", label: "PayPal" },
  { value: "invoice", label: "Invoice" },
];

export default function AccountRegistrationForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionStatus("idle");

    const {
      company_name,
      company_registration_no,
      contact_name,
      contact_number,
      contact_email,
      billing_name,
      billing_email,
      billing_address_line1,
      billing_address_line2,
      billing_city,
      billing_state,
      billing_postal_code,
      billing_country,
      tax_no,
      is_active,
      preference_currency,
      timezone,
      payment_method,
    } = formData;

    try {
      const { data, error } = await supabase
        .schema("customer_portal")
        .from("accounts")
        .insert([
          {
            company_name,
            company_registration_no,
            contact_name,
            contact_number,
            contact_email,
            billing_name,
            billing_email,
            billing_address_line1,
            billing_address_line2,
            billing_city,
            billing_state,
            billing_postal_code,
            billing_country,
            tax_no,
            is_active,
            preference_currency,
            timezone,
            payment_method,
          },
        ]);

      if (error) {
        console.error("Error submitting form:", error);
        setSubmissionStatus("error");
      } else {
        console.log("Form submitted successfully:", data);
        setSubmissionStatus("success");
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setSubmissionStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6" style={{ backgroundColor: colors.background }}>
      <Card 
        className="w-full max-w-2xl mx-auto rounded-xl"
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
            Company Account Registration
          </CardTitle>
          <CardDescription 
            className="text-center"
            style={{ color: colors.muted }}
          >
            Please fill out all the information below to create your company
            account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Company Details Section */}
            <div 
              className="space-y-4 rounded-lg p-6"
              style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                border: `1px solid ${colors.border}`,
              }}
            >
              <h4 className="text-lg font-semibold flex items-center gap-2" style={{ color: colors.onCard }}>
                <Building2 className="w-5 h-5" style={{ color: colors.primary }} /> 
                <span>Company Details</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name" style={{ color: colors.muted }}>
                    Company Name *
                  </Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) =>
                      updateFormData("company_name", e.target.value)
                    }
                    placeholder="Enter your company name"
                    required
                    style={{ 
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.onCard,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_registration_no" style={{ color: colors.muted }}>
                    Company Registration Number
                  </Label>
                  <Input
                    id="company_registration_no"
                    value={formData.company_registration_no}
                    onChange={(e) =>
                      updateFormData("company_registration_no", e.target.value)
                    }
                    placeholder="Enter registration number (optional)"
                    style={{ 
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.onCard,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div 
              className="space-y-4 rounded-lg p-6"
              style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                border: `1px solid ${colors.border}`,
              }}
            >
              <h4 className="text-lg font-semibold flex items-center gap-2" style={{ color: colors.onCard }}>
                <User className="w-5 h-5" style={{ color: colors.primary }} /> 
                <span>Contact Information</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name" style={{ color: colors.muted }}>
                    Contact Name *
                  </Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) =>
                      updateFormData("contact_name", e.target.value)
                    }
                    placeholder="Enter primary contact name"
                    required
                    style={{ 
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.onCard,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email" style={{ color: colors.muted }}>
                    Contact Email *
                  </Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) =>
                      updateFormData("contact_email", e.target.value)
                    }
                    placeholder="Enter contact email address"
                    required
                    style={{ 
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.onCard,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_number" style={{ color: colors.muted }}>
                  Contact Number
                </Label>
                <Input
                  id="contact_number"
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) =>
                    updateFormData("contact_number", e.target.value)
                  }
                  placeholder="Enter phone number"
                  style={{ 
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.onCard,
                    border: `1px solid ${colors.border}`,
                  }}
                />
              </div>
            </div>

            {/* Billing Address Section */}
            <div 
              className="space-y-4 rounded-lg p-6"
              style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                border: `1px solid ${colors.border}`,
              }}
            >
              <h4 className="text-lg font-semibold flex items-center gap-2" style={{ color: colors.onCard }}>
                <CreditCard className="w-5 h-5" style={{ color: colors.primary }} /> 
                <span>Billing Address</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billing_name" style={{ color: colors.muted }}>
                    Billing Name *
                  </Label>
                  <Input
                    id="billing_name"
                    value={formData.billing_name}
                    onChange={(e) =>
                      updateFormData("billing_name", e.target.value)
                    }
                    placeholder="Name for billing"
                    required
                    style={{ 
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.onCard,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_email" style={{ color: colors.muted }}>
                    Billing Email *
                  </Label>
                  <Input
                    id="billing_email"
                    type="email"
                    value={formData.billing_email}
                    onChange={(e) =>
                      updateFormData("billing_email", e.target.value)
                    }
                    placeholder="Email for billing notifications"
                    required
                    style={{ 
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.onCard,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing_address_line1" style={{ color: colors.muted }}>
                  Address Line 1 *
                </Label>
                <Input
                  id="billing_address_line1"
                  value={formData.billing_address_line1}
                  onChange={(e) =>
                    updateFormData("billing_address_line1", e.target.value)
                  }
                  placeholder="Street address"
                  required
                  style={{ 
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.onCard,
                    border: `1px solid ${colors.border}`,
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing_address_line2" style={{ color: colors.muted }}>
                  Address Line 2
                </Label>
                <Input
                  id="billing_address_line2"
                  value={formData.billing_address_line2}
                  onChange={(e) =>
                    updateFormData("billing_address_line2", e.target.value)
                  }
                  placeholder="Apartment, suite, etc. (optional)"
                  style={{ 
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.onCard,
                    border: `1px solid ${colors.border}`,
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billing_city" style={{ color: colors.muted }}>
                    City *
                  </Label>
                  <Input
                    id="billing_city"
                    value={formData.billing_city}
                    onChange={(e) =>
                      updateFormData("billing_city", e.target.value)
                    }
                    placeholder="City"
                    required
                    style={{ 
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.onCard,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_state" style={{ color: colors.muted }}>
                    State/Province *
                  </Label>
                  <Input
                    id="billing_state"
                    value={formData.billing_state}
                    onChange={(e) =>
                      updateFormData("billing_state", e.target.value)
                    }
                    placeholder="State or Province"
                    required
                    style={{ 
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.onCard,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billing_postal_code" style={{ color: colors.muted }}>
                    Postal Code *
                  </Label>
                  <Input
                    id="billing_postal_code"
                    value={formData.billing_postal_code}
                    onChange={(e) =>
                      updateFormData("billing_postal_code", e.target.value)
                    }
                    placeholder="Postal/ZIP code"
                    required
                    style={{ 
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.onCard,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_country" style={{ color: colors.muted }}>
                    Country *
                  </Label>
                  <Input
                    id="billing_country"
                    value={formData.billing_country}
                    onChange={(e) =>
                      updateFormData("billing_country", e.target.value)
                    }
                    placeholder="Country"
                    required
                    style={{ 
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.onCard,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_no" style={{ color: colors.muted }}>
                  Tax Number
                </Label>
                <Input
                  id="tax_no"
                  value={formData.tax_no}
                  onChange={(e) => updateFormData("tax_no", e.target.value)}
                  placeholder="VAT/Tax ID (optional)"
                  style={{ 
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.onCard,
                    border: `1px solid ${colors.border}`,
                  }}
                />
              </div>
            </div>

            {/* Account Settings Section */}
            <div 
              className="space-y-4 rounded-lg p-6"
              style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                border: `1px solid ${colors.border}`,
              }}
            >
              <h4 className="text-lg font-semibold flex items-center gap-2" style={{ color: colors.onCard }}>
                <Settings className="w-5 h-5" style={{ color: colors.primary }} /> 
                <span>Account Settings</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preference_currency" style={{ color: colors.muted }}>
                    Preferred Currency
                  </Label>
                  <Select
                    value={formData.preference_currency}
                    onValueChange={(value) =>
                      updateFormData("preference_currency", value)
                    }
                  >
                    <SelectTrigger style={{ 
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.onCard,
                      border: `1px solid ${colors.border}`,
                    }}>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" style={{ color: colors.muted }}>
                    Timezone
                  </Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => updateFormData("timezone", value)}
                  >
                    <SelectTrigger style={{ 
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.onCard,
                      border: `1px solid ${colors.border}`,
                    }}>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((timezone) => (
                        <SelectItem key={timezone.value} value={timezone.value}>
                          {timezone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method" style={{ color: colors.muted }}>
                  Preferred Payment Method
                </Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) =>
                    updateFormData("payment_method", value)
                  }
                >
                  <SelectTrigger style={{ 
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.onCard,
                    border: `1px solid ${colors.border}`,
                  }}>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    updateFormData("is_active", checked as boolean)
                  }
                  style={{ 
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.onCard,
                    border: `1px solid ${colors.border}`,
                  }}
                />
                <Label htmlFor="is_active" className="text-sm" style={{ color: colors.muted }}>
                  Activate account immediately after creation
                </Label>
              </div>
            </div>

            {/* Submission Button and Status */}
            <div className="space-y-4 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center gap-2"
                style={{ 
                  backgroundColor: colors.primary,
                  color: colors.onPrimary,
                }}
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
              {submissionStatus === "success" && (
                <div className="text-center font-semibold flex items-center justify-center gap-2" style={{ color: colors.success }}>
                  <Check className="w-5 h-5" /> Account created successfully!
                </div>
              )}
              {submissionStatus === "error" && (
                <div className="text-center font-semibold" style={{ color: colors.error }}>
                  Failed to create account. Please try again.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}