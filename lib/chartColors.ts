// Maps semantic chart color names to CSS custom properties defined in styles/_tokens.scss.
// Pass these tokens to Recharts style props; never hardcode hex values in TSX.

export type ChartColorToken =
  | "primary"
  | "primaryMuted"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "neutralMuted";

export const chartColorTokens: Record<ChartColorToken, string> = {
  primary: "var(--color-primary-500)",
  primaryMuted: "var(--color-primary-300)",
  secondary: "var(--color-secondary-500)",
  accent: "var(--color-accent-500)",
  success: "var(--color-success-500)",
  warning: "var(--color-warning-500)",
  error: "var(--color-error-500)",
  info: "var(--color-info-500)",
  neutral: "var(--color-fg-muted)",
  neutralMuted: "var(--color-fg-subtle)",
};

// Ordered palette for auto-assigning series colors when caller does not specify.
export const chartPalette: ChartColorToken[] = [
  "primary",
  "accent",
  "secondary",
  "success",
  "warning",
  "error",
  "info",
  "primaryMuted",
];

export function resolveChartColor(token: ChartColorToken | string): string {
  if (token in chartColorTokens) {
    return chartColorTokens[token as ChartColorToken];
  }
  // Allow callers to pass a raw CSS custom property string through unchanged.
  return token;
}
