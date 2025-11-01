"use client";
import { CoolMode } from "@/components/magicui/cool-mode";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { colors } from "@/config/color-scheme";
import { BASE_URL } from "@/config/constants";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Download, Eye, Users, CheckCircle, XCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Define Tenant type based on the Supabase schema
type Tenant = {
  id: string;
  name: string;
  access_code: string;
  server_id: string;
  product_id: string;
  is_active: boolean;
  created_at: string;
  sub_domain: string | null;
  status: string;
  updated_at: string;
  logo: string | null;
  time_zone: string;
  business_reg_number: string | null;
};

export default function BillingHistoryPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const { data, error } = await supabase
          .schema("shared")
          .from("tenants")
          .select("*");

        if (error) {
          console.error("Error fetching tenants:", error);
          return;
        }

        setTenants(data || []);
        console.log("tenants data:" + data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [supabase]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return {
          backgroundColor: colors.success,
          color: colors.onSuccess,
        };
      case "inactive":
        return {
          backgroundColor: colors.error,
          color: colors.onError,
        };
      case "pending":
        return {
          backgroundColor: colors.warning,
          color: colors.onWarning,
        };
      default:
        return {
          backgroundColor: colors.neutral,
          color: colors.onNeutral,
        };
    }
  };

  useEffect(() => {
    handleLoginUserOnMounted();
  }, []);

  const handleLoginUserOnMounted = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      toast.error("error fetching user:" + error.message);
    } else {
      setUser(user);
    }
    if (!user) {
      window.location.href = `${BASE_URL}/login`;
    }
    console.log("user id:" + user?.id);
  };

  // Calculate statistics
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === "active").length;
  const inactiveTenants = tenants.filter((t) => t.status === "inactive").length;

  if (loading) {
    return (
      <div 
        className="flex justify-center items-center h-screen"
        style={{ backgroundColor: colors.background }}
      >
        <div style={{ color: colors.onBackground }}>
          Loading tenant data...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full" style={{ backgroundColor: colors.background }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-semibold" style={{ color: colors.onBackground }}>
            Tenant Management
          </h1>
          <p className="mt-1" style={{ color: colors.muted }}>
            View and manage all tenant accounts
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          <CoolMode>
            <Button
              onClick={() => router.push("/dashboard/tenants/create")}
              className="cursor-pointer"
              style={{
                backgroundColor: colors.primary,
                color: colors.onPrimary,
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Button>
          </CoolMode>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card 
          className="overflow-hidden"
          style={{ 
            backgroundColor: colors.card,
            borderColor: colors.border,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 4px 6px -1px ${colors.shadow}`,
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: colors.onCard }}
                >
                  {totalTenants}
                </p>
                <p 
                  className="text-sm mt-1"
                  style={{ color: colors.muted }}
                >
                  Total Tenants
                </p>
              </div>
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: colors.primaryLight }}
              >
                <Users 
                  className="w-6 h-6" 
                  style={{ color: colors.primary }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="overflow-hidden"
          style={{ 
            backgroundColor: colors.card,
            borderColor: colors.border,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 4px 6px -1px ${colors.shadow}`,
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: colors.onCard }}
                >
                  {activeTenants}
                </p>
                <p 
                  className="text-sm mt-1"
                  style={{ color: colors.muted }}
                >
                  Active Tenants
                </p>
              </div>
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: colors.successLight }}
              >
                <CheckCircle 
                  className="w-6 h-6" 
                  style={{ color: colors.success }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="overflow-hidden"
          style={{ 
            backgroundColor: colors.card,
            borderColor: colors.border,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 4px 6px -1px ${colors.shadow}`,
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: colors.onCard }}
                >
                  {inactiveTenants}
                </p>
                <p 
                  className="text-sm mt-1"
                  style={{ color: colors.muted }}
                >
                  Inactive Tenants
                </p>
              </div>
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: colors.errorLight }}
              >
                <XCircle 
                  className="w-6 h-6" 
                  style={{ color: colors.error }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card 
        className="overflow-hidden"
        style={{ 
          backgroundColor: colors.card,
          borderColor: colors.border,
          border: `1px solid ${colors.border}`,
          boxShadow: `0 4px 6px -1px ${colors.shadow}`,
        }}
      >
        <CardHeader>
          <CardTitle 
            className="text-xl"
            style={{ color: colors.onCard }}
          >
            All Tenants
          </CardTitle>
          <CardDescription 
            style={{ color: colors.muted }}
          >
            Complete list of tenant accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow style={{ backgroundColor: colors.primaryLight }}>
                <TableHead 
                  className="font-semibold"
                  style={{ color: colors.onPrimaryLight }}
                >
                  Created Date
                </TableHead>
                <TableHead 
                  className="font-semibold"
                  style={{ color: colors.onPrimaryLight }}
                >
                  Tenant Name
                </TableHead>
                <TableHead 
                  className="font-semibold"
                  style={{ color: colors.onPrimaryLight }}
                >
                  Access Code
                </TableHead>
                <TableHead 
                  className="font-semibold"
                  style={{ color: colors.onPrimaryLight }}
                >
                  Domain
                </TableHead>
                <TableHead 
                  className="font-semibold"
                  style={{ color: colors.onPrimaryLight }}
                >
                  Status
                </TableHead>
                <TableHead 
                  className="font-semibold"
                  style={{ color: colors.onPrimaryLight }}
                >
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant, index) => (
                <TableRow 
                  key={tenant.id}
                  style={{ 
                    backgroundColor: index % 2 === 0 ? colors.card : colors.surface,
                  }}
                  className="cursor-pointer transition-colors"
                >
                  <TableCell className="font-medium" style={{ color: colors.onCard }}>
                    {new Date(tenant.created_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </TableCell>
                  <TableCell className="font-semibold" style={{ color: colors.onCard }}>
                    {tenant.name}
                  </TableCell>
                  <TableCell style={{ color: colors.onCard }}>{tenant.access_code}</TableCell>
                  <TableCell style={{ color: colors.onCard }}>{tenant.sub_domain || "N/A"}</TableCell>
                  <TableCell>
                    <Badge 
                      className="rounded-2xl"
                      style={getStatusColor(tenant.status)}
                    >
                      {tenant.status.charAt(0).toUpperCase() +
                        tenant.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        style={{ 
                          backgroundColor: colors.surface,
                          borderColor: colors.primary,
                          color: colors.primary,
                        }}
                        onClick={() =>
                          router.push(`/dashboard/tenants/${tenant.id}`)
                        }
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        style={{ 
                          backgroundColor: colors.surface,
                          borderColor: colors.success,
                          color: colors.success,
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}