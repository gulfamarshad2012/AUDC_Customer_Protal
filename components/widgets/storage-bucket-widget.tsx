// components/widgets/buckets-widget.tsx
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Folder,
  Package,
  HardDrive,
} from "lucide-react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { fetchStorageHelper } from "@/lib/api/helper";

// TypeScript interfaces
interface Bucket {
  bucket_name: string;
  tenant_name: string;
  total_objects: number;
  total_size_bytes: number;
  size_by_type: Record<string, number>;
}

interface Summary {
  tenant_id: string;
  total_objects: number;
  total_size_bytes: number;
  total_size_gb: number;
  total_size_mb: number;
  bucket_count: number;
  last_synced_at: string | null;
  buckets: Bucket[];
}

interface StorageStatsResponse {
  success: boolean;
  data: {
    summary: Summary;
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

interface BucketsWidgetProps {
  onRemove: () => void;
}

export function BucketsWidget({ onRemove }: BucketsWidgetProps) {
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
      <div className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Storage Buckets
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading buckets data...</p>
          </div>
        </CardContent>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Storage Buckets
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
            <Folder className="h-5 w-5" />
            Storage Buckets
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">No buckets data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { summary } = data.data;

  // Prepare data for Highcharts
  const bucketSizeData = summary.buckets.map((bucket) => ({
    name: bucket.tenant_name,
    size: bucket.total_size_bytes / (1024 * 1024), // Convert to MB
    objects: bucket.total_objects,
  }));

  const bucketObjectsData = summary.buckets.map((bucket) => ({
    name: bucket.tenant_name,
    size: bucket.total_size_bytes / (1024 * 1024), // Convert to MB
    objects: bucket.total_objects,
  }));

  const bucketSizeChartOptions: Highcharts.Options = {
    chart: {
      type: "column",
      height: 180,
    },
    title: {
      text: "Bucket Size Distribution",
      style: {
        fontSize: "14px",
        fontWeight: "bold",
      },
    },
    xAxis: {
      categories: bucketSizeData.map((item) => item.name),
    },
    yAxis: {
      title: {
        text: "Size (MB)",
      },
    },
    tooltip: {
      formatter: function() {
        const bucket = bucketSizeData[this.x!];
        return `<b>${bucket.name}</b><br/>
                Size: ${bucket.size.toFixed(2)} MB<br/>
                Objects: ${bucket.objects}`;
      },
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        name: "Bucket Size",
        type: "column",
        data: bucketSizeData.map((item) => item.size),
        color: "#8b5cf6",
      },
    ],
    credits: {
      enabled: false,
    },
  };

  const bucketObjectsChartOptions: Highcharts.Options = {
    chart: {
      type: "pie",
      height: 180,
    },
    title: {
      text: "Objects Distribution",
      style: {
        fontSize: "14px",
        fontWeight: "bold",
      },
    },
    tooltip: {
      formatter: function() {
        const bucket = bucketObjectsData[this.points?.[0].index ?? 0];
        return `<b>${bucket.name}</b><br/>
                Objects: ${bucket.objects}<br/>
                Size: ${bucket.size.toFixed(2)} MB`;
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b>: {point.y} objects",
        },
      },
    },
    series: [
      {
        type: "pie",
        name: "Objects",
        data: bucketObjectsData.map((item) => ({
          name: item.name,
          y: item.objects,
        })),
        colors: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"],
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
          <Folder className="h-5 w-5" />
          Storage Buckets
        </CardTitle>
        <CardDescription>
          Overview of all storage buckets and their usage
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Folder className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Buckets</span>
            </div>
            <div className="text-lg font-bold">{summary.bucket_count}</div>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Objects</span>
            </div>
            <div className="text-lg font-bold">{summary.total_objects}</div>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Size</span>
            </div>
            <div className="text-lg font-bold">{summary.total_size_gb} GB</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <HighchartsReact highcharts={Highcharts} options={bucketSizeChartOptions} />
          </div>
          <div>
            <HighchartsReact highcharts={Highcharts} options={bucketObjectsChartOptions} />
          </div>
        </div>

        {/* Buckets Table */}
        <div className="mt-auto">
          <h4 className="text-sm font-medium mb-2">Top Buckets</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Tenant</TableHead>
                <TableHead className="text-right">Objects</TableHead>
                <TableHead className="text-right">Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.buckets.slice(0, 3).map((bucket, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium truncate max-w-[100px]" title={bucket.tenant_name}>
                    {bucket.tenant_name}
                  </TableCell>
                  <TableCell className="text-right">{bucket.total_objects}</TableCell>
                  <TableCell className="text-right">
                    {formatBytes(bucket.total_size_bytes)}
                  </TableCell>
                </TableRow>
              ))}
              {summary.buckets.length > 3 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    +{summary.buckets.length - 3} more buckets
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </div>
  );
}