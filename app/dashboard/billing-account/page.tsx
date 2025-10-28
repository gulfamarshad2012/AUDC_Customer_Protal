"use client";
import { useState } from "react";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AccountData {
  id: string;
  tenantId: string;
  billingEmail: string;
  billingName: string;
  companyName: string | null;
  billingAddressLine1: string | null;
  billingAddressLine2: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingPostalCode: string | null;
  billingCountry: string | null;
  paymentMethod: string | null;
  stripeCustomerId: string | null;
  paymentProcessorId: string | null;
  isActive: boolean;
  autoBilling: boolean;
  gracePeriodDays: number | null;
  taxId: string | null;
  companySize: string | null;
  industry: string | null;
  preferredCurrency: string | null;
  timezone: string | null;
  accountBalance: number | null;
  createdBy: string | null;
  createdAt: string;
  modifiedBy: string | null;
  modifiedAt: string | null;
}

const countries = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "AU", label: "Australia" },
  { value: "JP", label: "Japan" },
  { value: "SG", label: "Singapore" },
];

const currencies = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "CAD", label: "CAD" },
  { value: "AUD", label: "AUD" },
  { value: "JPY", label: "JPY" },
];

const timezones = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo" },
];

const paymentMethods = [
  { value: "Credit Card", label: "Credit Card" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "PayPal", label: "PayPal" },
  { value: "Wire Transfer", label: "Wire Transfer" },
];

const companySizes = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-100", label: "51-100 employees" },
  { value: "101-500", label: "101-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

const industries = [
  { value: "Software", label: "Software & Technology" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Finance", label: "Finance & Banking" },
  { value: "Education", label: "Education" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Retail", label: "Retail & E-commerce" },
  { value: "Consulting", label: "Consulting" },
  { value: "Other", label: "Other" },
];

const mockAccountData: AccountData = {
  id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  tenantId: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  billingEmail: "jane.doe@example.com",
  billingName: "Jane Doe",
  companyName: "Acme Inc.",
  billingAddressLine1: "123 Main Street",
  billingAddressLine2: "Suite 100",
  billingCity: "Anytown",
  billingState: "CA",
  billingPostalCode: "12345",
  billingCountry: "US",
  paymentMethod: "Credit Card",
  stripeCustomerId: "cus_1234567890",
  paymentProcessorId: "pp_1234567890",
  isActive: true,
  autoBilling: true,
  gracePeriodDays: 7,
  taxId: "US123456789",
  companySize: "101-500",
  industry: "Software",
  preferredCurrency: "USD",
  timezone: "America/Los_Angeles",
  accountBalance: 0.0,
  createdBy: "System",
  createdAt: "2024-01-01T00:00:00Z",
  modifiedBy: null,
  modifiedAt: null,
};

const App = () => {
  const [formData, setFormData] = useState<AccountData>(mockAccountData);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]:
        type === "checkbox" 
          ? (e.target as HTMLInputElement).checked 
          : type === "number" 
            ? (value === "" ? null : Number(value))
            : value,
    }));
  };

  const handleSelectChange = (id: keyof AccountData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value === "" ? null : value,
    }));
  };

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      console.log("Saving form data:", formData);
      setIsLoading(false);
      alert("Billing information updated successfully!");
    }, 1500);
  };

  return (
    <div className="bg-gray-50 flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-full rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Billing Account Management
          </CardTitle>
          <CardDescription className="text-center">
            Update your billing and company information for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="billingEmail">Billing Email *</Label>
                  <Input
                    id="billingEmail"
                    type="email"
                    value={formData.billingEmail}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingName">Billing Name *</Label>
                  <Input
                    id="billingName"
                    value={formData.billingName}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName || ""}
                    onChange={handleChange}
                    placeholder="Acme Inc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId || ""}
                    onChange={handleChange}
                    placeholder="e.g., US123456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select
                    value={formData.companySize || ""}
                    onValueChange={(value) =>
                      handleSelectChange("companySize", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={formData.industry || ""}
                    onValueChange={(value) =>
                      handleSelectChange("industry", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Billing Address */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="billingAddressLine1">Address Line 1</Label>
                  <Input
                    id="billingAddressLine1"
                    value={formData.billingAddressLine1 || ""}
                    onChange={handleChange}
                    placeholder="123 Main St"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingAddressLine2">Address Line 2</Label>
                  <Input
                    id="billingAddressLine2"
                    value={formData.billingAddressLine2 || ""}
                    onChange={handleChange}
                    placeholder="Apt, suite, etc."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billingCity">City</Label>
                    <Input
                      id="billingCity"
                      value={formData.billingCity || ""}
                      onChange={handleChange}
                      placeholder="Anytown"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billingState">State/Province</Label>
                    <Input
                      id="billingState"
                      value={formData.billingState || ""}
                      onChange={handleChange}
                      placeholder="CA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billingPostalCode">Postal Code</Label>
                    <Input
                      id="billingPostalCode"
                      value={formData.billingPostalCode || ""}
                      onChange={handleChange}
                      placeholder="12345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billingCountry">Country</Label>
                    <Select
                      value={formData.billingCountry || "US"}
                      onValueChange={(value) =>
                        handleSelectChange("billingCountry", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment & Billing Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment & Billing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={formData.paymentMethod || ""}
                    onValueChange={(value) =>
                      handleSelectChange("paymentMethod", value)
                    }
                  >
                    <SelectTrigger className="w-full">
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
                <div className="space-y-2">
                  <Label htmlFor="gracePeriodDays">Grace Period (Days)</Label>
                  <Input
                    id="gracePeriodDays"
                    type="number"
                    min="0"
                    max="90"
                    value={formData.gracePeriodDays || ""}
                    onChange={handleChange}
                    placeholder="7"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripeCustomerId">Stripe Customer ID</Label>
                  <Input
                    id="stripeCustomerId"
                    value={formData.stripeCustomerId || ""}
                    onChange={handleChange}
                    placeholder="cus_1234567890"
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentProcessorId">Payment Processor ID</Label>
                  <Input
                    id="paymentProcessorId"
                    value={formData.paymentProcessorId || ""}
                    onChange={handleChange}
                    placeholder="pp_1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountBalance">Account Balance</Label>
                  <Input
                    id="accountBalance"
                    type="number"
                    step="0.01"
                    value={formData.accountBalance || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Preferences */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="preferredCurrency">Preferred Currency</Label>
                  <Select
                    value={formData.preferredCurrency || "USD"}
                    onValueChange={(value) =>
                      handleSelectChange("preferredCurrency", value)
                    }
                  >
                    <SelectTrigger className="w-full">
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
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={formData.timezone || "UTC"}
                    onValueChange={(value) =>
                      handleSelectChange("timezone", value)
                    }
                  >
                    <SelectTrigger className="w-full">
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
            </div>

            <Separator />

            {/* Account Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-billing"
                    checked={formData.autoBilling}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, autoBilling: checked }))
                    }
                  />
                  <Label htmlFor="auto-billing" className="!mt-0">
                    Enable auto-billing
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: checked === true,
                      }))
                    }
                  />
                  <Label htmlFor="is-active" className="!mt-0">
                    Account is active
                  </Label>
                </div>
              </div>
            </div>

            {/* Read-only Fields */}
            <div>
              <h3 className="text-lg font-semibold mb-4">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="createdBy">Created By</Label>
                  <Input
                    id="createdBy"
                    value={formData.createdBy || ""}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="createdAt">Created At</Label>
                  <Input
                    id="createdAt"
                    value={new Date(formData.createdAt).toLocaleString()}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modifiedBy">Modified By</Label>
                  <Input
                    id="modifiedBy"
                    value={formData.modifiedBy || "N/A"}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modifiedAt">Modified At</Label>
                  <Input
                    id="modifiedAt"
                    value={formData.modifiedAt ? new Date(formData.modifiedAt).toLocaleString() : "N/A"}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-6">
          <div className="text-sm text-gray-500">
            Account ID: {formData.id}
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default App;