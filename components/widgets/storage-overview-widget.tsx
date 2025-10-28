// components/widgets/storage-overview-widget.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HardDrive,
  Package,
  Database,
  Calendar,
} from "lucide-react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { fetchStorageHelper } from "@/lib/api/helper";

// TypeScript interfaces
interface Summary {
  tenant_id: string;
  total_objects: number;
  total_size_bytes: number;
  total_size_gb: number;
  total_size_mb: number;
  bucket_count: number;
  last_synced_at: string | null;
}

interface BandwidthTotal {
  upload_bytes: number;
  download_bytes: number;
  total_bytes: number;
  upload_count: number;
  download_count: number;
}

interface Bandwidth {
  total: BandwidthTotal;
}

interface Period {
  start_date: string;
  end_date: string;
}

interface StorageStatsResponse {
  success: boolean;
  data: {
    summary: Summary;
    bandwidth: Bandwidth;
    period: Period;
  };
}

// Helper function to format bytes
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface StorageOverviewWidgetProps {
  onRemove: () => void;
}

export function StorageOverviewWidget({ onRemove }: StorageOverviewWidgetProps) {
  const [data, setData] = useState<StorageStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchStorageHelper();
        if (!response) {
          throw new Error("Failed to fetch storage stats");
        } else if (response) {
          setData(response);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Storage Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading storage data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Storage Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">Error</div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.data) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Storage Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">No storage data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { summary, bandwidth, period } = data.data;

  // Prepare data for Highcharts
  const chartData = [
    {
      name: "Storage Size",
      value: summary.total_size_gb,
      unit: "GB",
      color: "#3b82f6",
    },
    {
      name: "Total Objects",
      value: summary.total_objects,
      unit: "count",
      color: "#10b981",
    },
    {
      name: "Buckets",
      value: summary.bucket_count,
      unit: "count",
      color: "#8b5cf6",
    },
  ];

  const chartOptions: Highcharts.Options = {
    chart: {
      type: "column",
      height: 200,
    },
    title: {
      text: "",
    },
    xAxis: {
      categories: chartData.map((item) => item.name),
    },
    yAxis: {
      title: {
        text: "Value",
      },
    },
    tooltip: {
      formatter: function() {
        const item = chartData[this.x!];
        return `<b>${item.name}</b><br/>
                Value: ${item.value} ${item.unit}`;
      },
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        name: "Storage Metrics",
        type: "column",
        data: chartData.map((item) => ({
          y: item.value,
          color: item.color,
        })),
        dataLabels: {
          enabled: true,
          formatter: function() {
            const item = chartData[this.points?.[this.x!]?.index ?? 0];
            return `${item.value} ${item.unit}`;
          },
        },
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return (
    <div className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Storage Overview
        </CardTitle>
        <CardDescription>
          {period.start_date} to {period.end_date}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Objects</span>
            </div>
            <div className="text-lg font-bold">{summary.total_objects}</div>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Size</span>
            </div>
            <div className="text-lg font-bold">{summary.total_size_gb} GB</div>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Buckets</span>
            </div>
            <div className="text-lg font-bold">{summary.bucket_count}</div>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Last Sync</span>
            </div>
            <div className="text-sm font-bold">
              {summary.last_synced_at
                ? formatDate(summary.last_synced_at)
                : "Never"}
            </div>
          </div>
        </div>

        {/* Storage Overview Chart */}
        <div className="flex-1">
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
      </CardContent>
    </div>
  );
}