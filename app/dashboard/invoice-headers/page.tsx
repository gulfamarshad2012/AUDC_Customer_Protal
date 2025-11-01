"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
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

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .schema("customer_portal")
        .from("invoice_headers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      searchTerm === "" ||
      invoice.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.account_id &&
        invoice.account_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInvoices.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;

    switch (status.toLowerCase()) {
      case "paid":
        return (
          <Badge 
            className="bg-green-100 text-green-800"
            style={{ 
              backgroundColor: `${colors.success}20`,
              color: colors.success
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
              color: colors.warning
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
              color: colors.error
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
              color: colors.error
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
              borderColor: colors.border
            }}
          >
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="container max-w-full w-full mx-auto py-10" style={{ backgroundColor: colors.background }}>
      <Card 
        className="w-full"
        style={{ 
          backgroundColor: colors.card,
          borderColor: colors.border,
          border: `1px solid ${colors.border}`,
          boxShadow: `0 4px 6px -1px ${colors.shadow}`,
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: colors.onCard }}>Invoice Headers</CardTitle>
          <CardDescription style={{ color: colors.muted }}>
            Manage and view all invoice headers in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Input
                placeholder="Search by ID or account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64"
                style={{ 
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.onCard,
                  border: `1px solid ${colors.border}`,
                }}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger 
                  className="w-full md:w-40"
                  style={{ 
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.onCard,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={fetchInvoices} 
              disabled={loading}
              style={{ 
                backgroundColor: colors.primary,
                color: colors.onPrimary
              }}
            >
              {loading ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>

          {error && (
            <div 
              className="p-4 rounded-md mb-6"
              style={{ 
                backgroundColor: `${colors.error}20`,
                color: colors.error,
                border: `1px solid ${colors.error}`
              }}
            >
              Error: {error}
            </div>
          )}

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
                {filteredInvoices.length === 0
                  ? "No invoices found"
                  : `Showing ${currentItems.length} of ${filteredInvoices.length} invoices`}
              </TableCaption>
              <TableHeader>
                <TableRow style={{ backgroundColor: colors.primaryLight }}>
                  <TableHead style={{ color: colors.onPrimaryLight }}>Invoice ID</TableHead>
                  <TableHead style={{ color: colors.onPrimaryLight }}>Account ID</TableHead>
                  <TableHead style={{ color: colors.onPrimaryLight }}>Billing Cycle</TableHead>
                  <TableHead style={{ color: colors.onPrimaryLight }}>Period</TableHead>
                  <TableHead style={{ color: colors.onPrimaryLight }}>Status</TableHead>
                  <TableHead className="text-right" style={{ color: colors.onPrimaryLight }}>Total Amount</TableHead>
                  <TableHead style={{ color: colors.onPrimaryLight }}>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((invoice, index) => (
                  <TableRow 
                    key={invoice.invoice_id} 
                    onClick={() => router.push(`/dashboard/invoice-headers/${invoice.invoice_id}/invoice_lines`)}
                    className="cursor-pointer hover:bg-opacity-70"
                    style={{ 
                      backgroundColor: index % 2 === 0 ? colors.card : colors.surface,
                      color: colors.onCard
                    }}
                  >
                    <TableCell className="font-medium">
                      {invoice.invoice_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {invoice.account_id
                        ? invoice.account_id.substring(0, 8) + "..."
                        : "N/A"}
                    </TableCell>
                    <TableCell>{invoice.billing_cycle || "N/A"}</TableCell>
                    <TableCell>
                      {invoice.start_date && invoice.end_date
                        ? `${formatDate(invoice.start_date)} - ${formatDate(invoice.end_date)}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        invoice.total_amount,
                        invoice.currency || "USD"
                      )}
                    </TableCell>
                    <TableCell>{formatDate(invoice.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm" style={{ color: colors.muted }}>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  style={{ 
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.onCard,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  style={{ 
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.onCard,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}