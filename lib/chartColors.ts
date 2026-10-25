// Maps semantic chart color names to CSS custom properties defined in styles/_tokens.scss.
// Pass these tokens to Recharts style props; never hardcode hex values in TSX.

export type ChartColorToken =
  | "primary"
  | "primaryMuted"
  | "primary50"
  | "primary100"
  | "primary700"
  | "secondary"
  | "accent"
  | "success"
  | "success50"
  | "success700"
  | "warning"
  | "warning50"
  | "warning700"
  | "error"
  | "error700"
  | "info"
  | "info50"
  | "info700"
  | "neutral"
  | "neutralMuted";

export const chartColorTokens: Record<ChartColorToken, string> = {
  primary: "var(--color-primary-500)",
  primaryMuted: "var(--color-primary-300)",
  primary50: "var(--color-primary-50)",
  primary100: "var(--color-primary-100)",
  primary700: "var(--color-primary-700)",
  secondary: "var(--color-secondary-500)",
  accent: "var(--color-accent-500)",
  success: "var(--color-success-500)",
  success50: "var(--color-success-50)",
  success700: "var(--color-success-700)",
  warning: "var(--color-warning-500)",
  warning50: "var(--color-warning-50)",
  warning700: "var(--color-warning-700)",
  error: "var(--color-error-500)",
  error700: "var(--color-error-700)",
  info: "var(--color-info-500)",
  info50: "var(--color-info-50)",
  info700: "var(--color-info-700)",
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
