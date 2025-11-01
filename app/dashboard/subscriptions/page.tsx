"use client";
import { Button } from "@/components/ui/button";
import {
  Star,
  Zap,
  Crown,
  Rocket,
  Loader2,
  CheckCircle,
  HelpCircle,
  CreditCard,
  Shield,
  Users,
  Database,
  BarChart3,
  Settings,
  Globe,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { colors } from "@/config/color-scheme";

// Define a type for a single currency
type CurrencyData = {
  symbol: string;
  rate: number;
  name: string;
};

// Define a type for the currency rates object
type CurrencyRates = {
  [key: string]: CurrencyData;
  usd: CurrencyData;
  eur: CurrencyData;
  gbp: CurrencyData;
  cad: CurrencyData;
  aud: CurrencyData;
  jpy: CurrencyData;
  dkk: CurrencyData;
  sek: CurrencyData;
  nok: CurrencyData;
};

// Define types based on Supabase schema
type Product = {
  id: string;
  name: string;
  is_active: boolean;
  plan_name: string;
  max_users: number;
  features_ids: string[];
  monthly_price: number;
  annual_price: number;
  currency: string;
  billing_cycle: "monthly" | "annual" | "both";
  off_on_annual: number;
};

// Define feature type
type Feature = {
  id: string;
  feature_name: string;
  feature_settings?: any;
  is_active: boolean;
};

// Define feature mapping type
type FeatureMapping = {
  [key: string]: {
    name: string;
    description?: string;
  };
};

// Payment form type
type PaymentForm = {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
};

const plans = [
  {
    id: "starter-plan",
    name: "Starter",
    monthlyPrice: 9.0,
    annualPrice: 90.0,
    description: "Perfect for individuals getting started",
    icon: <Zap className="h-6 w-6" />,
    features: [
      "Up to 5 projects",
      "10GB storage",
      "Basic analytics",
      "Email support",
      "Standard templates",
    ],
    popular: false,
    buttonText: "Get Started",
    trialDays: 14,
  },
  {
    id: "professional-plan",
    name: "Professional",
    monthlyPrice: 29.0,
    annualPrice: 290.0,
    description: "Ideal for growing teams and businesses",
    icon: <Star className="h-6 w-6" />,
    features: [
      "Up to 25 projects",
      "100GB storage",
      "Advanced analytics",
      "Priority support",
      "Premium templates",
      "Team collaboration",
      "Custom integrations",
    ],
    popular: true,
    buttonText: "Current",
    trialDays: 30,
  },
  {
    id: "business-plan",
    name: "Business",
    monthlyPrice: 79.0,
    annualPrice: 790.0,
    description: "Advanced features for established companies",
    icon: <Crown className="h-6 w-6" />,
    features: [
      "Unlimited projects",
      "500GB storage",
      "Real-time analytics",
      "24/7 phone support",
      "White-label options",
      "Advanced security",
      "API access",
      "Custom workflows",
    ],
    popular: false,
    buttonText: "Upgrade Now",
    trialDays: 30,
  },
  {
    id: "enterprise-plan",
    name: "Enterprise",
    monthlyPrice: 199.0,
    annualPrice: 1990.0,
    description: "Complete solution for large organizations",
    icon: <Rocket className="h-6 w-6" />,
    features: [
      "Unlimited everything",
      "Unlimited storage",
      "Custom analytics",
      "Dedicated support",
      "Full customization",
      "Enterprise security",
      "SLA guarantee",
      "On-premise option",
      "Training & onboarding",
    ],
    popular: false,
    buttonText: "Upgrade Now",
    trialDays: 30,
  },
];

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<"yearly" | "monthly">(
    "yearly"
  );
  const [currency, setCurrency] = useState<keyof CurrencyRates>("usd");
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [featureMapping, setFeatureMapping] = useState<FeatureMapping>({});
  const [loading, setLoading] = useState(true);

  // New states for upgrade functionality
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Product | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
  });

  useEffect(() => {
    // Check for current plan in local storage on component mount
    const savedPlan = localStorage.getItem("currentPlan");
    if (savedPlan) {
      setCurrentPlan(savedPlan);
    }

    async function fetchData() {
      try {
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .schema("shared")
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("monthly_price");

        if (productsError) {
          throw productsError;
        }

        // Fetch features
        const { data: featuresData, error: featuresError } = await supabase
          .schema("shared")
          .from("features")
          .select("*")
          .eq("is_active", true);

        if (featuresError) {
          throw featuresError;
        }

        setProducts(productsData || []);
        setFeatures(featuresData || []);

        // Create feature mapping object
        const mapping: FeatureMapping = {};
        if (featuresData) {
          featuresData.forEach((feature: Feature) => {
            mapping[feature.id] = {
              name: feature.feature_name,
              description: feature.feature_settings?.description || undefined,
            };
          });
        }
        setFeatureMapping(mapping);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const currencyRates: CurrencyRates = {
    usd: { symbol: "$", rate: 1, name: "USD" },
    eur: { symbol: "€", rate: 0.85, name: "EUR" },
    gbp: { symbol: "£", rate: 0.73, name: "GBP" },
    cad: { symbol: "C$", rate: 1.25, name: "CAD" },
    aud: { symbol: "A$", rate: 1.35, name: "AUD" },
    jpy: { symbol: "¥", rate: 110, name: "JPY" },
    dkk: { symbol: "kr", rate: 6.0, name: "DKK" },
    sek: { symbol: "kr", rate: 8.5, name: "SEK" },
    nok: { symbol: "kr", rate: 8.2, name: "NOK" },
  };

  const convertPrice = (usdPrice: number): number => {
    const rate = currencyRates[currency].rate;
    const converted = usdPrice * rate;

    if (currency === "jpy") {
      return Math.round(converted);
    }

    return Math.round(converted * 100) / 100;
  };

  const formatPrice = (price: number): string => {
    const symbol = currencyRates[currency].symbol;
    const converted = convertPrice(price);

    if (currency === "jpy") {
      return `${symbol}${converted.toLocaleString()}`;
    }

    return `${symbol}${converted}`;
  };

  // Handle upgrade button click
  const handleUpgradeClick = (product: Product) => {
    setSelectedPlan(product);
    setIsUpgradeDialogOpen(true);
  };

  // Handle payment form input changes
  const handlePaymentFormChange = (field: keyof PaymentForm, value: string) => {
    setPaymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle payment submission
  const handlePaymentSubmit = async () => {
    if (!selectedPlan) return;

    setIsProcessingPayment(true);

    try {
      // Validate form
      const requiredFields: (keyof PaymentForm)[] = [
        "cardNumber",
        "cardName",
        "expiryDate",
        "cvv",
        "address",
        "city",
        "country",
        "postalCode",
      ];

      for (const field of requiredFields) {
        if (!paymentForm[field].trim()) {
          alert(
            `Please fill in the ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
          );
          setIsProcessingPayment(false);
          return;
        }
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

      // Update current plan state
      setCurrentPlan(selectedPlan.id);

      // Save current plan to local storage
      localStorage.setItem("currentPlan", selectedPlan.id);

      // Close dialog and reset form
      setIsUpgradeDialogOpen(false);
      setPaymentForm({
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvv: "",
        address: "",
        city: "",
        country: "",
        postalCode: "",
      });

      alert("Payment successful! Your plan has been upgraded.");
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Tooltip state and handlers
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: string;
    x: number;
    y: number;
  }>({
    visible: false,
    content: "",
    x: 0,
    y: 0,
  });

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    featureId: string
  ) => {
    const feature = featureMapping[featureId];
    if (feature && feature.description) {
      setTooltip({
        visible: true,
        content: feature.description,
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tooltip.visible) {
      setTooltip((prev) => ({
        ...prev,
        x: e.clientX,
        y: e.clientY,
      }));
    }
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  if (loading) {
    return (
      <div
        className="flex min-h-[400px] items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: colors.primary }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen max-w-full w-full"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mb-6">
          <div
            className="inline-flex items-center justify-center p-3 rounded-full mb-4"
            style={{ backgroundColor: `${colors.primary}10` }}
          >
            <div
              className="p-2 rounded-full"
              style={{ backgroundColor: colors.primary }}
            >
              <CreditCard className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <h1
          className="text-4xl md:text-6xl font-bold mb-4"
          style={{ color: colors.onCard }}
        >
          Choose Your Perfect Plan
        </h1>
        <p
          className="text-xl max-w-2xl mx-auto mb-8"
          style={{ color: colors.muted }}
        >
          Unlock powerful features and take your productivity to the next level
          with our flexible subscription options
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-10 gap-6 max-w-6xl mx-auto">
          <div>
            {/* Save 20% Badge */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-75"></div>
                <div className="relative bg-white rounded-full px-4 py-2 flex items-center">
                  <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Save 20%
                  </span>
                </div>
              </div>
            </div>
            {/* Billing Cycle Tabs */}
            <div
              className="flex rounded-lg p-1 shadow-sm"
              style={{ backgroundColor: colors.surface }}
            >
              <button
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === "yearly" ? "" : ""
                }`}
                style={{
                  backgroundColor:
                    billingCycle === "yearly" ? colors.primary : "transparent",
                  color:
                    billingCycle === "yearly"
                      ? colors.onPrimary
                      : colors.onCard,
                }}
                onClick={() => setBillingCycle("yearly")}
              >
                Billed Yearly
              </button>
              <button
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === "monthly" ? "" : ""
                }`}
                style={{
                  backgroundColor:
                    billingCycle === "monthly" ? colors.primary : "transparent",
                  color:
                    billingCycle === "monthly"
                      ? colors.onPrimary
                      : colors.onCard,
                }}
                onClick={() => setBillingCycle("monthly")}
              >
                Billed Monthly
              </button>
            </div>
          </div>
          {/* Currency Selector */}
          <div className="relative flex">
            <p
              className="text-md font-bold my-auto mr-2"
              style={{ color: colors.onCard }}
            >
              Prices in
            </p>
            <div className="relative">
              <button
                className="flex items-center justify-between w-32 px-4 py-2.5 rounded-lg shadow-sm transition-all"
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              >
                <span className="flex items-center">
                  <span
                    className="font-medium"
                    style={{ color: colors.onCard }}
                  >
                    {currencyRates[currency].name}
                  </span>
                </span>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    currencyDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: colors.muted }}
                >
                  <path
                    clipRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    fillRule="evenodd"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {currencyDropdownOpen && (
                <div
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg shadow-lg overflow-hidden"
                  style={{ backgroundColor: colors.card }}
                >
                  <div className="py-1">
                    {Object.entries(currencyRates).map(([code, data]) => (
                      <button
                        key={code}
                        className={`flex items-center w-full px-4 py-3 text-left text-sm transition-colors ${
                          currency === code ? "" : ""
                        }`}
                        style={{
                          backgroundColor:
                            currency === code
                              ? `${colors.primary}10`
                              : "transparent",
                          color:
                            currency === code ? colors.primary : colors.onCard,
                        }}
                        onClick={() => {
                          setCurrency(code as keyof CurrencyRates);
                          setCurrencyDropdownOpen(false);
                        }}
                      >
                        <span className="font-medium">{data.name}</span>
                        <span
                          className="ml-2 text-xs"
                          style={{ color: colors.muted }}
                        >
                          ({data.symbol})
                        </span>
                        {currency === code && (
                          <svg
                            className="w-5 h-5 ml-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            style={{ color: colors.primary }}
                          >
                            <path
                              clipRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              fillRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product, index: number) => {
            const price =
              billingCycle === "yearly"
                ? product.annual_price
                : product.monthly_price;

            // Determine button text and action based on current plan
            const isCurrentPlan = currentPlan === product.id;
            const buttonText = isCurrentPlan ? "Current" : "Upgrade Now";
            const buttonAction = isCurrentPlan
              ? undefined
              : () => handleUpgradeClick(product);

            return (
              <div
                key={product.id}
                className="relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
                style={{
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {product.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-4 py-2 rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}
                {product.max_users > 1 && (
                  <div
                    className="absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: `${colors.success}20`,
                      color: colors.success,
                      border: `1px solid ${colors.success}`,
                    }}
                  >
                    Up to {product.max_users} users
                  </div>
                )}
                <div className="p-8">
                  {/* Plan Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${colors.primary}10` }}
                        >
                          {product.icon}
                        </div>
                        <h3
                          className="text-2xl font-bold"
                          style={{ color: colors.onCard }}
                        >
                          {product.name}
                        </h3>
                      </div>
                      <p className="text-sm" style={{ color: colors.muted }}>
                        {product.description}
                      </p>
                    </div>
                    {product.max_users > 1 && (
                      <div
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: `${colors.primary}10`,
                          color: colors.primary,
                        }}
                      >
                        <Users className="w-3 h-3" />
                        <span>Team Workspace</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="mb-8">
                    <div className="flex items-baseline">
                      <span className="text-sm" style={{ color: colors.muted }}>
                        {currencyRates[currency].name}
                      </span>
                      <span
                        className="text-4xl font-bold ml-1"
                        style={{ color: colors.onCard }}
                      >
                        {formatPrice(price)}
                      </span>
                      {price > 0 && (
                        <span
                          className="text-sm ml-3"
                          style={{ color: colors.muted }}
                        >
                          {billingCycle === "yearly"
                            ? `per user/month · ${formatPrice(
                                price * 12
                              )} billed yearly`
                            : billingCycle === "monthly" &&
                                product.plan_name === "Business"
                              ? "plus local tax · per user/month"
                              : "per user/month"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    <h4
                      className="text-sm font-medium"
                      style={{ color: colors.onCard }}
                    >
                      {product.plan_name === "Beginner"
                        ? "An account with:"
                        : product.plan_name === "Pro"
                          ? "Everything in Beginner, plus:"
                          : "Everything in Pro for every member, plus:"}
                    </h4>
                    <ul className="space-y-3">
                      {product.features_ids.map(
                        (featureId: string, i: number) => {
                          const feature = featureMapping[featureId];
                          if (!feature) return null;
                          return (
                            <li key={i} className="flex items-start group">
                              <CheckCircle
                                className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0"
                                style={{ color: colors.success }}
                              />
                              <div
                                className="flex items-center"
                                onMouseEnter={(e) =>
                                  handleMouseEnter(e, featureId)
                                }
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                              >
                                <span
                                  className="text-sm"
                                  style={{ color: colors.onCard }}
                                >
                                  {feature.name}
                                </span>
                                {feature.description && (
                                  <HelpCircle
                                    className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-help"
                                    style={{ color: colors.muted }}
                                  />
                                )}
                              </div>
                            </li>
                          );
                        }
                      )}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div className="mt-8">
                    <Button
                      className={`w-full py-3 text-base font-medium rounded-lg transition-all ${
                        isCurrentPlan ? "" : ""
                      }`}
                      style={{
                        backgroundColor: isCurrentPlan
                          ? colors.surface
                          : colors.primary,
                        color: isCurrentPlan ? colors.onCard : colors.onPrimary,
                        border: isCurrentPlan
                          ? `1px solid ${colors.border}`
                          : "none",
                      }}
                      onClick={buttonAction}
                      disabled={isCurrentPlan}
                    >
                      {buttonText}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent
          className="sm:max-w-[600px]"
          style={{ backgroundColor: colors.card }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: colors.onCard }}>
              Upgrade to {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription style={{ color: colors.muted }}>
              Complete your payment to upgrade your subscription plan.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: colors.onCard }}>Card Number</Label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={paymentForm.cardNumber}
                  onChange={(e) =>
                    handlePaymentFormChange("cardNumber", e.target.value)
                  }
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.onCard,
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label style={{ color: colors.onCard }}>Cardholder Name</Label>
                <Input
                  placeholder="John Doe"
                  value={paymentForm.cardName}
                  onChange={(e) =>
                    handlePaymentFormChange("cardName", e.target.value)
                  }
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.onCard,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: colors.onCard }}>Expiry Date</Label>
                <Input
                  placeholder="MM/YY"
                  value={paymentForm.expiryDate}
                  onChange={(e) =>
                    handlePaymentFormChange("expiryDate", e.target.value)
                  }
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.onCard,
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label style={{ color: colors.onCard }}>CVV</Label>
                <Input
                  placeholder="123"
                  value={paymentForm.cvv}
                  onChange={(e) =>
                    handlePaymentFormChange("cvv", e.target.value)
                  }
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.onCard,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label style={{ color: colors.onCard }}>Billing Address</Label>
              <Textarea
                placeholder="123 Main Street"
                value={paymentForm.address}
                onChange={(e) =>
                  handlePaymentFormChange("address", e.target.value)
                }
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.onCard,
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label style={{ color: colors.onCard }}>City</Label>
                <Input
                  placeholder="New York"
                  value={paymentForm.city}
                  onChange={(e) =>
                    handlePaymentFormChange("city", e.target.value)
                  }
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.onCard,
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label style={{ color: colors.onCard }}>Country</Label>
                <Select
                  onValueChange={(value) =>
                    handlePaymentFormChange("country", value)
                  }
                >
                  <SelectTrigger
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.onCard,
                    }}
                  >
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label style={{ color: colors.onCard }}>Postal Code</Label>
                <Input
                  placeholder="10001"
                  value={paymentForm.postalCode}
                  onChange={(e) =>
                    handlePaymentFormChange("postalCode", e.target.value)
                  }
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.onCard,
                  }}
                />
              </div>
            </div>

            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium" style={{ color: colors.onCard }}>
                  Total Amount:
                </span>
                <span
                  className="font-bold text-lg"
                  style={{ color: colors.primary }}
                >
                  {selectedPlan &&
                    formatPrice(
                      billingCycle === "yearly"
                        ? selectedPlan.annual_price
                        : selectedPlan.monthly_price
                    )}
                  {billingCycle === "yearly" ? "/year" : "/month"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpgradeDialogOpen(false)}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.onCard,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePaymentSubmit}
              disabled={isProcessingPayment}
              style={{
                backgroundColor: colors.primary,
                color: colors.onPrimary,
              }}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed text-xs rounded py-2 px-3 pointer-events-none z-50 max-w-xs shadow-lg"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            backgroundColor: colors.card,
            color: colors.onCard,
            border: `1px solid ${colors.border}`,
          }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Value Proposition Section */}
      <div className="py-16" style={{ backgroundColor: colors.surface }}>
        <div className="container mx-auto px-4 text-center">
          <h2
            className="text-3xl font-bold mb-8"
            style={{ color: colors.onCard }}
          >
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="p-6" style={{ backgroundColor: colors.card }}>
              <div className="flex flex-col items-center space-y-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${colors.primary}10` }}
                >
                  <Zap className="h-8 w-8" style={{ color: colors.primary }} />
                </div>
                <h3
                  className="text-xl font-semibold"
                  style={{ color: colors.onCard }}
                >
                  Lightning Fast
                </h3>
                <p className="text-center" style={{ color: colors.muted }}>
                  Experience blazing-fast performance with our optimized
                  infrastructure
                </p>
              </div>
            </Card>
            <Card className="p-6" style={{ backgroundColor: colors.card }}>
              <div className="flex flex-col items-center space-y-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${colors.primary}10` }}
                >
                  <Star className="h-8 w-8" style={{ color: colors.primary }} />
                </div>
                <h3
                  className="text-xl font-semibold"
                  style={{ color: colors.onCard }}
                >
                  Premium Quality
                </h3>
                <p className="text-center" style={{ color: colors.muted }}>
                  Built with attention to detail and industry best practices
                </p>
              </div>
            </Card>
            <Card className="p-6" style={{ backgroundColor: colors.card }}>
              <div className="flex flex-col items-center space-y-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${colors.primary}10` }}
                >
                  <Crown
                    className="h-8 w-8"
                    style={{ color: colors.primary }}
                  />
                </div>
                <h3
                  className="text-xl font-semibold"
                  style={{ color: colors.onCard }}
                >
                  Enterprise Ready
                </h3>
                <p className="text-center" style={{ color: colors.muted }}>
                  Scalable solutions that grow with your business needs
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2
            className="text-3xl font-bold text-center mb-12"
            style={{ color: colors.onCard }}
          >
            Powerful Features for Every Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6" style={{ backgroundColor: colors.card }}>
              <div className="flex flex-col items-center space-y-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${colors.primary}10` }}
                >
                  <Database
                    className="h-8 w-8"
                    style={{ color: colors.primary }}
                  />
                </div>
                <h3
                  className="text-xl font-semibold"
                  style={{ color: colors.onCard }}
                >
                  Secure Storage
                </h3>
                <p className="text-center" style={{ color: colors.muted }}>
                  Your data is encrypted and securely stored in our cloud
                  infrastructure
                </p>
              </div>
            </Card>
            <Card className="p-6" style={{ backgroundColor: colors.card }}>
              <div className="flex flex-col items-center space-y-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${colors.primary}10` }}
                >
                  <BarChart3
                    className="h-8 w-8"
                    style={{ color: colors.primary }}
                  />
                </div>
                <h3
                  className="text-xl font-semibold"
                  style={{ color: colors.onCard }}
                >
                  Advanced Analytics
                </h3>
                <p className="text-center" style={{ color: colors.muted }}>
                  Get detailed insights into your usage and performance metrics
                </p>
              </div>
            </Card>
            <Card className="p-6" style={{ backgroundColor: colors.card }}>
              <div className="flex flex-col items-center space-y-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${colors.primary}10` }}
                >
                  <Settings
                    className="h-8 w-8"
                    style={{ color: colors.primary }}
                  />
                </div>
                <h3
                  className="text-xl font-semibold"
                  style={{ color: colors.onCard }}
                >
                  Customizable
                </h3>
                <p className="text-center" style={{ color: colors.muted }}>
                  Tailor the platform to match your specific business needs
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="py-12"
        style={{
          backgroundColor: colors.card,
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4" style={{ color: colors.muted }}>
            Questions about our plans? We&apos;re here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/"
              className="transition-colors"
              style={{ color: colors.primary }}
            >
              Contact Support
            </Link>
            <Link
              href="/privacy-policy"
              className="transition-colors"
              style={{ color: colors.muted }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="transition-colors"
              style={{ color: colors.muted }}
            >
              Terms of Service
            </Link>
            <Link
              href="/faq"
              className="transition-colors"
              style={{ color: colors.muted }}
            >
              FAQ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
