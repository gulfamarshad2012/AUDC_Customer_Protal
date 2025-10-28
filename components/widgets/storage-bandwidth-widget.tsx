// components/widgets/bandwidth-widget.tsx
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
  Upload,
  Download,
  HardDrive,
  TrendingUp,
} from "lucide-react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { fetchStorageHelper } from "@/lib/api/helper";

// TypeScript interfaces
interface BandwidthDaily {
  date: string;
  upload_bytes: number;
  upload_count: number;
  download_bytes: number;
  download_count: number;
  total_bytes: number;
  total_operations: number;
}

interface BandwidthTotal {
  upload_bytes: number;
  download_bytes: number;
  total_bytes: number;
  upload_count: number;
  download_count: number;
}

interface Bandwidth {
  daily: BandwidthDaily[];
  total: BandwidthTotal;
}

interface Period {
  start_date: string;
  end_date: string;
}

interface StorageStatsResponse {
  success: boolean;
  data: {
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

interface BandwidthWidgetProps {
  onRemove: () => void;
}

export function BandwidthWidget({ onRemove }: BandwidthWidgetProps) {
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
            <TrendingUp className="h-5 w-5" />
            Bandwidth Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading bandwidth data...</p>
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
            <TrendingUp className="h-5 w-5" />
            Bandwidth Statistics
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
            <TrendingUp className="h-5 w-5" />
            Bandwidth Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">No bandwidth data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { bandwidth, period } = data.data;

  // Prepare data for Highcharts
  const chartData = bandwidth.daily.map((day) => ({
    date: day.date,
    upload: day.upload_bytes / (1024 * 1024), // Convert to MB
    download: day.download_bytes / (1024 * 1024), // Convert to MB
  }));

  const chartOptions: Highcharts.Options = {
    chart: {
      type: "line",
      height: 200,
    },
    title: {
      text: "",
    },
    xAxis: {
      categories: chartData.map((item) => formatDate(item.date)),
    },
    yAxis: {
      title: {
        text: "MB",
      },
    },
    tooltip: {
      shared: true,
      formatter: function() {
        const x = this.x!;
        const upload = chartData[x].upload;
        const download = chartData[x].download;
        return `<b>${formatDate(chartData[x].date)}</b><br/>
                Upload: ${upload.toFixed(2)} MB<br/>
                Download: ${download.toFixed(2)} MB`;
      },
    },
    legend: {
      enabled: true,
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
    },
    series: [
      {
        name: "Upload",
        type: "line",
        data: chartData.map((item) => item.upload),
        color: "#3b82f6",
      },
      {
        name: "Download",
        type: "line",
        data: chartData.map((item) => item.download),
        color: "#10b981",
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
          <TrendingUp className="h-5 w-5" />
          Bandwidth Statistics
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
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Upload</span>
            </div>
            <div className="text-lg font-bold">
              {formatBytes(bandwidth.total.upload_bytes)}
            </div>
            <p className="text-xs text-muted-foreground">
              {bandwidth.total.upload_count} operations
            </p>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Download className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Download</span>
            </div>
            <div className="text-lg font-bold">
              {formatBytes(bandwidth.total.download_bytes)}
            </div>
            <p className="text-xs text-muted-foreground">
              {bandwidth.total.download_count} operations
            </p>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Bandwidth</span>
            </div>
            <div className="text-lg font-bold">
              {formatBytes(bandwidth.total.total_bytes)}
            </div>
            <p className="text-xs text-muted-foreground">
              {bandwidth.total.upload_count + bandwidth.total.download_count} operations
            </p>
          </div>
        </div>

        {/* Bandwidth Chart */}
        <div className="flex-1">
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
      </CardContent>
    </div>
  );
}