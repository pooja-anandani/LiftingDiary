"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";

interface DatePickerProps {
  selectedDate: string;
}

export default function DatePicker({ selectedDate }: DatePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = new Date(selectedDate + "T00:00:00");

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const iso = date.toISOString().split("T")[0];
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", iso);
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={handleSelect}
      disabled={{ after: today }}
      initialFocus
    />
  );
}
