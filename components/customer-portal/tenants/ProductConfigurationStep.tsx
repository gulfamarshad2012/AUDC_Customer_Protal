"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { fetchProductConfiguration } from "@/lib/api/helper";
import { Button } from "@heroui/react";

// Type definitions
interface FieldOption {
  value: string;
  label: string;
}

type FieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "textarea"
  | "checkbox"
  | "select"
  | "multiselect";

interface FormField {
  name: string;
  type: FieldType;
  required: boolean;
  description?: string;
  placeholder?: string;
  max_length?: number;
  min?: number;
  max?: number;
  options?: FieldOption[];
}

interface FormGroup {
  name: string;
  required: boolean;
  description?: string;
  childs: FormField[];
}

interface FeatureConfig {
  feature_name: string;
  required: boolean;
  config: {
    form: FormGroup[];
  };
}

interface DynamicConfigFormProps {
  productId: string;
  configData: Record<string, any>;
  setConfigData: (data: Record<string, any>) => void;
  onSubmit?: (e: React.FormEvent) => void | Promise<void>;
  isSubmitting?: boolean;
}

const DynamicConfigForm: React.FC<DynamicConfigFormProps> = ({
  productId,
  configData,
  setConfigData,
  onSubmit,
  isSubmitting = false,
}) => {
  const [config, setConfig] = useState<FeatureConfig[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    if (!productId) return;

    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductConfiguration(productId);
        console.log("✅ Fetched product configuration:", data);
        setConfig(data || []);
      } catch (err) {
        console.error("❌ Error fetching product configuration:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch configuration"
        );
        setConfig([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [productId]);

  // Handle form field changes
  const handleFieldChange = (
    featureName: string,
    fieldName: string,
    value: any,
    fieldType: FieldType
  ) => {
    setConfigData((prev: any) => ({
      ...prev,
      [featureName]: {
        ...prev[featureName],
        [fieldName]: fieldType === "multiselect" ? value : value,
      },
    }));
  };

  // Toggle group expansion
  const toggleGroup = (featureName: string, groupName: string) => {
    const key = `${featureName}-${groupName}`;
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Render form field based on type
  const renderField = (field: FormField, featureName: string) => {
    const value = configData[featureName]?.[field.name] || "";
    const fieldId = `${featureName}-${field.name}`;

    const baseClasses =
      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

    switch (field.type) {
      case "text":
        return (
          <input
            id={fieldId}
            type="text"
            value={value as string}
            onChange={(e) =>
              handleFieldChange(
                featureName,
                field.name,
                e.target.value,
                field.type
              )
            }
            placeholder={field.placeholder}
            maxLength={field.max_length}
            className={baseClasses}
            required={field.required}
          />
        );

      case "email":
        return (
          <input
            id={fieldId}
            type="email"
            value={value as string}
            onChange={(e) =>
              handleFieldChange(
                featureName,
                field.name,
                e.target.value,
                field.type
              )
            }
            placeholder={field.placeholder}
            className={baseClasses}
            required={field.required}
          />
        );

      case "phone":
        return (
          <input
            id={fieldId}
            type="tel"
            value={value as string}
            onChange={(e) =>
              handleFieldChange(
                featureName,
                field.name,
                e.target.value,
                field.type
              )
            }
            placeholder={field.placeholder}
            className={baseClasses}
            required={field.required}
          />
        );

      case "number":
        return (
          <input
            id={fieldId}
            type="number"
            value={value as number}
            onChange={(e) =>
              handleFieldChange(
                featureName,
                field.name,
                parseInt(e.target.value) || "",
                field.type
              )
            }
            min={field.min}
            max={field.max}
            className={baseClasses}
            required={field.required}
          />
        );

      case "textarea":
        return (
          <textarea
            id={fieldId}
            value={value as string}
            onChange={(e) =>
              handleFieldChange(
                featureName,
                field.name,
                e.target.value,
                field.type
              )
            }
            placeholder={field.placeholder}
            rows={3}
            className={`${baseClasses} resize-vertical`}
            required={field.required}
          />
        );

      case "checkbox":
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              id={fieldId}
              type="checkbox"
              checked={value === true}
              onChange={(e) =>
                handleFieldChange(
                  featureName,
                  field.name,
                  e.target.checked,
                  field.type
                )
              }
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{field.description}</span>
          </label>
        );

      case "select":
        return (
          <select
            id={fieldId}
            value={value as string}
            onChange={(e) =>
              handleFieldChange(
                featureName,
                field.name,
                e.target.value,
                field.type
              )
            }
            className={baseClasses}
            required={field.required}
          >
            <option value="">Select an option...</option>
            {field.options?.map((option: FieldOption) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "multiselect":
        return (
          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
            {field.options?.map((option: FieldOption) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const currentValue = Array.isArray(value) ? value : [];
                    const newValue = e.target.checked
                      ? [...currentValue, option.value]
                      : currentValue.filter((v) => v !== option.value);
                    handleFieldChange(
                      featureName,
                      field.name,
                      newValue,
                      field.type
                    );
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            id={fieldId}
            type="text"
            value={value as string}
            onChange={(e) =>
              handleFieldChange(
                featureName,
                field.name,
                e.target.value,
                field.type
              )
            }
            placeholder={field.placeholder}
            className={baseClasses}
            required={field.required}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-4" />
          <p className="text-lg font-semibold">Error Loading Configuration</p>
          <p className="text-sm mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full mx-auto min-h-screen">
      <div className="bg-white p-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Product Configuration
        </h1>

        {config?.map((feature: FeatureConfig) => (
          <div
            key={feature.feature_name}
            className="border rounded-lg p-4 mb-4"
          >
            <div className="flex items-center space-x-2 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {feature.feature_name}
              </h2>
              {feature.required && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                  Required
                </span>
              )}
            </div>

            {feature.config.form.map((group: FormGroup) => {
              const groupKey = `${feature.feature_name}-${group.name}`;
              const isExpanded = expandedGroups[groupKey];

              return (
                <div
                  key={group.name}
                  className="mb-4 border border-gray-100 rounded-md"
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleGroup(feature.feature_name, group.name)
                    }
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-700">
                        {group.name}
                      </h3>
                      {group.required && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          Required
                        </span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 space-y-4">
                      {group.description && (
                        <p className="text-sm text-gray-600 italic">
                          {group.description}
                        </p>
                      )}

                      {group.childs.map((field: FormField) => (
                        <div key={field.name} className="space-y-1">
                          <label
                            htmlFor={`${feature.feature_name}-${field.name}`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            {field.name
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                            {field.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>

                          {field.description && field.type !== "checkbox" && (
                            <p className="text-xs text-gray-500">
                              {field.description}
                            </p>
                          )}

                          {renderField(field, feature.feature_name)}

                          {field.max_length && (
                            <p className="text-xs text-gray-400">
                              Max length: {field.max_length} characters
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Create Tenant button at the bottom of the configuration form */}
        {onSubmit && (
          <div className="mt-12 -mb-17 flex justify-end">
            <Button
              color="primary"
              onClick={onSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="px-6"
            >
              Create Tenant
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicConfigForm;