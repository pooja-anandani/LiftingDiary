"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface DatePickerProps {
  selectedDate: string;
}

export default function DatePicker({ selectedDate }: DatePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const today = new Date().toISOString().split("T")[0];

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", e.target.value);
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <input
      type="date"
      value={selectedDate}
      max={today}
      onChange={handleChange}
      style={{
        background: "color-mix(in srgb, var(--foreground) 8%, var(--background))",
        color: "var(--foreground)",
        border: "1px solid color-mix(in srgb, var(--foreground) 20%, transparent)",
        borderRadius: "0.375rem",
        padding: "0.375rem 0.75rem",
        fontSize: "0.875rem",
        outline: "none",
        colorScheme: "dark light",
      }}
    />
  );
}
