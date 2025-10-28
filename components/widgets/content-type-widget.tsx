// components/widgets/content-types-widget.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { File, HardDrive } from "lucide-react";
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

interface ContentTypesWidgetProps {
  onRemove: () => void;
}

export function ContentTypesWidget({ onRemove }: ContentTypesWidgetProps) {
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
            <File className="h-5 w-5" />
            Content Types
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              Loading content types data...
            </p>
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
            <File className="h-5 w-5" />
            Content Types
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
            <File className="h-5 w-5" />
            Content Types
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">
              No content types data available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { summary } = data.data;

  // Prepare data for content types chart
  const contentTypesData: { name: string; y: number }[] = [];
  summary.buckets.forEach((bucket) => {
    Object.entries(bucket.size_by_type).forEach(([type, size]) => {
      const existingIndex = contentTypesData.findIndex(
        (item) => item.name === type
      );
      if (existingIndex >= 0) {
        contentTypesData[existingIndex].y += size / (1024 * 1024); // Convert to MB
      } else {
        contentTypesData.push({
          name: type,
          y: size / (1024 * 1024), // Convert to MB
        });
      }
    });
  });

  const contentTypesChartOptions: Highcharts.Options = {
    chart: {
      type: "pie",
      height: 250,
    },
    title: {
      text: "Content Types Distribution",
      style: {
        fontSize: "16px",
        fontWeight: "bold",
      },
    },
    tooltip: {
      formatter: function (this: any) {
        return `<b>${this.points?.[0].name}</b><br/>
                Size: ${this.points?.[0].y.toFixed(2)} MB`;
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b>: {point.y:.1f} MB",
        },
        showInLegend: true,
      },
    },
    series: [
      {
        type: "pie",
        name: "Content Types",
        data: contentTypesData,
        colors: [
          "#3b82f6",
          "#10b981",
          "#8b5cf6",
          "#f59e0b",
          "#ef4444",
          "#ec4899",
        ],
      },
    ],
    credits: {
      enabled: false,
    },
  };

  // Calculate total size for each content type
  const contentTypesSummary: Record<string, number> = {};
  summary.buckets.forEach((bucket) => {
    Object.entries(bucket.size_by_type).forEach(([type, size]) => {
      if (contentTypesSummary[type]) {
        contentTypesSummary[type] += size;
      } else {
        contentTypesSummary[type] = size;
      }
    });
  });

  return (
    <div className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Content Types
        </CardTitle>
        <CardDescription>Distribution of file types in storage</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <File className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Content Types
              </span>
            </div>
            <div className="text-lg font-bold">
              {Object.keys(contentTypesSummary).length}
            </div>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Size</span>
            </div>
            <div className="text-lg font-bold">{summary.total_size_gb} GB</div>
          </div>
        </div>

        {/* Content Types Chart */}
        <div className="mb-4">
          <HighchartsReact
            highcharts={Highcharts}
            options={contentTypesChartOptions}
          />
        </div>

        {/* Content Types Table */}
        <div className="mt-auto">
          <h4 className="text-sm font-medium mb-2">Content Types Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(contentTypesSummary)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([type, size], index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{type}</Badge>
                  </div>
                  <div className="text-sm font-medium">{formatBytes(size)}</div>
                </div>
              ))}
            {Object.keys(contentTypesSummary).length > 5 && (
              <div className="text-center text-muted-foreground text-sm">
                +{Object.keys(contentTypesSummary).length - 5} more content
                types
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </div>
  );
}
