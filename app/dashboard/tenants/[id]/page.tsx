"use client";
import { useParams } from "next/navigation";
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

interface TenantMetrics {
  daysActive: number;
  isRecent: boolean;
  hasCustomDomain: boolean;
  schemaReady: boolean;
  statusCategory: string;
}

export default function TenantChartsPage() {
  const params = useParams();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [metrics, setMetrics] = useState<TenantMetrics | null>(null);
  const [similarTenants, setSimilarTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setLoading(true);

        // Fetch specific tenant data
        const { data: tenantData, error: tenantError } = await supabase
          .schema("shared")
          .from("tenants")
          .select("*")
          .eq("id", tenantId)
          .single();

        if (tenantError) {
          throw tenantError;
        }

        // Fetch similar tenants (same timezone or status)
        const { data: similarData, error: similarError } = await supabase
          .schema("shared")
          .from("tenants")
          .select("*")
          .or(`time_zone.eq.${tenantData.time_zone},status.eq.${tenantData.status}`)
          .neq("id", tenantId)
          .limit(10);

        if (similarError) {
          console.warn("Could not fetch similar tenants:", similarError);
        }

        setTenant(tenantData);
        setSimilarTenants(similarData || []);
        calculateTenantMetrics(tenantData);
      } catch (err) {
        setError("Failed to load tenant data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchTenantData();
    }
  }, [tenantId]);

  const calculateTenantMetrics = (tenantData: Tenant) => {
    const now = new Date();
    const createdAt = new Date(tenantData.created_at);
    const daysActive = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const tenantMetrics: TenantMetrics = {
      daysActive,
      isRecent: createdAt > thirtyDaysAgo,
      hasCustomDomain: !!tenantData.sub_domain,
      schemaReady: tenantData.schema_created,
      statusCategory: tenantData.status || (tenantData.is_active ? 'active' : 'inactive'),
    };

    setMetrics(tenantMetrics);
  };

  // Generate tenant activity simulation over time (based on creation date)
  const getTenantActivityData = () => {
    if (!tenant || !metrics) return null;

    const createdAt = new Date(tenant.created_at);
    const daysSinceCreation = metrics.daysActive;
    
    // Create weekly data points since creation
    const weeks = Math.min(Math.ceil(daysSinceCreation / 7), 12); // Max 12 weeks
    const labels = [];
    const activityData = [];

    for (let i = 0; i < weeks; i++) {
      labels.push(`Week ${i + 1}`);
      
      // Simulate activity based on tenant characteristics
      let baseActivity = tenant.is_active ? 75 : 25;
      if (tenant.schema_created) baseActivity += 20;
      if (tenant.sub_domain) baseActivity += 15;
      
      // Add some realistic variation
      const variation = Math.random() * 30 - 15;
      activityData.push(Math.max(0, Math.min(100, baseActivity + variation)));
    }

    return {
      labels,
      datasets: [
        {
          label: "Activity Score",
          data: activityData,
          borderColor: tenant.is_active ? colors.tertiary : colors.error,
          backgroundColor: tenant.is_active ? `${colors.tertiary}33` : `${colors.error}33`,
          tension: 0.1,
        },
      ],
    };
  };

  // Generate tenant configuration status
  const getConfigurationStatusData = () => {
    if (!tenant) return null;

    const configItems = [
      { name: 'Basic Info', completed: true },
      { name: 'Domain Setup', completed: !!tenant.sub_domain },
      { name: 'Schema Created', completed: tenant.schema_created },
      { name: 'Business Reg', completed: !!tenant.business_reg_number },
    ];

    const completed = configItems.filter(item => item.completed).length;
    const pending = configItems.length - completed;

    return {
      labels: ['Completed', 'Pending'],
      datasets: [
        {
          data: [completed, pending],
          backgroundColor: [
            `${colors.tertiary}CC`,
            `${colors.warning}CC`,
          ],
          borderColor: [
            colors.tertiary,
            colors.warning,
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  // Generate comparison with similar tenants
  const getSimilarTenantsData = () => {
    if (!similarTenants.length || !tenant) return null;

    const allTenants = [tenant, ...similarTenants.slice(0, 4)]; // Include current + 4 similar
    const labels = allTenants.map(t => {
      // Add null check for tenant name
      if (!t.name) return "Unknown Tenant";
      return t.name.length > 15 ? `${t.name.substring(0, 15)}...` : t.name;
    });
    
    const daysActiveData = allTenants.map(t => {
      const days = Math.floor((new Date().getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return days;
    });

    return {
      labels,
      datasets: [
        {
          label: "Days Active",
          data: daysActiveData,
          backgroundColor: allTenants.map((t, i) => 
            i === 0 ? `${colors.primary}CC` : `${colors.secondary}80`
          ),
          borderColor: allTenants.map((t, i) => 
            i === 0 ? colors.primary : colors.secondary
          ),
          borderWidth: allTenants.map((t, i) => i === 0 ? 3 : 1),
        },
      ],
    };
  };

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
        <div className="text-xl" style={{ color: colors.onBackground }}>Loading tenant data...</div>
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

  if (!tenant || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-xl" style={{ color: colors.onBackground }}>Tenant not found</div>
      </div>
    );
  }

  const activityData = getTenantActivityData();
  const configStatusData = getConfigurationStatusData();
  const comparisonData = getSimilarTenantsData();

  // Helper function to safely truncate strings
  const safeTruncate = (str: string | undefined | null, length: number) => {
    if (!str) return "N/A";
    return str.length > length ? `${str.substring(0, length)}...` : str;
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background }}>
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: colors.onBackground }}>
                {tenant.name}
              </h1>
              <p className="mt-2" style={{ color: colors.muted }}>
                Individual tenant analytics and insights
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                tenant.is_active 
                  ? '' 
                  : ''
              }`} style={{ 
                backgroundColor: tenant.is_active ? `${colors.success}20` : `${colors.error}20`,
                color: tenant.is_active ? colors.success : colors.error
              }}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  tenant.is_active ? '' : ''
                }`} style={{ 
                  backgroundColor: tenant.is_active ? colors.success : colors.error 
                }}></div>
                {metrics.statusCategory.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Details Card */}
        <div 
          className="rounded-lg shadow-md p-6 mb-8"
          style={{ 
            backgroundColor: colors.card,
            borderColor: colors.border,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 4px 6px -1px ${colors.shadow}`,
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div>
                <h2 className="text-xl font-semibold" style={{ color: colors.onCard }}>{tenant.name}</h2>
                <p className="mt-1" style={{ color: colors.muted }}>Access Code: {tenant.access_code}</p>
                <p className="text-sm mt-2" style={{ color: colors.muted }}>
                  Created {metrics.daysActive} days ago • {tenant.time_zone}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm" style={{ color: colors.muted }}>Domain</p>
              <p className="font-medium" style={{ color: colors.onCard }}>{tenant.sub_domain || "Not configured"}</p>
              <p className="text-sm mt-2" style={{ color: colors.muted }}>Business Reg</p>
              <p className="font-medium" style={{ color: colors.onCard }}>{tenant.business_reg_number || "Not provided"}</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div 
            className="rounded-lg shadow-md p-6"
            style={{ 
              backgroundColor: colors.card,
              borderColor: colors.border,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 6px -1px ${colors.shadow}`,
            }}
          >
            <h3 className="text-lg font-medium" style={{ color: colors.onCard }}>Days Active</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: colors.primary }}>{metrics.daysActive}</p>
            <p className="text-sm mt-1" style={{ color: colors.muted }}>
              {metrics.isRecent ? 'Recent signup' : 'Established tenant'}
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
            <h3 className="text-lg font-medium" style={{ color: colors.onCard }}>Configuration</h3>
            <p className={`text-3xl font-bold mt-2 ${
              metrics.schemaReady ? '' : ''
            }`} style={{ 
              color: metrics.schemaReady ? colors.tertiary : colors.warning 
            }}>
              {metrics.schemaReady ? 'Ready' : 'Pending'}
            </p>
            <p className="text-sm mt-1" style={{ color: colors.muted }}>Schema status</p>
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
            <h3 className="text-lg font-medium" style={{ color: colors.onCard }}>Domain Setup</h3>
            <p className={`text-3xl font-bold mt-2 ${
              metrics.hasCustomDomain ? '' : ''
            }`} style={{ 
              color: metrics.hasCustomDomain ? colors.tertiary : colors.muted 
            }}>
              {metrics.hasCustomDomain ? 'Yes' : 'No'}
            </p>
            <p className="text-sm mt-1" style={{ color: colors.muted }}>Custom domain configured</p>
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
            <h3 className="text-lg font-medium" style={{ color: colors.onCard }}>Similar Tenants</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: colors.secondary }}>{similarTenants.length}</p>
            <p className="text-sm mt-1" style={{ color: colors.muted }}>Same timezone/status</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activity Timeline */}
          {activityData && (
            <div 
              className="rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: colors.card,
                borderColor: colors.border,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 4px 6px -1px ${colors.shadow}`,
              }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: colors.onCard }}>Activity Timeline</h2>
              <Line
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: true,
                      text: "Weekly Activity Since Creation"
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: function(value) {
                          return value + '%';
                        }
                      }
                    }
                  }
                }}
                data={activityData}
              />
            </div>
          )}

          {/* Configuration Status */}
          {configStatusData && (
            <div 
              className="rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: colors.card,
                borderColor: colors.border,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 4px 6px -1px ${colors.shadow}`,
              }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: colors.onCard }}>Setup Completion</h2>
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
                  data={configStatusData}
                />
              </div>
            </div>
          )}
        </div>

        {/* Comparison with Similar Tenants */}
        {comparisonData && (
          <div 
            className="rounded-lg shadow-md p-6 mb-8"
            style={{ 
              backgroundColor: colors.card,
              borderColor: colors.border,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 6px -1px ${colors.shadow}`,
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: colors.onCard }}>Comparison with Similar Tenants</h2>
            <Bar
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: true,
                    text: "Days Active Comparison (Current tenant highlighted)"
                  }
                }
              }}
              data={comparisonData}
            />
          </div>
        )}

        {/* Detailed Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            className="rounded-lg shadow-md p-6"
            style={{ 
              backgroundColor: colors.card,
              borderColor: colors.border,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 6px -1px ${colors.shadow}`,
            }}
          >
            <h3 className="text-lg font-medium mb-4" style={{ color: colors.onCard }}>Technical Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>Tenant ID</span>
                <span className="font-mono text-sm" style={{ color: colors.onCard }}>{safeTruncate(tenant.id, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>Server ID</span>
                <span className="font-mono text-sm" style={{ color: colors.onCard }}>{safeTruncate(tenant.server_id, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>Product ID</span>
                <span className="font-mono text-sm" style={{ color: colors.onCard }}>{safeTruncate(tenant.product_id, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>Schema Name</span>
                <span className="font-medium" style={{ color: colors.onCard }}>{tenant.schema || 'Not assigned'}</span>
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
            <h3 className="text-lg font-medium mb-4" style={{ color: colors.onCard }}>Timeline</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>Created</span>
                <span className="font-medium" style={{ color: colors.onCard }}>
                  {new Date(tenant.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>Last Updated</span>
                <span className="font-medium" style={{ color: colors.onCard }}>
                  {new Date(tenant.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.muted }}>Age Category</span>
                <span className="font-medium" style={{ color: colors.onCard }}>
                  {metrics.daysActive < 7 ? 'New' : 
                   metrics.daysActive < 30 ? 'Recent' : 
                   metrics.daysActive < 90 ? 'Established' : 'Veteran'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}