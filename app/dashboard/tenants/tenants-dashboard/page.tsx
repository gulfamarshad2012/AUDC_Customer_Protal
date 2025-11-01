"use client";
import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { colors } from "@/config/color-scheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// TypeScript interface for tenant data
interface Tenant {
  id: string;
  name: string;
  access_code: string;
  server_id: string;
  product_id: string;
  is_active: boolean;
  created_at: string;
  sub_domain: string | null;
  settings_id: string | null;
  schema: string | null;
  status: string;
  updated_at: string;
  time_zone: string;
  business_reg_number: string | null;
  schema_created: boolean;
}

interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  tenantsWithDomain: number;
  tenantsWithSchema: number;
  tenantsByStatus: { [key: string]: number };
  tenantsByTimeZone: { [key: string]: number };
  recentlyCreated: number;
  monthlyGrowth: { [key: string]: number };
  serverDistribution: { [key: string]: number };
}

export default function AllTenantsAnalytics() {
  const router = useRouter();

  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchAllTenants();
  }, []);

  const fetchAllTenants = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .schema("shared")
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setAllTenants(data || []);
      if (data) {
        calculateStats(data);
      }
    } catch (err) {
      setError("Failed to load tenants data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tenants: Tenant[]) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const tenantStats: TenantStats = {
      totalTenants: tenants.length,
      activeTenants: tenants.filter((t) => t.status === "active").length,
      inactiveTenants: tenants.filter((t) => !t.is_active).length,
      tenantsWithDomain: tenants.filter((t) => t.sub_domain).length,
      tenantsWithSchema: tenants.filter((t) => t.schema_created).length,
      tenantsByStatus: {},
      tenantsByTimeZone: {},
      serverDistribution: {},
      recentlyCreated: tenants.filter(
        (t) => new Date(t.created_at) > thirtyDaysAgo
      ).length,
      monthlyGrowth: {},
    };

    // Group by status
    tenants.forEach((tenant) => {
      const status =
        tenant.status || (tenant.is_active ? "active" : "inactive");
      tenantStats.tenantsByStatus[status] =
        (tenantStats.tenantsByStatus[status] || 0) + 1;
    });

    // Group by timezone
    tenants.forEach((tenant) => {
      const tz = tenant.time_zone || "UTC";
      tenantStats.tenantsByTimeZone[tz] =
        (tenantStats.tenantsByTimeZone[tz] || 0) + 1;
    });

    // Group by server
    tenants.forEach((tenant) => {
      const serverId = tenant.server_id.substring(0, 8) + "...";
      tenantStats.serverDistribution[serverId] =
        (tenantStats.serverDistribution[serverId] || 0) + 1;
    });

    // Calculate monthly growth for last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      tenantStats.monthlyGrowth[monthKey] = tenants.filter((tenant) => {
        const createdAt = new Date(tenant.created_at);
        return createdAt >= date && createdAt < nextMonth;
      }).length;
    }

    setStats(tenantStats);
  };

  // Generate growth chart data
  const getGrowthData = () => {
    if (!stats) return null;

    const labels = Object.keys(stats.monthlyGrowth);
    const data = Object.values(stats.monthlyGrowth);

    return {
      labels,
      datasets: [
        {
          label: "New Tenants",
          data,
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}33`,
          tension: 0.1,
        },
      ],
    };
  };

  // Generate status distribution data
  const getStatusDistributionData = () => {
    if (!stats) return null;

    const labels = Object.keys(stats.tenantsByStatus);
    const data = Object.values(stats.tenantsByStatus);

    const themeColors = [
      `${colors.tertiary}CC`,
      `${colors.error}CC`,
      `${colors.warning}CC`,
      `${colors.info}CC`,
      `${colors.secondary}CC`,
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: themeColors.slice(0, labels.length),
          borderColor: themeColors
            .slice(0, labels.length)
            .map((color) => color.replace("CC", "FF")),
          borderWidth: 2,
        },
      ],
    };
  };

  // Generate timezone distribution data
  const getTimezoneData = () => {
    if (!stats) return null;

    const sortedTimezones = Object.entries(stats.tenantsByTimeZone)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10); // Top 10 timezones

    return {
      labels: sortedTimezones.map(([tz]) => tz),
      datasets: [
        {
          label: "Tenants",
          data: sortedTimezones.map(([, count]) => count),
          backgroundColor: `${colors.secondary}99`,
          borderColor: colors.secondary,
          borderWidth: 1,
        },
      ],
    };
  };

  // Generate server distribution data
  const getServerDistributionData = () => {
    if (!stats) return null;

    const labels = Object.keys(stats.serverDistribution);
    const data = Object.values(stats.serverDistribution);

    return {
      labels,
      datasets: [
        {
          label: "Tenants per Server",
          data,
          backgroundColor: `${colors.info}99`,
          borderColor: colors.info,
          borderWidth: 1,
        },
      ],
    };
  };

  // Filter tenants based on search and status
  const filteredTenants = allTenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.access_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant.sub_domain &&
        tenant.sub_domain.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && tenant.is_active) ||
      (statusFilter === "inactive" && !tenant.is_active) ||
      tenant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: colors.onCard,
        }
      },
      title: {
        color: colors.onCard,
        font: {
          size: 16,
        }
      }
    },
    scales: {
      y: {
        ticks: {
          color: colors.muted,
        },
        grid: {
          color: `${colors.border}33`,
        }
      },
      x: {
        ticks: {
          color: colors.muted,
        },
        grid: {
          color: `${colors.border}33`,
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-xl" style={{ color: colors.onBackground }}>Loading all tenants data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-xl" style={{ color: colors.error }}>{error}</div>
      </div>
    );
  }

  const growthData = getGrowthData();
  const statusData = getStatusDistributionData();
  const timezoneData = getTimezoneData();
  const serverData = getServerDistributionData();

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background }}>
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: colors.onBackground }}>
            All Tenants Analytics Dashboard
          </h1>
          <p className="mt-2" style={{ color: colors.muted }}>
            Comprehensive overview of all tenants in the system
          </p>
        </div>

        {/* Key Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div 
            className="rounded-lg shadow-md p-6"
            style={{ 
              backgroundColor: colors.card,
              borderColor: colors.border,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 6px -1px ${colors.shadow}`,
            }}
          >
            <h3 className="text-lg font-medium" style={{ color: colors.onCard }}>Total Tenants</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: colors.primary }}>
              {stats?.totalTenants.toLocaleString()}
            </p>
            <p className="text-sm mt-1" style={{ color: colors.muted }}>All registered</p>
          </div>

          <div 
            className="rounded-lg shadow-md p-6"
            style={{ 
              backgroundColor: colors.card,
              borderColor: colors.border,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 6px -1px ${colors.shadow}`,
            }}
          >
            <h3 className="text-lg font-medium" style={{ color: colors.onCard }}>
              Active Tenants
            </h3>
            <p className="text-3xl font-bold mt-2" style={{ color: colors.tertiary }}>
              {stats?.activeTenants.toLocaleString()}
            </p>
            <p className="text-sm mt-1" style={{ color: colors.muted }}>
              {stats
                ? ((stats.activeTenants / stats.totalTenants) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </div>

          <div 
            className="rounded-lg shadow-md p-6"
            style={{ 
              backgroundColor: colors.card,
              borderColor: colors.border,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 6px -1px ${colors.shadow}`,
            }}
          >
            <h3 className="text-lg font-medium" style={{ color: colors.onCard }}>With Domains</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: colors.secondary }}>
              {stats?.tenantsWithDomain.toLocaleString()}
            </p>
            <p className="text-sm mt-1" style={{ color: colors.muted }}>
              {stats
                ? (
                    (stats.tenantsWithDomain / stats.totalTenants) *
                    100
                  ).toFixed(1)
                : 0}
              % configured
            </p>
          </div>

          <div 
            className="rounded-lg shadow-md p-6"
            style={{ 
              backgroundColor: colors.card,
              borderColor: colors.border,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 6px -1px ${colors.shadow}`,
            }}
          >
            <h3 className="text-lg font-medium" style={{ color: colors.onCard }}>Schema Ready</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: colors.info }}>
              {stats?.tenantsWithSchema.toLocaleString()}
            </p>
            <p className="text-sm mt-1" style={{ color: colors.muted }}>
              {stats
                ? (
                    (stats.tenantsWithSchema / stats.totalTenants) *
                    100
                  ).toFixed(1)
                : 0}
              % ready
            </p>
          </div>

          <div 
            className="rounded-lg shadow-md p-6"
            style={{ 
              backgroundColor: colors.card,
              borderColor: colors.border,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 6px -1px ${colors.shadow}`,
            }}
          >
            <h3 className="text-lg font-medium" style={{ color: colors.onCard }}>
              Recent Signups
            </h3>
            <p className="text-3xl font-bold mt-2" style={{ color: colors.warning }}>
              {stats?.recentlyCreated.toLocaleString()}
            </p>
            <p className="text-sm mt-1" style={{ color: colors.muted }}>Last 30 days</p>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Growth Chart */}
          {growthData && (
            <div 
              className="rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: colors.card,
                borderColor: colors.border,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 4px 6px -1px ${colors.shadow}`,
              }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: colors.onCard }}>
                Monthly Growth Trend
              </h2>
              <Line
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: true,
                      text: "New Tenant Registrations (Last 12 Months)",
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
                data={growthData}
              />
            </div>
          )}

          {/* Status Distribution */}
          {statusData && (
            <div 
              className="rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: colors.card,
                borderColor: colors.border,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 4px 6px -1px ${colors.shadow}`,
              }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: colors.onCard }}>
                Status Distribution
              </h2>
              <div className="h-64 flex items-center justify-center">
                <Doughnut
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom" as const,
                        labels: {
                          color: colors.onCard,
                        }
                      },
                    },
                  }}
                  data={statusData}
                />
              </div>
            </div>
          )}
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Timezone Distribution */}
          {timezoneData && (
            <div 
              className="rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: colors.card,
                borderColor: colors.border,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 4px 6px -1px ${colors.shadow}`,
              }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: colors.onCard }}>Top Timezones</h2>
              <Bar
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: true,
                      text: "Tenants by Timezone (Top 10)",
                    },
                  },
                  indexAxis: "y" as const,
                }}
                data={timezoneData}
              />
            </div>
          )}

          {/* Server Distribution */}
          {serverData && (
            <div 
              className="rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: colors.card,
                borderColor: colors.border,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 4px 6px -1px ${colors.shadow}`,
              }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: colors.onCard }}>
                Server Distribution
              </h2>
              <Bar
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: true,
                      text: "Tenants per Server",
                    },
                  },
                }}
                data={serverData}
              />
            </div>
          )}
        </div>

        {/* Tenants List Section */}
        <div 
          className="rounded-lg shadow-md p-6"
          style={{ 
            backgroundColor: colors.card,
            borderColor: colors.border,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 4px 6px -1px ${colors.shadow}`,
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: colors.onCard }}>
              All Tenants ({filteredTenants.length})
            </h2>

            <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.onCard,
                    border: `1px solid ${colors.border}`,
                  }}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5"
                    style={{ color: colors.muted }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ 
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.onCard,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                {stats &&
                  Object.keys(stats.tenantsByStatus).map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Tenants Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: colors.border }}>
              <thead style={{ backgroundColor: colors.primaryLight }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.onPrimaryLight }}>
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.onPrimaryLight }}>
                    Access Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.onPrimaryLight }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.onPrimaryLight }}>
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.onPrimaryLight }}>
                    Schema
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.onPrimaryLight }}>
                    Timezone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.onPrimaryLight }}>
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.onPrimaryLight }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ 
                backgroundColor: colors.card,
                borderColor: colors.border 
              }}>
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-opacity-70" style={{ 
                    backgroundColor: colors.card,
                    color: colors.onCard 
                  }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium" style={{ color: colors.onCard }}>
                            {tenant.name}
                          </div>
                          <div className="text-sm" style={{ color: colors.muted }}>
                            {tenant.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ 
                        backgroundColor: colors.surface,
                        color: colors.onCard 
                      }}>
                        {tenant.access_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                        style={{
                          backgroundColor: tenant.is_active ? `${colors.tertiary}20` : `${colors.error}20`,
                          color: tenant.is_active ? colors.tertiary : colors.error
                        }}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full mr-1.5`}
                          style={{ 
                            backgroundColor: tenant.is_active ? colors.tertiary : colors.error 
                          }}
                        ></div>
                        {tenant.status ||
                          (tenant.is_active ? "Active" : "Inactive")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: colors.onCard }}>
                      {tenant.sub_domain ? (
                        <a
                          href={`https://${tenant.sub_domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                          style={{ color: colors.primary }}
                        >
                          {tenant.sub_domain}
                        </a>
                      ) : (
                        <span style={{ color: colors.muted }}>Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                        style={{
                          backgroundColor: tenant.schema_created ? `${colors.tertiary}20` : `${colors.warning}20`,
                          color: tenant.schema_created ? colors.tertiary : colors.warning
                        }}
                      >
                        {tenant.schema_created ? "Ready" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: colors.onCard }}>
                      {tenant.time_zone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: colors.onCard }}>
                      {new Date(tenant.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/tenants/${tenant.id}`)
                        }
                        className="mr-3"
                        style={{ color: colors.primary }}
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(tenant.id)}
                        title="Copy ID"
                        style={{ color: colors.muted }}
                      >
                        Copy ID
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTenants.length === 0 && (
            <div className="text-center py-8">
              <p style={{ color: colors.muted }}>
                No tenants found matching your criteria.
              </p>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            className="rounded-lg shadow-md p-6"
            style={{ 
              backgroundColor: colors.card,
              borderColor: colors.border,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 6px -1px ${colors.shadow}`,
            }}
          >
            <h3 className="text-lg font-medium mb-4" style={{ color: colors.onCard }}>
              Configuration Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>
                  With Business Registration
                </span>
                <span className="font-semibold" style={{ color: colors.onCard }}>
                  {allTenants.filter((t) => t.business_reg_number).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>Unique Timezones</span>
                <span className="font-semibold" style={{ color: colors.onCard }}>
                  {stats ? Object.keys(stats.tenantsByTimeZone).length : 0}
                </span>
              </div>
            </div>
          </div>

          <div 
            className="rounded-lg shadow-md p-6"
            style={{ 
              backgroundColor: colors.card,
              borderColor: colors.border,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 6px -1px ${colors.shadow}`,
            }}
          >
            <h3 className="text-lg font-medium mb-4" style={{ color: colors.onCard }}>
              Growth Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>Average per Month</span>
                <span className="font-semibold" style={{ color: colors.onCard }}>
                  {stats
                    ? Math.round(
                        Object.values(stats.monthlyGrowth).reduce(
                          (a, b) => a + b,
                          0
                        ) / 12
                      )
                    : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>Peak Month</span>
                <span className="font-semibold" style={{ color: colors.onCard }}>
                  {stats ? Math.max(...Object.values(stats.monthlyGrowth)) : 0}{" "}
                  tenants
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>Growth Rate</span>
                <span className="font-semibold" style={{ color: colors.tertiary }}>
                  {stats?.recentlyCreated && stats.totalTenants
                    ? `+${((stats.recentlyCreated / (stats.totalTenants - stats.recentlyCreated)) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </div>

          <div 
            className="rounded-lg shadow-md p-6"
            style={{ 
              backgroundColor: colors.card,
              borderColor: colors.border,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 6px -1px ${colors.shadow}`,
            }}
          >
            <h3 className="text-lg font-medium mb-4" style={{ color: colors.onCard }}>
              System Health
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>Active Rate</span>
                <span className="font-semibold" style={{ color: colors.tertiary }}>
                  {stats
                    ? (
                        (stats.activeTenants / stats.totalTenants) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>Schema Completion</span>
                <span className="font-semibold" style={{ color: colors.info }}>
                  {stats
                    ? (
                        (stats.tenantsWithSchema / stats.totalTenants) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>Domain Setup</span>
                <span className="font-semibold" style={{ color: colors.secondary }}>
                  {stats
                    ? (
                        (stats.tenantsWithDomain / stats.totalTenants) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}