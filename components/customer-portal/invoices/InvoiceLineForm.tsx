"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { colors } from "@/config/color-scheme";

interface InvoiceLineFormProps {
  invoiceHeaderId: string;
  onClose: () => void;
  onSaved: () => void;
  editingLine?: any;
}

export function InvoiceLineForm({
  invoiceHeaderId,
  onClose,
  onSaved,
  editingLine,
}: InvoiceLineFormProps) {
  const [formData, setFormData] = useState({
    product_id: editingLine?.product_id || "",
    tenant_id: editingLine?.tenant_id || "",
    quantity: editingLine?.quantity || 1,
    currency: editingLine?.currency || "USD",
    line_subtotal: editingLine?.line_subtotal || 0,
    line_discount: editingLine?.line_discount || 0,
    line_tax: editingLine?.line_tax || 0,
    line_total: editingLine?.line_total || 0,
  });

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchTenants();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (error: any) {
      console.error("Error getting current user:", error.message);
      toast.error("Error getting current user");
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .schema("shared")
        .from("products")
        .select("product_id, product_name")
        .eq("is_active", true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("Error fetching products: " + error.message);
    }
  };

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .schema("shared")
        .from("tenants")
        .select("id, name")
        .eq("is_active", true);

      if (error) throw error;
      setTenants(data || []);
    } catch (error: any) {
      toast.error("Error fetching tenants: " + error.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" ? (value === "" ? 0 : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = async () => {
    if (!invoiceHeaderId) {
      toast.error("Invoice ID is required");
      return;
    }

    if (!currentUserId) {
      toast.error("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      // Clean data - convert empty strings to null for UUID fields
      const payload = {
        invoice_id: invoiceHeaderId,
        product_id: formData.product_id || null,
        tenant_id: formData.tenant_id || null,
        quantity: formData.quantity || 1,
        currency: formData.currency || "USD",
        line_subtotal: formData.line_subtotal || null,
        line_discount: formData.line_discount || null,
        line_tax: formData.line_tax || null,
        line_total: formData.line_total || null,
        created_by: currentUserId, // Add created_by field
        modified_by: currentUserId, // Add modified_by field
      };

      if (editingLine) {
        // For updates, don't include created_by, only modified_by
        const updatePayload = {
          product_id: formData.product_id || null,
          tenant_id: formData.tenant_id || null,
          quantity: formData.quantity || 1,
          currency: formData.currency || "USD",
          line_subtotal: formData.line_subtotal || null,
          line_discount: formData.line_discount || null,
          line_tax: formData.line_tax || null,
          line_total: formData.line_total || null,
          modified_by: currentUserId,
          modified_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .schema("customer_portal")
          .from("invoice_lines")
          .update(updatePayload)
          .eq("invoice_line_id", editingLine.invoice_line_id);

        if (error) throw error;
        toast.success("Invoice line updated successfully");
      } else {
        const { error } = await supabase
          .schema("customer_portal")
          .from("invoice_lines")
          .insert([payload]);

        if (error) throw error;
        toast.success("Invoice line added successfully");
      }

      onSaved();
      onClose();
    } catch (error: any) {
      toast.error("Error saving invoice line: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4" style={{ backgroundColor: colors.card }}>
      <h2 className="text-xl font-semibold" style={{ color: colors.onCard }}>
        {editingLine ? "Edit Line Item" : "Add Line Item"}
      </h2>

      <div className="space-y-2">
        <Label style={{ color: colors.onCard }}>Product</Label>
        <Select
          value={formData.product_id || ""}
          onValueChange={(val) =>
            setFormData({ ...formData, product_id: val === "none" ? "" : val })
          }
        >
          <SelectTrigger
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.onCard,
              border: `1px solid ${colors.border}`,
            }}
          >
            <SelectValue placeholder="Select Product (Optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {products.map((p) => (
              <SelectItem key={p.product_id} value={p.product_id}>
                {p.product_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label style={{ color: colors.onCard }}>Tenant</Label>
        <Select
          value={formData.tenant_id || ""}
          onValueChange={(val) =>
            setFormData({ ...formData, tenant_id: val === "none" ? "" : val })
          }
        >
          <SelectTrigger
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.onCard,
              border: `1px solid ${colors.border}`,
            }}
          >
            <SelectValue placeholder="Select Tenant (Optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {tenants.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label style={{ color: colors.onCard }}>Quantity</Label>
        <Input
          type="number"
          name="quantity"
          min="1"
          value={formData.quantity || 1}
          onChange={handleChange}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.onCard,
            border: `1px solid ${colors.border}`,
          }}
        />
      </div>

      <div className="space-y-2">
        <Label style={{ color: colors.onCard }}>Currency</Label>
        <Select
          value={formData.currency}
          onValueChange={(val) => setFormData({ ...formData, currency: val })}
        >
          <SelectTrigger
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.onCard,
              border: `1px solid ${colors.border}`,
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="GBP">GBP</SelectItem>
            <SelectItem value="PKR">PKR</SelectItem>
            <SelectItem value="CAD">CAD</SelectItem>
            <SelectItem value="AUD">AUD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label style={{ color: colors.onCard }}>Subtotal</Label>
        <Input
          type="number"
          name="line_subtotal"
          step="0.01"
          min="0"
          value={formData.line_subtotal || ""}
          onChange={handleChange}
          placeholder="0.00"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.onCard,
            border: `1px solid ${colors.border}`,
          }}
        />
      </div>

      <div className="space-y-2">
        <Label style={{ color: colors.onCard }}>Discount</Label>
        <Input
          type="number"
          name="line_discount"
          step="0.01"
          min="0"
          value={formData.line_discount || ""}
          onChange={handleChange}
          placeholder="0.00"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.onCard,
            border: `1px solid ${colors.border}`,
          }}
        />
      </div>

      <div className="space-y-2">
        <Label style={{ color: colors.onCard }}>Tax</Label>
        <Input
          type="number"
          name="line_tax"
          step="0.01"
          min="0"
          value={formData.line_tax || ""}
          onChange={handleChange}
          placeholder="0.00"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.onCard,
            border: `1px solid ${colors.border}`,
          }}
        />
      </div>

      <div className="space-y-2">
        <Label style={{ color: colors.onCard }}>Total</Label>
        <Input
          type="number"
          name="line_total"
          step="0.01"
          min="0"
          value={formData.line_total || ""}
          onChange={handleChange}
          placeholder="0.00"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.onCard,
            border: `1px solid ${colors.border}`,
          }}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          onClick={onClose}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.onCard,
            border: `1px solid ${colors.border}`,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !currentUserId}
          style={{
            backgroundColor: colors.primary,
            color: colors.onPrimary,
          }}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
        {!currentUserId && (
          <p className="text-sm mt-2" style={{ color: colors.error }}>
            Please log in to continue
          </p>
        )}
      </div>
    </div>
  );
}
