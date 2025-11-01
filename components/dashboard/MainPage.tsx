// app/dashboard/page.tsx
"use client";

import type React from "react";
import { useState, useCallback, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Trash2,
  BarChart3,
  Users,
  DollarSign,
  Activity,
  Database,
  Globe,
  Zap,
  TrendingUp,
  HardDrive,
  GripVertical,
  Folder,
  File,
} from "lucide-react";
import { AnalyticsWidget } from "@/components/widgets/analytics-widget";
import { UsersWidget } from "@/components/widgets/users-widget";
import { RevenueWidget } from "@/components/widgets/revenue-widget";
import { ActivityWidget } from "@/components/widgets/activity-widget";
import { DatabaseWidget } from "@/components/widgets/database-widget";
import { TrafficWidget } from "@/components/widgets/traffic-widget";
import { PerformanceWidget } from "@/components/widgets/performance-widget";
import { GrowthWidget } from "@/components/widgets/growth-widget";
import { StorageOverviewWidget } from "@/components/widgets/storage-overview-widget";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { BandwidthWidget } from "../widgets/storage-bandwidth-widget";
import { BucketsWidget } from "../widgets/storage-bucket-widget";
import { ContentTypesWidget } from "../widgets/content-type-widget";

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface Widget {
  id: string;
  type: string;
  title: string;
  icon: React.ReactNode;
  component: React.ComponentType<{ onRemove: () => void }>;
}

const allWidgets: Omit<Widget, "id">[] = [
  {
    type: "analytics",
    title: "Analytics Overview",
    icon: <BarChart3 className="h-4 w-4" />,
    component: AnalyticsWidget,
  },
  {
    type: "users",
    title: "Active Users",
    icon: <Users className="h-4 w-4" />,
    component: UsersWidget,
  },
  {
    type: "revenue",
    title: "Revenue",
    icon: <DollarSign className="h-4 w-4" />,
    component: RevenueWidget,
  },
  {
    type: "activity",
    title: "Recent Activity",
    icon: <Activity className="h-4 w-4" />,
    component: ActivityWidget,
  },
  {
    type: "database",
    title: "Database Status",
    icon: <Database className="h-4 w-4" />,
    component: DatabaseWidget,
  },
  {
    type: "traffic",
    title: "Traffic Sources",
    icon: <Globe className="h-4 w-4" />,
    component: TrafficWidget,
  },
  {
    type: "performance",
    title: "Performance",
    icon: <Zap className="h-4 w-4" />,
    component: PerformanceWidget,
  },
  {
    type: "growth",
    title: "Growth Metrics",
    icon: <TrendingUp className="h-4 w-4" />,
    component: GrowthWidget,
  },
  {
    type: "storage-overview",
    title: "Storage Overview",
    icon: <HardDrive className="h-4 w-4" />,
    component: StorageOverviewWidget,
  },
  {
    type: "bandwidth",
    title: "Bandwidth Statistics",
    icon: <TrendingUp className="h-4 w-4" />,
    component: BandwidthWidget,
  },
  {
    type: "buckets",
    title: "Storage Buckets",
    icon: <Folder className="h-4 w-4" />,
    component: BucketsWidget,
  },
  {
    type: "content-types",
    title: "Content Types",
    icon: <File className="h-4 w-4" />,
    component: ContentTypesWidget,
  },
];

export function Dashboard() {
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: "1",
      type: "analytics",
      title: "Analytics Overview",
      icon: <BarChart3 className="h-4 w-4" />,
      component: AnalyticsWidget,
    },
    {
      id: "2",
      type: "users",
      title: "Active Users",
      icon: <Users className="h-4 w-4" />,
      component: UsersWidget,
    },
    {
      id: "3",
      type: "revenue",
      title: "Revenue",
      icon: <DollarSign className="h-4 w-4" />,
      component: RevenueWidget,
    },
  ]);

  const [layouts, setLayouts] = useState({
    lg: [
      { i: "1", x: 0, y: 0, w: 6, h: 4 },
      { i: "2", x: 6, y: 0, w: 3, h: 4 },
      { i: "3", x: 9, y: 0, w: 3, h: 4 },
    ],
    md: [
      { i: "1", x: 0, y: 0, w: 6, h: 4 },
      { i: "2", x: 6, y: 0, w: 4, h: 4 },
      { i: "3", x: 0, y: 4, w: 5, h: 4 },
    ],
    sm: [
      { i: "1", x: 0, y: 0, w: 6, h: 4 },
      { i: "2", x: 0, y: 4, w: 6, h: 4 },
      { i: "3", x: 0, y: 8, w: 6, h: 4 },
    ],
  });

  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  // Load saved widgets/layouts from localStorage on mount
  useEffect(() => {
    try {
      const storedWidgets = localStorage.getItem("dashboard_widgets");
      const storedLayouts = localStorage.getItem("dashboard_layouts");

      if (storedWidgets) {
        const parsed: { id: string; type: string }[] = JSON.parse(storedWidgets);
        const reconstructed: Widget[] = parsed.map((p) => {
          const tmpl = allWidgets.find((t) => t.type === p.type);
          return {
            id: p.id,
            type: p.type,
            title: tmpl?.title ?? p.type,
            icon: tmpl?.icon ?? <BarChart3 className="h-4 w-4" />,
            component: tmpl?.component ?? AnalyticsWidget,
          };
        });
        setWidgets(reconstructed);
      }

      if (storedLayouts) {
        setLayouts(JSON.parse(storedLayouts));
      }
    } catch (err) {
      // fail silently but log to console for debugging
      // eslint-disable-next-line no-console
      console.error("Failed to load dashboard from localStorage:", err);
    }
  }, []);

  // Persist widgets (id + type) and layouts to localStorage whenever they change
  useEffect(() => {
    try {
      const serializable = widgets.map((w) => ({ id: w.id, type: w.type }));
      localStorage.setItem("dashboard_widgets", JSON.stringify(serializable));
      localStorage.setItem("dashboard_layouts", JSON.stringify(layouts));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to save dashboard to localStorage:", err);
    }
  }, [widgets, layouts]);

  // Get available widgets (not in layout)
  const availableWidgets = allWidgets.filter(
    (widget) => !widgets.some((w) => w.type === widget.type)
  );

  const addWidget = useCallback(
    (widgetType: string) => {
      const widgetTemplate = allWidgets.find((w) => w.type === widgetType);
      if (!widgetTemplate) return;

      const newWidget: Widget = {
        ...widgetTemplate,
        id: Date.now().toString(),
      };

      setWidgets((prev) => [...prev, newWidget]);

      // Add layout for the new widget
      const newLayout = { i: newWidget.id, x: 0, y: 0, w: 4, h: 4 };
      setLayouts((prev) => ({
        lg: [...prev.lg, newLayout],
        md: [...prev.md, newLayout],
        sm: [...prev.sm, newLayout],
      }));
    },
    [widgets]
  );

  const removeWidget = useCallback((widgetId: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
    setLayouts((prev) => ({
      lg: prev.lg.filter((l) => l.i !== widgetId),
      md: prev.md.filter((l) => l.i !== widgetId),
      sm: prev.sm.filter((l) => l.i !== widgetId),
    }));
  }, []);

  const onLayoutChange = useCallback((layout: any, layouts: any) => {
    setLayouts(layouts);
  }, []);

  // Drag and Drop handlers for widget list
  const handleDragStart = (e: React.DragEvent, widgetType: string) => {
    setDraggedWidget(widgetType);
    e.dataTransfer.setData("text/plain", widgetType);
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  // Drag and Drop handlers for layout area
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const widgetType = e.dataTransfer.getData("text/plain");
    if (widgetType && draggedWidget) {
      addWidget(widgetType);
    }
    setDraggedWidget(null);
  };

  // Handle drag from layout back to widget list (remove)
  const handleWidgetDragStart = (e: React.DragEvent, widgetId: string) => {
    e.dataTransfer.setData("widget-id", widgetId);
  };

  const handleWidgetListDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const widgetId = e.dataTransfer.getData("widget-id");
    if (widgetId) {
      removeWidget(widgetId);
    }
  };

  const handleWidgetListDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="h-full select-none overflow-y-hidden bg-white">
      {/* Header */}
      {/* <header className="border-b border backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Drag widgets to add them to your dashboard
            </p>
          </div>
        </div>
      </header> */}

      <div className="flex flex-row h-[calc(100vh-64px)] ">
        {/* Dashboard Grid */}
        <div
          className="p-6 flex-1 overflow-y-auto"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <ResponsiveGridLayout
            className="bg-white resize-none "
            layouts={layouts}
            onLayoutChange={onLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            isDraggable={true}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            useCSSTransforms={true}
            preventCollision={false}
            autoSize={true}
            verticalCompact={true}
            style={{
              minHeight: "400px",
              position: "relative",
              backgroundBlendMode: "multiply",
            }}
          >
            {widgets.map((widget) => {
              const WidgetComponent = widget.component;
              return (
                <div key={widget.id} className="relative group">
                  <Card
                    style={{
                      borderRadius: "8px",
                    }}
                    className="h-full overflow-hidden bg-white"
                  >
                    <div className="absolute top-2 right-2 z-10 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
                        draggable
                        onDragStart={(e) => handleWidgetDragStart(e, widget.id)}
                      >
                        <GripVertical className="h-3 w-3" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem
                            onClick={() => removeWidget(widget.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Remove Widget
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <WidgetComponent onRemove={() => removeWidget(widget.id)} />
                  </Card>
                </div>
              );
            })}
          </ResponsiveGridLayout>
        </div>

        {/* Widget List Sidebar */}
        <div className="h-full border-l bg-gray-50">
          <div
            className="w-48 p-2"
            onDrop={handleWidgetListDrop}
            onDragOver={handleWidgetListDragOver}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Add Widget
            </h2>

            <div className="space-y-1 mt-0">
              {availableWidgets.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>All widgets are currently in use</p>
                  <p className="text-sm">
                    Remove widgets from dashboard to see them here
                  </p>
                </div>
              ) : (
                availableWidgets.map((widget) => (
                  <Card
                    key={widget.type}
                    style={{
                      borderRadius: "4px",
                    }}
                    className={`p-2 bg-white cursor-grab active:cursor-grabbing transition-all hover:shadow-md -space-y-1 rounded-md ${
                      draggedWidget === widget.type
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, widget.type)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="flex-shrink-0">{widget.icon}</div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-[12px] truncate">
                          {widget.title}
                        </h4>
                      </div>
                      <GripVertical className="h-4 w-4 text-gray-400" />
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
