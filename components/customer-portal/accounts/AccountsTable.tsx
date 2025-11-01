// File: components/AccountsTable.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { colors } from "@/config/color-scheme";

interface Account {
  account_id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  is_active: boolean;
  preference_currency: string;
  account_balance: number;
  created_at: string;
}

interface AccountsTableProps {
  onEdit: (account: Account) => void;
  onAdd: () => void;
  refresh: boolean;
}

export function AccountsTable({ onEdit, onAdd, refresh }: AccountsTableProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, [refresh]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .schema("customer_portal")
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Error fetching accounts: " + error.message);
      } else {
        setAccounts(data || []);
      }
    } catch {
      toast.error("Error fetching accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (account: Account) => {
    setAccountToDelete(account);
    setShowConfirmDialog(true);
  };

  const confirmDeletion = () => {
    if (!accountToDelete) return;

    // Optimistic UI update: remove account immediately
    setAccounts((prev) =>
      prev.filter((a) => a.account_id !== accountToDelete.account_id)
    );

    const deletedAccount = accountToDelete;

    // Show toast with Undo option
    toast(
      (t) => (
        <div className="flex items-center justify-between gap-4">
          <span style={{ color: colors.onCard }}>
            {deletedAccount.company_name} deleted. Undo?
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (deleteTimeoutRef.current) {
                clearTimeout(deleteTimeoutRef.current);
              }
              // Restore account in UI
              setAccounts((prev) => [deletedAccount, ...prev]);
              toast.dismiss(t.id);
              toast.success("Deletion undone");
            }}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.primary,
              color: colors.primary,
              border: `1px solid ${colors.primary}`,
            }}
          >
            Undo
          </Button>
        </div>
      ),
      { duration: 6000 }
    );

    // Schedule permanent delete after 6 sec
    deleteTimeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .schema("customer_portal")
          .from("accounts")
          .delete()
          .eq("account_id", deletedAccount.account_id);

        if (error) {
          toast.error("Error deleting account: " + error.message);
          // rollback UI if deletion failed
          setAccounts((prev) => [deletedAccount, ...prev]);
        } else {
          toast.success("Account deleted permanently");
        }
      } catch {
        toast.error("Error deleting account");
        setAccounts((prev) => [deletedAccount, ...prev]);
      }
    }, 6000);

    // Close dialog
    setShowConfirmDialog(false);
    setAccountToDelete(null);
  };

  if (loading) {
    return (
      <div className="p-4" style={{ color: colors.onBackground }}>
        Loading accounts...
      </div>
    );
  }

  return (
    <div className="p-6" style={{ backgroundColor: colors.background }}>
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: colors.onBackground }}
        >
          Accounts
        </h1>
        <Button
          onClick={onAdd}
          className="flex items-center gap-2"
          style={{
            backgroundColor: colors.primary,
            color: colors.onPrimary,
          }}
        >
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          border: `1px solid ${colors.border}`,
          boxShadow: `0 4px 6px -1px ${colors.shadow}`,
        }}
      >
        <table
          className="min-w-full divide-y"
          style={{ borderColor: colors.border }}
        >
          <thead style={{ backgroundColor: colors.primaryLight }}>
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: colors.onPrimaryLight }}
              >
                Company Name
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: colors.onPrimaryLight }}
              >
                Contact Name
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: colors.onPrimaryLight }}
              >
                Contact Email
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: colors.onPrimaryLight }}
              >
                Balance
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: colors.onPrimaryLight }}
              >
                Status
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: colors.onPrimaryLight }}
              >
                Created
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: colors.onPrimaryLight }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className="divide-y"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
          >
            {accounts.map((account) => (
              <tr key={account.account_id}>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                  style={{ color: colors.onCard }}
                >
                  {account.company_name}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm"
                  style={{ color: colors.onCard }}
                >
                  {account.contact_name}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm"
                  style={{ color: colors.onCard }}
                >
                  {account.contact_email}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm"
                  style={{ color: colors.onCard }}
                >
                  {account.preference_currency}{" "}
                  {account.account_balance.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    style={{
                      backgroundColor: account.is_active
                        ? colors.success
                        : colors.error,
                      color: account.is_active
                        ? colors.onSuccess
                        : colors.onError,
                    }}
                  >
                    {account.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm"
                  style={{ color: colors.onCard }}
                >
                  {new Date(account.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(account)}
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.primary,
                        color: colors.primary,
                        border: `1px solid ${colors.primary}`,
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(account)}
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.error,
                        color: colors.error,
                        border: `1px solid ${colors.error}`,
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {accounts.length === 0 && (
          <div className="text-center py-8" style={{ color: colors.muted }}>
            No accounts found. Click "Add Account" to create your first account.
          </div>
        )}
      </div>

      {/* Shadcn UI Alert Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: "1px",
            border: `1px solid ${colors.border}`,
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: colors.onCard }}>
              Delete Account?
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: colors.muted }}>
              Are you sure you want to delete{" "}
              <span className="font-semibold" style={{ color: colors.onCard }}>
                {accountToDelete?.company_name}
              </span>
              ? You will have 6 seconds to undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.onCard,
                border: `1px solid ${colors.border}`,
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              style={{
                backgroundColor: colors.error,
                color: colors.onError,
              }}
              onClick={confirmDeletion}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}