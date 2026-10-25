"use client";

import { useCallback, useId } from "react";
import type { KeyboardEvent } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import clsx from "clsx";
import styles from "./SearchInput.module.scss";

export interface SearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: (value: string) => void;
  onClear?: () => void;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function SearchInput({
  value,
  onValueChange,
  placeholder = "Search\u2026",
  onSubmit,
  onClear,
  ariaLabel = "Search",
  disabled = false,
  className,
  id,
}: SearchInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const showClear = value.length > 0 && !disabled;

  const handleClear = useCallback(() => {
    onValueChange("");
    onClear?.();
  }, [onValueChange, onClear]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit?.(value);
    }
  };

  const clearButton = showClear ? (
    <button
      type="button"
      className={styles.clearButton}
      aria-label="Clear search"
      onClick={handleClear}
    >
      <X aria-hidden="true" />
    </button>
  ) : null;

  return (
    <div className={clsx(styles.wrapper, showClear && styles.hasClear, className)}>
      <Input
        id={inputId}
        type="search"
        inputSize="md"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        leadingIcon={<Search aria-hidden="true" />}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className={styles.input}
      />
      {clearButton}
    </div>
  );
}
