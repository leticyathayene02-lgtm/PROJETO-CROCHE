"use client";

import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

interface SearchBarProps {
  placeholder?: string;
  paramKey?: string;
  defaultValue?: string;
}

export function SearchBar({
  placeholder = "Buscar...",
  paramKey = "q",
  defaultValue = "",
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(paramKey, value);
      } else {
        params.delete(paramKey);
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams, paramKey]
  );

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={(e) => handleChange(e.target.value)}
        className="h-9 w-64 rounded-lg border border-white/[0.08] bg-white/[0.04] pl-9 pr-4 text-sm text-gray-200 placeholder-gray-600 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
      />
    </div>
  );
}
