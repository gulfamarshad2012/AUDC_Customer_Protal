"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function useRemoveSearchParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const removeParam = (key: string) => {
    // new instance banao taake read-only problem na aaye
    const params = new URLSearchParams(searchParams.toString());

    if (params.has(key)) {
      params.delete(key);

      const newQuery = params.toString();
      const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname;

      router.replace(newUrl, { scroll: false });
    }
  };

  return removeParam;
}
