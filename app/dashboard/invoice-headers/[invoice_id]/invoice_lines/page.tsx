"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Package, Building } from "lucide-react";
import { colors } from "@/config/color-scheme";

interface InvoiceHeader {
  invoice_id: string;
  account_id: string | null;
  billing_cycle: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  currency: string | null;
  failed_payment_count: number | null;
  subtotal_amount: number | null;
  discount_amount: number | null;
  total_amount: number | null;
  tax_amount: number | null;
  created_by: string | null;
  created_at: string;
}

interface InvoiceLine {
  invoice_line_id: string;
  invoice_id: string | null;
  product_id: string | null;
  tenant_id: string | null;
  quantity: number | null;
  currency: string | null;
  line_number: number | null;
  line_subtotal: number | null;
  line_discount: number | null;
  line_tax: number | null;
  line_total: number | null;
  created_by: string | null;
  created_at: string;
  modified_at: string | null;
  modified_by: string | null;
  product?: {
    product_id: string;
    product_name: string;
    plan_name: string;
    monthly_price: number;
    annual_price: number;
    currency: string;
  };
  tenant?: {
    id: string;
    name: string;
    domain: string | null;
  };
}

export default function InvoiceDetailsPage() {
  const router = useRouter();
  const { invoice_id } = useParams<{ invoice_id: string }>();
  const [invoice, setInvoice] = useState<InvoiceHeader | null>(null);
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [invoice_id]);

  const fetchInvoiceDetails = async () => {
    console.log("invoice_id param:", invoice_id);

    try {
      setLoading(true);

      // Fetch invoice header
      const { data: invoiceData, error: invoiceError } = await supabase
        .schema("customer_portal")
        .from("invoice_headers")
        .select("*")
        .eq("invoice_id", invoice_id)
        .single();

      if (invoiceError) throw invoiceError;
      setInvoice(invoiceData);

      // Fetch invoice lines
      const { data: linesData, error: linesError } = await supabase
        .schema("customer_portal")
        .from("invoice_lines")
        .select("*")
        .eq("invoice_id", invoice_id)
        .order("line_number", { ascending: true });

      if (linesError) throw linesError;

      // Get unique product IDs and tenant IDs using Array.from() instead of spreading
      const productIds = Array.from(
        new Set(linesData.map((line) => line.product_id).filter(Boolean))
      );
      const tenantIds = Array.from(
        new Set(linesData.map((line) => line.tenant_id).filter(Boolean))
      );

      // Fetch products from shared schema
      const { data: productsData, error: productsError } =
        productIds.length > 0
          ? await supabase
              .schema("shared")
              .from("products")
              .select(
                "product_id, product_name, plan_name, monthly_price, annual_price, currency"
              )
              .in("product_id", productIds)
          : { data: [], error: null };

      if (productsError) throw productsError;

      // Fetch tenants from shared schema
      const { data: tenantsData, error: tenantsError } =
        tenantIds.length > 0
          ? await supabase
              .schema("shared")
              .from("tenants")
              .select("id, name, domain")
              .in("id", tenantIds)
          : { data: [], error: null };

      if (tenantsError) throw tenantsError;

      // Combine the data
      const combinedLines = linesData.map((line) => ({
        ...line,
        product: productsData?.find((p) => p.product_id === line.product_id),
        tenant: tenantsData?.find((t) => t.id === line.tenant_id),
      }));

      setInvoiceLines(combinedLines);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;

    switch (status.toLowerCase()) {
      case "paid":
        return (
          <Badge
            className="bg-green-100 text-green-800"
            style={{
              backgroundColor: `${colors.success}20`,
              color: colors.success,
            }}
          >
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge
            className="bg-yellow-100 text-yellow-800"
            style={{
              backgroundColor: `${colors.warning}20`,
              color: colors.warning,
            }}
          >
            Pending
          </Badge>
        );
      case "overdue":
        return (
          <Badge
            className="bg-red-100 text-red-800"
            style={{
              backgroundColor: `${colors.error}20`,
              color: colors.error,
            }}
          >
            Overdue
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="destructive"
            style={{
              backgroundColor: `${colors.error}20`,
              color: colors.error,
            }}
          >
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            style={{
              backgroundColor: colors.surface,
              color: colors.onCard,
              borderColor: colors.border,
            }}
          >
            {status}
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div
        className="container mx-auto py-10 flex justify-center items-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderColor: colors.primary }}
          ></div>
          <p className="mt-4 text-lg" style={{ color: colors.onBackground }}>
            Loading invoice details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div
        className="container mx-auto py-10"
        style={{ backgroundColor: colors.background }}
      >
        <Card
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 4px 6px -1px ${colors.shadow}`,
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: colors.onCard }}>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ color: colors.error }}>
              {error || "Invoice not found"}
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/dashboard/invoice-headers")}
              style={{
                backgroundColor: colors.primary,
                color: colors.onPrimary,
              }}
            >
              Back to Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="container max-w-full mx-auto py-10"
      style={{ backgroundColor: colors.background }}
    >
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/invoice-headers")}
          className="mb-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.onCard,
            border: `1px solid ${colors.border}`,
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 4px 6px -1px ${colors.shadow}`,
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: colors.onCard }}>
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm" style={{ color: colors.muted }}>
                  Invoice ID
                </p>
                <p className="font-medium" style={{ color: colors.onCard }}>
                  {invoice.invoice_id}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.muted }}>
                  Status
                </p>
                {getStatusBadge(invoice.status)}
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.muted }}>
                  Billing Cycle
                </p>
                <p className="font-medium" style={{ color: colors.onCard }}>
                  {invoice.billing_cycle || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.muted }}>
                  Period
                </p>
                <p className="font-medium" style={{ color: colors.onCard }}>
                  {invoice.start_date && invoice.end_date
                    ? `${formatDate(invoice.start_date)} - ${formatDate(invoice.end_date)}`
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 4px 6px -1px ${colors.shadow}`,
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: colors.onCard }}>
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm" style={{ color: colors.muted }}>
                  Subtotal
                </p>
                <p className="font-medium" style={{ color: colors.onCard }}>
                  {formatCurrency(
                    invoice.subtotal_amount,
                    invoice.currency || "USD"
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.muted }}>
                  Discount
                </p>
                <p className="font-medium" style={{ color: colors.onCard }}>
                  {formatCurrency(
                    invoice.discount_amount,
                    invoice.currency || "USD"
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.muted }}>
                  Tax
                </p>
                <p className="font-medium" style={{ color: colors.onCard }}>
                  {formatCurrency(
                    invoice.tax_amount,
                    invoice.currency || "USD"
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.muted }}>
                  Total
                </p>
                <p
                  className="font-medium text-lg"
                  style={{ color: colors.primary }}
                >
                  {formatCurrency(
                    invoice.total_amount,
                    invoice.currency || "USD"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 4px 6px -1px ${colors.shadow}`,
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: colors.onCard }}>
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm" style={{ color: colors.muted }}>
                  Account ID
                </p>
                <p className="font-medium" style={{ color: colors.onCard }}>
                  {invoice.account_id
                    ? invoice.account_id.substring(0, 8) + "..."
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.muted }}>
                  Failed Payments
                </p>
                <p className="font-medium" style={{ color: colors.onCard }}>
                  {invoice.failed_payment_count || 0}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.muted }}>
                  Created
                </p>
                <p className="font-medium" style={{ color: colors.onCard }}>
                  {formatDate(invoice.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          border: `1px solid ${colors.border}`,
          boxShadow: `0 4px 6px -1px ${colors.shadow}`,
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: colors.onCard }}>Invoice Lines</CardTitle>
          <CardDescription style={{ color: colors.muted }}>
            Detailed breakdown of products and services in this invoice
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoiceLines.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: colors.muted }}>No invoice lines found</p>
            </div>
          ) : (
            <div
              className="rounded-md border overflow-hidden"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Table>
                <TableCaption style={{ color: colors.muted }}>
                  {invoiceLines.length} line items in this invoice
                </TableCaption>
                <TableHeader>
                  <TableRow style={{ backgroundColor: colors.primaryLight }}>
                    <TableHead
                      className="w-[50px]"
                      style={{ color: colors.onPrimaryLight }}
                    >
                      #
                    </TableHead>
                    <TableHead style={{ color: colors.onPrimaryLight }}>
                      Product
                    </TableHead>
                    <TableHead style={{ color: colors.onPrimaryLight }}>
                      Tenant
                    </TableHead>
                    <TableHead
                      className="text-right"
                      style={{ color: colors.onPrimaryLight }}
                    >
                      Quantity
                    </TableHead>
                    <TableHead
                      className="text-right"
                      style={{ color: colors.onPrimaryLight }}
                    >
                      Unit Price
                    </TableHead>
                    <TableHead
                      className="text-right"
                      style={{ color: colors.onPrimaryLight }}
                    >
                      Discount
                    </TableHead>
                    <TableHead
                      className="text-right"
                      style={{ color: colors.onPrimaryLight }}
                    >
                      Tax
                    </TableHead>
                    <TableHead
                      className="text-right"
                      style={{ color: colors.onPrimaryLight }}
                    >
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceLines.map((line, index) => (
                    <TableRow
                      key={line.invoice_line_id}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? colors.card : colors.surface,
                        color: colors.onCard,
                      }}
                    >
                      <TableCell className="font-medium">
                        {line.line_number || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Package
                            className="h-4 w-4 mr-2"
                            style={{ color: colors.muted }}
                          />
                          <div>
                            <p
                              className="font-medium"
                              style={{ color: colors.onCard }}
                            >
                              {line.product?.product_name || "Unknown Product"}
                            </p>
                            <p
                              className="text-sm"
                              style={{ color: colors.muted }}
                            >
                              {line.product?.plan_name || "N/A"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Building
                            className="h-4 w-4 mr-2"
                            style={{ color: colors.muted }}
                          />
                          <div>
                            <p
                              className="font-medium"
                              style={{ color: colors.onCard }}
                            >
                              {line.tenant?.name || "Unknown Tenant"}
                            </p>
                            <p
                              className="text-sm"
                              style={{ color: colors.muted }}
                            >
                              {line.tenant?.domain || "N/A"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell
                        className="text-right"
                        style={{ color: colors.onCard }}
                      >
                        {line.quantity || 0}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        style={{ color: colors.onCard }}
                      >
                        {formatCurrency(
                          line.product?.monthly_price || 0,
                          line.currency || "USD"
                        )}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        style={{ color: colors.onCard }}
                      >
                        {formatCurrency(
                          line.line_discount || 0,
                          line.currency || "USD"
                        )}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        style={{ color: colors.onCard }}
                      >
                        {formatCurrency(
                          line.line_tax || 0,
                          line.currency || "USD"
                        )}
                      </TableCell>
                      <TableCell
                        className="text-right font-medium"
                        style={{ color: colors.primary }}
                      >
                        {formatCurrency(
                          line.line_total || 0,
                          line.currency || "USD"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
