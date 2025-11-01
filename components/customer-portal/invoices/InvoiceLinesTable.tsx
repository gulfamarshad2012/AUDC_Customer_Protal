"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { colors } from "@/config/color-scheme";

interface InvoiceLine {
  invoice_line_id: string;
  invoice_id: string;
  product_id?: string;
  product_name?: string;
  tenant_id?: string;
  tenant_name?: string;
  quantity?: number;
  currency: string;
  line_number?: number;
  line_subtotal?: number;
  line_discount?: number;
  line_tax?: number;
  line_total?: number;
  created_at: string;
}

interface InvoiceLinesTableProps {
  invoiceHeaderId: string;
  onEdit: (line: InvoiceLine) => void;
  onAdd: () => void;
  onBack: () => void;
  refresh: boolean;
}

export function InvoiceLinesTable({
  invoiceHeaderId,
  onEdit,
  onAdd,
  onBack,
  refresh,
}: InvoiceLinesTableProps) {
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [invoiceHeader, setInvoiceHeader] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!invoiceHeaderId) return;
    fetchInvoiceHeader();
    fetchInvoiceLines();
  }, [refresh, invoiceHeaderId]);

  const fetchInvoiceHeader = async () => {
    try {
      const { data, error } = await supabase
        .schema("customer_portal")
        .from("invoice_headers")
        .select("*, account:accounts(company_name)")
        .eq("invoice_id", invoiceHeaderId)
        .single();

      if (error) throw error;
      setInvoiceHeader(data);
    } catch (error: any) {
      toast.error("Error fetching invoice header: " + error.message);
    }
  };

  const fetchInvoiceLines = async () => {
    try {
      const { data, error } = await supabase
        .schema("customer_portal")
        .from("invoice_lines")
        .select("*")
        .eq("invoice_id", invoiceHeaderId)
        .order("line_number", { ascending: true });

      if (error) throw error;

      // fetch product and tenant names
      const productIds = data.map((d) => d.product_id).filter(Boolean);
      const tenantIds = data.map((d) => d.tenant_id).filter(Boolean);

      const { data: products } = await supabase
        .schema("shared")
        .from("products")
        .select("product_id, product_name")
        .in("product_id", productIds);

      const { data: tenants } = await supabase
        .schema("shared")
        .from("tenants")
        .select("id, name")
        .in("id", tenantIds);

      const linesWithNames = data.map((line) => ({
        ...line,
        product_name: products?.find((p) => p.product_id === line.product_id)?.product_name,
        tenant_name: tenants?.find((t) => t.id === line.tenant_id)?.name,
      }));

      setLines(linesWithNames);
    } catch (error: any) {
      toast.error("Error fetching invoice lines: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice line?")) return;

    try {
      const { error } = await supabase
        .schema("customer_portal")
        .from("invoice_lines")
        .delete()
        .eq("invoice_line_id", id);

      if (error) throw error;
      toast.success("Invoice line deleted successfully");
      fetchInvoiceLines();
    } catch (error: any) {
      toast.error("Error deleting invoice line: " + error.message);
    }
  };

  return (
    <div 
      className="p-6 space-y-6"
      style={{ backgroundColor: colors.card }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="flex items-center gap-2"
            style={{ 
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.onCard,
              border: `1px solid ${colors.border}`,
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Invoices
          </Button>
          <div>
            <h1 
              className="text-2xl font-bold"
              style={{ color: colors.onCard }}
            >
              Invoice Lines
            </h1>
            {invoiceHeader && (
              <p 
                className="text-sm"
                style={{ color: colors.muted }}
              >
                Invoice ID: {invoiceHeader.invoice_id.substring(0, 8)}... —{" "}
                {invoiceHeader.account?.company_name}
              </p>
            )}
          </div>
        </div>
        <Button 
          onClick={onAdd} 
          className="flex items-center gap-2"
          style={{ 
            backgroundColor: colors.primary,
            color: colors.onPrimary
          }}
        >
          <Plus className="h-4 w-4" /> Add Line Item
        </Button>
      </div>

      <Table>
        <TableCaption style={{ color: colors.muted }}>
          A list of all invoice line items.
        </TableCaption>
        <TableHeader>
          <TableRow style={{ backgroundColor: colors.primaryLight }}>
            <TableHead style={{ color: colors.onPrimaryLight }}>Line #</TableHead>
            <TableHead style={{ color: colors.onPrimaryLight }}>Product</TableHead>
            <TableHead style={{ color: colors.onPrimaryLight }}>Tenant</TableHead>
            <TableHead style={{ color: colors.onPrimaryLight }}>Quantity</TableHead>
            <TableHead style={{ color: colors.onPrimaryLight }}>Subtotal</TableHead>
            <TableHead style={{ color: colors.onPrimaryLight }}>Discount</TableHead>
            <TableHead style={{ color: colors.onPrimaryLight }}>Tax</TableHead>
            <TableHead style={{ color: colors.onPrimaryLight }}>Total</TableHead>
            <TableHead style={{ color: colors.onPrimaryLight }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line, index) => (
            <TableRow 
              key={line.invoice_line_id}
              style={{ 
                backgroundColor: index % 2 === 0 ? colors.card : colors.surface,
                color: colors.onCard
              }}
            >
              <TableCell>{line.line_number || "N/A"}</TableCell>
              <TableCell>{line.product_name || "N/A"}</TableCell>
              <TableCell>{line.tenant_name || "N/A"}</TableCell>
              <TableCell>{line.quantity || 0}</TableCell>
              <TableCell>
                <Badge 
                  variant="secondary"
                  style={{ 
                    backgroundColor: colors.surface,
                    color: colors.onCard,
                    borderColor: colors.border,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {line.currency} {line.line_subtotal?.toFixed(2) || "0.00"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline"
                  style={{ 
                    backgroundColor: colors.surface,
                    color: colors.onCard,
                    borderColor: colors.border,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {line.currency} {line.line_discount?.toFixed(2) || "0.00"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline"
                  style={{ 
                    backgroundColor: colors.surface,
                    color: colors.onCard,
                    borderColor: colors.border,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {line.currency} {line.line_tax?.toFixed(2) || "0.00"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  style={{ 
                    backgroundColor: colors.primaryLight,
                    color: colors.onPrimaryLight
                  }}
                >
                  {line.currency} {line.line_total?.toFixed(2) || "0.00"}
                </Badge>
              </TableCell>
              <TableCell className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(line)}
                  style={{ 
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.onCard,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(line.invoice_line_id)}
                  style={{ 
                    backgroundColor: colors.surface,
                    borderColor: colors.error,
                    color: colors.error,
                    border: `1px solid ${colors.error}`,
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {lines.length === 0 && (
        <div 
          className="text-center py-6"
          style={{ color: colors.muted }}
        >
          No invoice lines found. Click "Add Line Item" to create your first line item.
        </div>
      )}

      {lines.length > 0 && (
        <div className="flex justify-end">
          <span 
            className="text-sm font-medium"
            style={{ color: colors.onCard }}
          >
            Total: {invoiceHeader?.currency || "USD"}{" "}
            {lines.reduce((sum, line) => sum + (line.line_total || 0), 0).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}