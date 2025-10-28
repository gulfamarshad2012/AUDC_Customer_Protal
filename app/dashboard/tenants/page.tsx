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
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
      <div className="flex justify-center items-center h-screen">
        Loading tenant data...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {user && (
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Tenant Management
              </h1>
              <p className="text-slate-600 mt-2">
                View and manage all tenant accounts
              </p>
            </div>
            <CoolMode>
              <Button
                onClick={() => router.push("/dashboard/tenants/create")}
                className="bg-gradient-to-r cursor-pointer from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Create New
              </Button>
            </CoolMode>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {totalTenants}
                    </p>
                    <p className="text-sm text-slate-600">Total Tenants</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">
                      {activeTenants}
                    </p>
                    <p className="text-sm text-slate-600">Active Tenants</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {inactiveTenants}
                    </p>
                    <p className="text-sm text-slate-600">Inactive Tenants</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <XCircle className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">All Tenants</CardTitle>
              <CardDescription>
                Complete list of tenant accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Tenant Name</TableHead>
                    <TableHead>Access Code</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">
                        {new Date(tenant.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {tenant.name}
                      </TableCell>
                      <TableCell>{tenant.access_code}</TableCell>
                      <TableCell>{tenant.sub_domain || "N/A"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(tenant.status)}>
                          {tenant.status.charAt(0).toUpperCase() +
                            tenant.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-blue-50 cursor-pointer"
                            onClick={() =>
                              router.push(`/dashboard/tenants/${tenant.id}`)
                            }
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-emerald-50 cursor-pointer"
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
      )}
    </div>
  );
}
