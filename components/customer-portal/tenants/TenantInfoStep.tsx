// TenantInfoStep.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input, Select, SelectItem, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TenantFormData, Server } from "@/types/customer-portal";
import {
  getTimeZones,
  isValidAccessCode,
  isValidDomain,
} from "@/lib/api/helper";
import { MAIN_DOMAIN } from "@/config/constants";
import { Check, Cross } from "lucide-react";
import { Cross1Icon } from "@radix-ui/react-icons";
import { useDebounce } from "@/hooks/useDebounce";
import { supabase } from "@/lib/supabase";

interface TenantInfoStepProps {
  data: Partial<TenantFormData>;
  errors: Partial<Record<keyof TenantFormData, string>>;
  onChange: (key: keyof TenantFormData, value: string | string[]) => void;
  onValidationChange?: (payload: {
    accessCodeValid?: boolean | null;
    domainValid?: boolean | null;
    validatingAccessCode?: boolean;
    validatingDomain?: boolean;
  }) => void;
  onServerSelect?: (server: Server) => void; // Added this prop
}

export function TenantInfoStep({
  data,
  errors,
  onChange,
  onValidationChange,
  onServerSelect,
}: TenantInfoStepProps) {
  const [validatingAccessCode, setValidatingAccessCode] = useState(false);
  const [validatingDomain, setValidatingDomain] = useState(false);
  const [accessCodeValid, setAccessCodeValid] = useState<boolean | null>(null);
  const [domainValid, setDomainValid] = useState<boolean | null>(null);
  const [timezones, setTimezones] = useState<string[]>([]);
  const [loadingTimezones, setLoadingTimezones] = useState(true);
  const [accessCode, setAccessCode] = useState(data.access_code || "");
  const [domain, setDomain] = useState(data.subdomain || "");

  // New states for server dropdown
  const [servers, setServers] = useState<Server[]>([]);
  const [loadingServers, setLoadingServers] = useState(true);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);

  const debouncedAccessCode = useDebounce(accessCode, 500);
  const debouncedDomain = useDebounce(domain, 500);
  const timezonesFetchedOnce = useRef(false);

  // Fetch servers
  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoadingServers(true);
        const { data: serversData, error } = await supabase
          .schema("multi_tenant_admin")
          .from("servers")
          .select(
            "id, name, description, provider, status, domain, region, no_of_cpu_cores, ram, storage_capacity"
          )
          .eq("status", "active")
          .order("name");

        if (error) throw error;
        setServers(serversData || []);
      } catch (error) {
        console.error("Error fetching servers:", error);
      } finally {
        setLoadingServers(false);
      }
    };

    fetchServers();
  }, []);

  // inform parent initially
  useEffect(() => {
    onValidationChange?.({
      accessCodeValid,
      domainValid,
      validatingAccessCode,
      validatingDomain,
    });
  }, []); // run once on mount

  useEffect(() => {
    if (debouncedAccessCode) {
      validateAccessCode(debouncedAccessCode);
    } else {
      setAccessCodeValid(null);
      onValidationChange?.({ accessCodeValid: null });
    }
  }, [debouncedAccessCode]);

  useEffect(() => {
    if (debouncedDomain) {
      validateDomain(debouncedDomain);
    } else {
      setDomainValid(null);
      onValidationChange?.({ domainValid: null });
    }
  }, [debouncedDomain]);

  // Fetch timezones (only once)
  useEffect(() => {
    if (timezonesFetchedOnce.current) return;

    const fetchTimezones = async () => {
      try {
        setLoadingTimezones(true);
        const response = await getTimeZones();
        setTimezones(response);
      } catch (error) {
        console.error("Error fetching timezones:", error);
      } finally {
        setLoadingTimezones(false);
      }
    };

    fetchTimezones();
    timezonesFetchedOnce.current = true; // ✅ mark done
  }, []);

  const validateAccessCode = async (code: string) => {
    if (!code.trim()) {
      setAccessCodeValid(null);
      onValidationChange?.({ accessCodeValid: null });
      return;
    }

    try {
      setValidatingAccessCode(true);
      onValidationChange?.({ validatingAccessCode: true });

      const valid = await isValidAccessCode(encodeURIComponent(code));
      setAccessCodeValid(valid);
      onValidationChange?.({
        accessCodeValid: valid,
        validatingAccessCode: false,
      });
    } catch (error) {
      console.error("Error validating access code:", error);
      setAccessCodeValid(false);
      onValidationChange?.({
        accessCodeValid: false,
        validatingAccessCode: false,
      });
    } finally {
      setValidatingAccessCode(false);
    }
  };

  const validateDomain = async (sub_domain: string) => {
    if (!sub_domain.trim()) {
      setDomainValid(null);
      onValidationChange?.({ domainValid: null });
      return;
    }

    try {
      setValidatingDomain(true);
      onValidationChange?.({ validatingDomain: true });

      const valid = await isValidDomain(sub_domain);
      setDomainValid(valid);
      onValidationChange?.({ domainValid: valid, validatingDomain: false });
    } catch (error) {
      console.error("Error validating domain:", error);
      setDomainValid(false);
      onValidationChange?.({ domainValid: false, validatingDomain: false });
    } finally {
      setValidatingDomain(false);
    }
  };

  const handleAccessCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setAccessCode(code); // local immediate
    onChange("access_code", code); // update parent
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDomain(value);
    onChange("subdomain", value);
  };

  // Handle server selection
  const handleServerChange = (serverId: string) => {
    const server = servers.find((s) => s.id === serverId);
    if (server) {
      setSelectedServer(server);
      onChange("server_id", serverId);
      onServerSelect?.(server);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tenant Name */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Icon icon="heroicons:building-office" className="h-4 w-4" />
            Tenant Name
          </label>
          <Input
            id="name"
            isRequired
            errorMessage={errors.name}
            isInvalid={!!errors.name}
            placeholder="Enter tenant name"
            radius="lg"
            size="lg"
            type="text"
            value={data.name || ""}
            variant="bordered"
            onChange={(e) => onChange("name", e.target.value)}
          />
        </div>

        {/* Business Registration Number */}
        <div className="space-y-2">
          <label
            htmlFor="business_reg_number"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Icon icon="heroicons:document-text" className="h-4 w-4" />
            Business Registration Number
          </label>
          <Input
            id="business_reg_number"
            isRequired
            errorMessage={errors.business_reg_number}
            isInvalid={!!errors.business_reg_number}
            placeholder="Enter business registration number"
            radius="lg"
            size="lg"
            type="text"
            value={data.business_reg_number || ""}
            variant="bordered"
            onChange={(e) => onChange("business_reg_number", e.target.value)}
          />
        </div>

        {/* Access Code */}
        <div className="space-y-2 col-span-2">
          <label
            htmlFor="access_code"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Icon icon="heroicons:key" className="h-4 w-4" />
            Access Code
          </label>
          <Input
            id="access_code"
            isRequired
            errorMessage={errors.access_code}
            isInvalid={!!errors.access_code || accessCodeValid === false}
            placeholder="Enter access code"
            radius="lg"
            size="lg"
            type="text"
            value={accessCode}
            variant="bordered"
            onChange={(e) => {
              setAccessCode(e.target.value);
              onChange("access_code", e.target.value);
            }}
            endContent={
              validatingAccessCode ? (
                <Spinner size="sm" />
              ) : accessCodeValid && accessCode.length > 0 ? (
                <div className="flex items-center justify-center rounded-full w-[20px] h-[20px] bg-green-500 p-1">
                  <Check className="text-white w-4 h-4" />
                </div>
              ) : accessCodeValid === false && accessCode.length > 0 ? (
                <div className="flex items-center justify-center rounded-full w-[20px] h-[20px] bg-red-500 p-1">
                  <Cross className="text-white w-4 h-4" />
                </div>
              ) : null
            }
          />
        </div>

        {/* Domain */}
        <div className="space-y-2 col-span-2">
          <label
            htmlFor="domain"
            className="text-sm font-medium text-default-700 flex items-center gap-2"
          >
            <Icon icon="heroicons:globe-alt" className="h-4 w-4" />
            Domain
          </label>
          <div className="relative flex flex-row">
            <Input
              className="relative flex-1 "
              formNoValidate
              id="domain"
              isRequired
              maxLength={30}
              errorMessage={errors.subdomain}
              isInvalid={!!errors.subdomain || domainValid === false}
              placeholder="Enter domain"
              radius="lg"
              size="lg"
              type="text"
              value={data.subdomain || ""}
              variant="bordered"
              onChange={handleDomainChange}
              endContent={
                validatingDomain ? (
                  <Spinner size="sm" />
                ) : domainValid && data.subdomain?.length !== 0 ? (
                  <div className="flex items-center justify-center rounded-full w-[20px] h-[20px] bg-green-500 p-1">
                    <Check className="text-white w-4 h-4" />
                  </div>
                ) : domainValid === false && data.subdomain?.length !== 0 ? (
                  <div className="flex items-center justify-center rounded-full w-[20px] h-[20px] bg-red-500 p-1">
                    <Cross1Icon className="text-white w-4 h-4" />
                  </div>
                ) : null
              }
            />

            <div
              className={`max-w-[390px] select-none position-absolute absolute right-12 top-1/2 -translate-y-1/2 text-sm font-bold ${domainValid === false ? "text-red-500" : "text-green-500"} ${errors.subdomain && "-mt-3"}`}
            >
              {`${data.subdomain || "your_domain"}.${MAIN_DOMAIN}`}
            </div>
          </div>
        </div>

        {/* Server + Timezone */}
        <div className="space-y-2">
          <label
            htmlFor="server"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Icon icon="heroicons:server" className="h-4 w-4" />
            Server
          </label>
          {loadingServers ? (
            <div className="flex items-center justify-center p-4">
              <Spinner size="sm" />
              <span className="ml-2">Loading servers...</span>
            </div>
          ) : (
            <Select
              id="server"
              isRequired
              errorMessage={errors.server_id}
              isInvalid={!!errors.server_id}
              placeholder="Select a server"
              radius="lg"
              size="lg"
              variant="bordered"
              className="max-h-60 overflow-y-auto"
              selectedKeys={data.server_id ? [data.server_id] : []}
              onChange={(e) => handleServerChange(e.target.value)}
            >
              {servers.map((server) => (
                <SelectItem key={server.id} textValue={server.name}>
                  <div className="flex flex-col">
                    <span className="font-medium">{server.name}</span>
                    <span className="text-xs text-default-400">
                      {server.provider} • {server.region}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="time_zone"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Icon icon="heroicons:clock" className="h-4 w-4" />
            Time Zone
          </label>
          {loadingTimezones ? (
            <div className="flex items-center justify-center p-4">
              <Spinner size="sm" />
              <span className="ml-2">Loading timezones...</span>
            </div>
          ) : (
            <Select
              id="time_zone"
              isRequired
              errorMessage={errors.time_zone}
              isInvalid={!!errors.time_zone}
              placeholder="Select a time zone"
              radius="lg"
              size="lg"
              variant="bordered"
              className="max-h-60 overflow-y-auto"
              selectedKeys={data.time_zone ? [data.time_zone] : []}
              onChange={(e) => onChange("time_zone", e.target.value)}
            >
              {timezones.map((timezone) => (
                <SelectItem key={timezone}>{timezone}</SelectItem>
              ))}
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}
