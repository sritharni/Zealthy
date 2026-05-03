"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import styles from "./patient-search.module.css";

type PatientSearchProps = {
  initialValue: string;
  onChange: (value: string) => void;
};

export function PatientSearch({ initialValue, onChange }: PatientSearchProps) {
  const [value, setValue] = useState(initialValue);
  const debounced = useDebouncedValue(value, 300);

  useEffect(() => {
    if (debounced !== initialValue) {
      onChange(debounced);
    }
    // We intentionally only react to debounced value changes; the
    // controlled input above takes care of the typing experience.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className={styles.root}>
      <span className={styles.iconWrap} aria-hidden>
        <Search className={styles.icon} />
      </span>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by name or email..."
        className={styles.input}
        aria-label="Search patients"
      />
    </div>
  );
}
