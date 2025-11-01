"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Lock,
  Shield,
  CheckCircle,
  Apple,
  Chrome,
  Wallet,
  Calendar,
  User,
  Phone,
  Mail,
  Building,
  Globe,
  Info,
  X,
  IdCardIcon,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { colors } from "@/config/color-scheme";

const PaymentMethodPage = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [billingAddress, setBillingAddress] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [activeTab, setActiveTab] = useState("payment");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [transactionId, setTransactionId] = useState("");
  const [processingStage, setProcessingStage] = useState("");
  
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const expiryDateRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Secure payment with Visa, Mastercard, or Amex",
      secure: true,
      popular: true,
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: Wallet,
      description: "Pay safely with your PayPal account",
      secure: true,
    },
    {
      id: "apple",
      name: "Apple Pay",
      icon: Apple,
      description: "Quick and secure with Touch ID or Face ID",
      secure: true,
    },
    {
      id: "google",
      name: "Google Pay",
      icon: Chrome,
      description: "Fast checkout with your Google account",
      secure: true,
    },
  ];

  const countries = [
    { code: "US", name: "United States" },
    { code: "CA", name: "Canada" },
    { code: "GB", name: "United Kingdom" },
    { code: "AU", name: "Australia" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "JP", name: "Japan" },
    { code: "SG", name: "Singapore" },
  ];

  const securityFeatures = [
    {
      title: "256-bit SSL Encryption",
      description: "All data is encrypted using industry-standard SSL technology",
      icon: Lock,
    },
    {
      title: "PCI DSS Compliant",
      description: "We adhere to the highest security standards for payment processing",
      icon: Shield,
    },
    {
      title: "Secure Tokenization",
      description: "Card details are replaced with secure tokens for storage",
      icon: CreditCard,
    },
    {
      title: "Fraud Protection",
      description: "Advanced algorithms detect and prevent fraudulent transactions",
      icon: AlertCircle,
    },
  ];

  const formatCardNumber = (value: string) => {
    return (
      value
        .replace(/\s/g, "")
        .replace(/[^0-9]/gi, "")
        .match(/.{1,4}/g)
        ?.join(" ") || value
    );
  };

  const formatExpiryDate = (value: string) => {
    return value
      .replace(/\s/g, "")
      .replace(/[^0-9]/gi, "")
      .replace(/^([2-9])$/g, "0$1")
      .replace(/^(1[0-2]|0[1-9])([0-9]{2})$/g, "$1/$2")
      .substring(0, 5);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (selectedPaymentMethod === "card") {
      if (!cardName.trim()) newErrors.cardName = "Cardholder name is required";
      if (cardNumber.replace(/\s/g, "").length < 13) newErrors.cardNumber = "Invalid card number";
      if (expiryDate.length !== 5) newErrors.expiryDate = "Invalid expiry date";
      if (cvv.length < 3) newErrors.cvv = "Invalid CVV";
    }
    
    if (!billingAddress.name) newErrors.name = "Name is required";
    if (!billingAddress.email) newErrors.email = "Email is required";
    if (!billingAddress.address) newErrors.address = "Address is required";
    if (!billingAddress.city) newErrors.city = "City is required";
    if (!billingAddress.zip) newErrors.zip = "ZIP code is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    
    setIsProcessing(true);
    setProcessingStage("Initializing secure connection...");
    
    // Simulate security verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProcessingStage("Verifying payment details...");
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProcessingStage("Encrypting data...");
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProcessingStage("Processing payment...");
    
    // Generate transaction ID
    setTransactionId(`TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsProcessing(false);
    setPaymentSuccess(true);
    setShowConfirmation(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setBillingAddress(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const getCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, "");
    if (cleaned.startsWith("4")) return "visa";
    if (cleaned.startsWith("5") || cleaned.startsWith("2")) return "mastercard";
    if (cleaned.startsWith("3")) return "amex";
    if (cleaned.startsWith("6")) return "discover";
    return "";
  };

  const isCardValid =
    cardNumber.replace(/\s/g, "").length >= 13 &&
    expiryDate.length === 5 &&
    cvv.length >= 3 &&
    cardName.trim().length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, nextRef?: React.RefObject<HTMLInputElement>) => {
    if (e.key === "Enter" && nextRef?.current) {
      nextRef.current.focus();
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 1) setActiveTab("billing");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 2) setActiveTab("payment");
    }
  };

  useEffect(() => {
    if (cardNumber.replace(/\s/g, "").length === 16) {
      expiryDateRef.current?.focus();
    }
  }, [cardNumber]);

  useEffect(() => {
    if (expiryDate.length === 5) {
      cvvRef.current?.focus();
    }
  }, [expiryDate]);

  return (
    <div 
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ color: colors.onCard }}
          >
            Secure Checkout
          </h1>
          <p 
            className="text-xl"
            style={{ color: colors.muted }}
          >
            Complete your purchase with our secure payment system
          </p>
          
          {/* Security Badge */}
          <div className="flex justify-center mt-6">
            <div 
              className="inline-flex items-center px-4 py-2 rounded-full"
              style={{ 
                backgroundColor: `${colors.success}10`,
                border: `1px solid ${colors.success}`,
              }}
            >
              <Shield className="w-5 h-5 mr-2" style={{ color: colors.success }} />
              <span className="font-medium" style={{ color: colors.success }}>
                SSL Secured & PCI Compliant
              </span>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { id: 1, label: "Information" },
              { id: 2, label: "Payment" },
              { id: 3, label: "Confirmation" }
            ].map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                    currentStep >= step.id ? "bg-blue-500" : "bg-gray-200"
                  }`}
                  style={{
                    backgroundColor: currentStep >= step.id ? colors.primary : colors.surface,
                    border: currentStep >= step.id ? `2px solid ${colors.primary}` : `2px solid ${colors.border}`,
                    color: currentStep >= step.id ? colors.onPrimary : colors.muted,
                  }}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="font-semibold">{step.id}</span>
                  )}
                </div>
                <span 
                  className={`text-base font-medium transition-colors duration-300 ${
                    currentStep >= step.id ? "text-blue-600" : "text-gray-500"
                  }`}
                  style={{
                    color: currentStep >= step.id ? colors.primary : colors.muted,
                  }}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-4">
            <div className="absolute top-0 left-0 h-2 bg-gray-200 w-full rounded-full"></div>
            <div 
              className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full transition-all duration-500"
              style={{ 
                width: `${((currentStep - 1) / 2) * 100}%`,
                backgroundColor: colors.primary,
              }}
            ></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card 
              className="shadow-lg border-0 overflow-hidden"
              style={{ 
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
              }}
            >
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList 
                    className="grid w-full grid-cols-2 rounded-none border-b"
                    style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  >
                    <TabsTrigger 
                      value="payment"
                      className="rounded-none data-[state=active]:border-b-2 py-4 text-base"
                      style={{
                        color: activeTab === "payment" ? colors.primary : colors.muted,
                        borderColor: activeTab === "payment" ? colors.primary : "transparent",
                      }}
                    >
                      Payment Method
                    </TabsTrigger>
                    <TabsTrigger 
                      value="billing"
                      className="rounded-none data-[state=active]:border-b-2 py-4 text-base"
                      style={{
                        color: activeTab === "billing" ? colors.primary : colors.muted,
                        borderColor: activeTab === "billing" ? colors.primary : "transparent",
                      }}
                    >
                      Billing Information
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="payment" className="space-y-6 p-6">
                    {/* Payment Methods */}
                    <div>
                      <h3 
                        className="text-xl font-semibold mb-4"
                        style={{ color: colors.onCard }}
                      >
                        Select Payment Method
                      </h3>
                      <RadioGroup
                        value={selectedPaymentMethod}
                        onValueChange={setSelectedPaymentMethod}
                      >
                        {paymentMethods.map((method) => (
                          <div key={method.id} className="relative mb-4">
                            <RadioGroupItem
                              value={method.id}
                              id={method.id}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={method.id}
                              className={cn(
                                "flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200",
                                "hover:border-blue-200",
                                "peer-checked:border-blue-500",
                                "border-gray-200"
                              )}
                              style={{
                                backgroundColor: selectedPaymentMethod === method.id ? `${colors.primary}10` : "transparent",
                                borderColor: selectedPaymentMethod === method.id ? colors.primary : colors.border,
                                boxShadow: selectedPaymentMethod === method.id ? `0 0 0 3px ${colors.primary}20` : "none",
                              }}
                            >
                              <div className="flex-shrink-0">
                                <method.icon 
                                  className="w-6 h-6" 
                                  style={{ 
                                    color: selectedPaymentMethod === method.id ? colors.primary : colors.muted 
                                  }} 
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="font-semibold"
                                    style={{ color: colors.onCard }}
                                  >
                                    {method.name}
                                  </div>
                                  {method.popular && (
                                    <Badge 
                                      className="text-xs px-2 py-1"
                                      style={{ 
                                        backgroundColor: colors.primary,
                                        color: colors.onPrimary,
                                      }}
                                    >
                                      Most Popular
                                    </Badge>
                                  )}
                                </div>
                                <div 
                                  className="text-sm mt-1"
                                  style={{ color: colors.muted }}
                                >
                                  {method.description}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {method.secure && (
                                  <Shield className="w-5 h-5" style={{ color: colors.success }} />
                                )}
                                <div className="flex-shrink-0">
                                  <div
                                    className={cn(
                                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                      "border-gray-300 peer-checked:border-blue-500"
                                    )}
                                    style={{ borderColor: colors.border }}
                                  >
                                    <div
                                      className={cn(
                                        "w-3 h-3 rounded-full transition-opacity",
                                        selectedPaymentMethod === method.id ? "opacity-100" : "opacity-0"
                                      )}
                                      style={{ backgroundColor: colors.primary }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Card Details */}
                    {selectedPaymentMethod === "card" && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 
                            className="text-xl font-semibold"
                            style={{ color: colors.onCard }}
                          >
                            Card Details
                          </h3>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label 
                              htmlFor="cardName"
                              style={{ color: colors.onCard }}
                            >
                              Cardholder Name
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.muted }} />
                              <Input
                                id="cardName"
                                placeholder="John Doe"
                                value={cardName}
                                onChange={(e) => {
                                  setCardName(e.target.value);
                                  if (errors.cardName) setErrors(prev => ({ ...prev, cardName: "" }));
                                }}
                                className="h-12 pl-10"
                                style={{ 
                                  backgroundColor: colors.surface,
                                  borderColor: errors.cardName ? colors.error : colors.border,
                                  color: colors.onCard,
                                  border: `1px solid ${errors.cardName ? colors.error : colors.border}`,
                                }}
                              />
                            </div>
                            {errors.cardName && (
                              <p className="text-sm flex items-center" style={{ color: colors.error }}>
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.cardName}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label 
                              htmlFor="cardNumber"
                              style={{ color: colors.onCard }}
                            >
                              Card Number
                            </Label>
                            <div className="relative">
                              <IdCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.muted }} />
                              <Input
                                id="cardNumber"
                                ref={cardNumberRef}
                                placeholder="1234 5678 9012 3456"
                                value={cardNumber}
                                onChange={(e) => {
                                  setCardNumber(formatCardNumber(e.target.value));
                                  if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: "" }));
                                }}
                                maxLength={19}
                                className="h-12 pl-10"
                                style={{ 
                                  backgroundColor: colors.surface,
                                  borderColor: errors.cardNumber ? colors.error : colors.border,
                                  color: colors.onCard,
                                  border: `1px solid ${errors.cardNumber ? colors.error : colors.border}`,
                                }}
                                onKeyDown={(e) => handleKeyDown(e, expiryDateRef)}
                              />
                              {getCardType(cardNumber) && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                  {getCardType(cardNumber) === "visa" && (
                                    <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                                  )}
                                  {getCardType(cardNumber) === "mastercard" && (
                                    <div className="w-8 h-5 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">MC</div>
                                  )}
                                  {getCardType(cardNumber) === "amex" && (
                                    <div className="w-8 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">AMEX</div>
                                  )}
                                </div>
                              )}
                            </div>
                            {errors.cardNumber && (
                              <p className="text-sm flex items-center" style={{ color: colors.error }}>
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.cardNumber}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label 
                                htmlFor="expiryDate"
                                style={{ color: colors.onCard }}
                              >
                                Expiry Date
                              </Label>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.muted }} />
                                <Input
                                  id="expiryDate"
                                  ref={expiryDateRef}
                                  placeholder="MM/YY"
                                  value={expiryDate}
                                  onChange={(e) => {
                                    setExpiryDate(formatExpiryDate(e.target.value));
                                    if (errors.expiryDate) setErrors(prev => ({ ...prev, expiryDate: "" }));
                                  }}
                                  maxLength={5}
                                  className="h-12 pl-10"
                                  style={{ 
                                    backgroundColor: colors.surface,
                                    borderColor: errors.expiryDate ? colors.error : colors.border,
                                    color: colors.onCard,
                                    border: `1px solid ${errors.expiryDate ? colors.error : colors.border}`,
                                  }}
                                  onKeyDown={(e) => handleKeyDown(e, cvvRef)}
                                />
                              </div>
                              {errors.expiryDate && (
                                <p className="text-sm flex items-center" style={{ color: colors.error }}>
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  {errors.expiryDate}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label 
                                htmlFor="cvv"
                                style={{ color: colors.onCard }}
                              >
                                CVV
                              </Label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.muted }} />
                                <Input
                                  id="cvv"
                                  ref={cvvRef}
                                  type={showCvv ? "text" : "password"}
                                  placeholder="123"
                                  value={cvv}
                                  onChange={(e) => {
                                    setCvv(e.target.value.replace(/[^0-9]/g, ""));
                                    if (errors.cvv) setErrors(prev => ({ ...prev, cvv: "" }));
                                  }}
                                  maxLength={4}
                                  className="h-12 pl-10 pr-10"
                                  style={{ 
                                    backgroundColor: colors.surface,
                                    borderColor: errors.cvv ? colors.error : colors.border,
                                    color: colors.onCard,
                                    border: `1px solid ${errors.cvv ? colors.error : colors.border}`,
                                  }}
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                  onClick={() => setShowCvv(!showCvv)}
                                  style={{ color: colors.muted }}
                                >
                                  {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                              {errors.cvv && (
                                <p className="text-sm flex items-center" style={{ color: colors.error }}>
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  {errors.cvv}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Save Card Option */}
                          <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                              id="saveCard"
                              checked={saveCard}
                              onCheckedChange={(checked) => setSaveCard(checked as boolean)}
                              style={{ 
                                backgroundColor: saveCard ? colors.primary : "transparent",
                                borderColor: colors.border,
                              }}
                            />
                            <Label 
                              htmlFor="saveCard"
                              className="text-sm"
                              style={{ color: colors.onCard }}
                            >
                              Save card for future purchases
                            </Label>
                            <Info className="w-4 h-4" style={{ color: colors.muted }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="billing" className="space-y-6 p-6">
                    <div>
                      <h3 
                        className="text-xl font-semibold mb-4"
                        style={{ color: colors.onCard }}
                      >
                        Billing Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label 
                            htmlFor="name"
                            style={{ color: colors.onCard }}
                          >
                            Full Name *
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.muted }} />
                            <Input
                              id="name"
                              placeholder="John Doe"
                              value={billingAddress.name}
                              onChange={(e) => handleInputChange("name", e.target.value)}
                              className="h-12 pl-10"
                              style={{ 
                                backgroundColor: colors.surface,
                                borderColor: errors.name ? colors.error : colors.border,
                                color: colors.onCard,
                                border: `1px solid ${errors.name ? colors.error : colors.border}`,
                              }}
                            />
                          </div>
                          {errors.name && (
                            <p className="text-sm flex items-center" style={{ color: colors.error }}>
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label 
                            htmlFor="email"
                            style={{ color: colors.onCard }}
                          >
                            Email Address *
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.muted }} />
                            <Input
                              id="email"
                              type="email"
                              placeholder="john@example.com"
                              value={billingAddress.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              className="h-12 pl-10"
                              style={{ 
                                backgroundColor: colors.surface,
                                borderColor: errors.email ? colors.error : colors.border,
                                color: colors.onCard,
                                border: `1px solid ${errors.email ? colors.error : colors.border}`,
                              }}
                            />
                          </div>
                          {errors.email && (
                            <p className="text-sm flex items-center" style={{ color: colors.error }}>
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label 
                            htmlFor="phone"
                            style={{ color: colors.onCard }}
                          >
                            Phone Number
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.muted }} />
                            <Input
                              id="phone"
                              placeholder="+1 (555) 123-4567"
                              value={billingAddress.phone}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                              className="h-12 pl-10"
                              style={{ 
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                color: colors.onCard,
                                border: `1px solid ${colors.border}`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label 
                            htmlFor="country"
                            style={{ color: colors.onCard }}
                          >
                            Country *
                          </Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.muted }} />
                            <select
                              id="country"
                              value={billingAddress.country}
                              onChange={(e) => handleInputChange("country", e.target.value)}
                              className="h-12 pl-10 w-full rounded-md"
                              style={{ 
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                color: colors.onCard,
                                border: `1px solid ${colors.border}`,
                              }}
                            >
                              {countries.map((country) => (
                                <option key={country.code} value={country.code}>
                                  {country.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mt-4">
                        <Label 
                          htmlFor="address"
                          style={{ color: colors.onCard }}
                        >
                          Street Address *
                        </Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.muted }} />
                          <Input
                            id="address"
                            placeholder="123 Main Street"
                            value={billingAddress.address}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            className="h-12 pl-10"
                            style={{ 
                              backgroundColor: colors.surface,
                              borderColor: errors.address ? colors.error : colors.border,
                              color: colors.onCard,
                              border: `1px solid ${errors.address ? colors.error : colors.border}`,
                            }}
                          />
                        </div>
                        {errors.address && (
                          <p className="text-sm flex items-center" style={{ color: colors.error }}>
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.address}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label 
                            htmlFor="city"
                            style={{ color: colors.onCard }}
                          >
                            City *
                          </Label>
                          <Input
                            id="city"
                            placeholder="New York"
                            value={billingAddress.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            className="h-12"
                            style={{ 
                              backgroundColor: colors.surface,
                              borderColor: errors.city ? colors.error : colors.border,
                              color: colors.onCard,
                              border: `1px solid ${errors.city ? colors.error : colors.border}`,
                            }}
                          />
                          {errors.city && (
                            <p className="text-sm flex items-center" style={{ color: colors.error }}>
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.city}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label 
                            htmlFor="state"
                            style={{ color: colors.onCard }}
                          >
                            State/Province
                          </Label>
                          <Input
                            id="state"
                            placeholder="NY"
                            value={billingAddress.state}
                            onChange={(e) => handleInputChange("state", e.target.value)}
                            className="h-12"
                            style={{ 
                              backgroundColor: colors.surface,
                              borderColor: colors.border,
                              color: colors.onCard,
                              border: `1px solid ${colors.border}`,
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label 
                            htmlFor="zip"
                            style={{ color: colors.onCard }}
                          >
                            ZIP/Postal Code *
                          </Label>
                          <Input
                            id="zip"
                            placeholder="10001"
                            value={billingAddress.zip}
                            onChange={(e) => handleInputChange("zip", e.target.value)}
                            className="h-12"
                            style={{ 
                              backgroundColor: colors.surface,
                              borderColor: errors.zip ? colors.error : colors.border,
                              color: colors.onCard,
                              border: `1px solid ${errors.zip ? colors.error : colors.border}`,
                            }}
                          />
                          {errors.zip && (
                            <p className="text-sm flex items-center" style={{ color: colors.error }}>
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.zip}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card 
              className="shadow-lg border-0 mt-6"
              style={{ 
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
              }}
            >
              <CardHeader className="pb-4">
                <CardTitle 
                  className="text-xl font-semibold"
                  style={{ color: colors.onCard }}
                >
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span style={{ color: colors.muted }}>Premium Plan (Annual)</span>
                    <span style={{ color: colors.onCard }} className="font-medium">$299.99</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: colors.muted }}>Tax</span>
                    <span style={{ color: colors.onCard }} className="font-medium">$23.99</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: colors.muted }}>Discount</span>
                    <span style={{ color: colors.success }} className="font-medium">-$30.00</span>
                  </div>
                  <Separator style={{ backgroundColor: colors.border }} />
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span style={{ color: colors.onCard }}>Total</span>
                    <span style={{ color: colors.primary }}>$293.98</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex-1 h-12"
                    style={{ 
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.onCard,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={currentStep === 2 ? handlePayment : nextStep}
                    disabled={isProcessing}
                    className="flex-1 h-12 font-semibold"
                    style={{ 
                      backgroundColor: colors.primary,
                      color: colors.onPrimary
                    }}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {processingStage}
                      </div>
                    ) : currentStep === 2 ? (
                      `Pay $293.98`
                    ) : (
                      <>
                        Continue
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                <p 
                  className="text-sm text-center mt-4"
                  style={{ color: colors.muted }}
                >
                  By completing this purchase, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security Features */}
            <Card 
              className="shadow-lg border-0"
              style={{ 
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
              }}
            >
              <CardHeader className="pb-4">
                <CardTitle 
                  className="text-lg font-semibold flex items-center gap-2"
                  style={{ color: colors.onCard }}
                >
                  <Shield className="w-5 h-5" style={{ color: colors.primary }} />
                  Security Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <feature.icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: colors.primary }} />
                    <div>
                      <div 
                        className="font-medium"
                        style={{ color: colors.onCard }}
                      >
                        {feature.title}
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: colors.muted }}
                      >
                        {feature.description}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Accepted Cards */}
            <Card 
              className="shadow-lg border-0"
              style={{ 
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
              }}
            >
              <CardHeader className="pb-4">
                <CardTitle 
                  className="text-lg font-semibold"
                  style={{ color: colors.onCard }}
                >
                  Accepted Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: colors.surface }}>
                    <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                    <span className="text-sm" style={{ color: colors.onCard }}>Visa</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: colors.surface }}>
                    <div className="w-8 h-5 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">MC</div>
                    <span className="text-sm" style={{ color: colors.onCard }}>Mastercard</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: colors.surface }}>
                    <div className="w-8 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">AMEX</div>
                    <span className="text-sm" style={{ color: colors.onCard }}>Amex</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: colors.surface }}>
                    <div className="w-8 h-5 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">PP</div>
                    <span className="text-sm" style={{ color: colors.onCard }}>PayPal</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card 
              className="shadow-lg border-0"
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.primaryDark}10 100%)`,
                border: `1px solid ${colors.primary}30`,
              }}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <div 
                    className="text-xl font-bold mb-2"
                    style={{ color: colors.onCard }}
                  >
                    Need Help?
                  </div>
                  <p 
                    className="mb-4"
                    style={{ color: colors.muted }}
                  >
                    Our support team is available 24/7
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    style={{ 
                      backgroundColor: colors.surface,
                      borderColor: colors.primary,
                      color: colors.primary,
                      border: `1px solid ${colors.primary}`,
                    }}
                  >
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card 
            className="w-full max-w-md shadow-xl"
            style={{ 
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
            }}
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle 
                  className="text-xl font-semibold"
                  style={{ color: colors.onCard }}
                >
                  {paymentSuccess ? "Payment Successful!" : "Payment Failed"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmation(false)}
                  style={{ color: colors.muted }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  paymentSuccess ? "bg-green-100" : "bg-red-100"
                }`}>
                  {paymentSuccess ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: colors.onCard }}
                >
                  {paymentSuccess ? "Thank You for Your Purchase!" : "Payment Failed"}
                </h3>
                <p style={{ color: colors.muted }}>
                  {paymentSuccess 
                    ? "Your payment of $293.98 has been successfully processed. A confirmation email has been sent to " + billingAddress.email + "."
                    : "We couldn't process your payment. Please check your details and try again."
                  }
                </p>
              </div>
              
              {paymentSuccess && (
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: colors.border }}>
                    <span style={{ color: colors.muted }}>Transaction ID:</span>
                    <span style={{ color: colors.onCard }}>{transactionId}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: colors.border }}>
                    <span style={{ color: colors.muted }}>Payment Method:</span>
                    <span style={{ color: colors.onCard }}>
                      {selectedPaymentMethod === "card" ? "Credit Card" : selectedPaymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span style={{ color: colors.muted }}>Date:</span>
                    <span style={{ color: colors.onCard }}>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12"
                  onClick={() => setShowConfirmation(false)}
                  style={{ 
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.onCard,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {paymentSuccess ? "Close" : "Try Again"}
                </Button>
                {paymentSuccess && (
                  <Button 
                    className="flex-1 h-12"
                    onClick={() => {
                      setShowConfirmation(false);
                      // Reset form
                      setCardNumber("");
                      setExpiryDate("");
                      setCvv("");
                      setCardName("");
                      setBillingAddress({
                        name: "",
                        email: "",
                        phone: "",
                        address: "",
                        city: "",
                        state: "",
                        zip: "",
                        country: "US",
                      });
                      setCurrentStep(1);
                      setActiveTab("payment");
                    }}
                    style={{ 
                      backgroundColor: colors.primary,
                      color: colors.onPrimary
                    }}
                  >
                    Make Another Payment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodPage;