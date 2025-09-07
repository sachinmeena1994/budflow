
// Color system using CSS variables from our theme
export const colors = {
  primary: 'hsl(var(--primary))',
  primaryForeground: 'hsl(var(--primary-foreground))',
  secondary: 'hsl(var(--secondary))',
  secondaryForeground: 'hsl(var(--secondary-foreground))',
  accent: 'hsl(var(--accent))',
  accentForeground: 'hsl(var(--accent-foreground))',
  muted: 'hsl(var(--muted))',
  mutedForeground: 'hsl(var(--muted-foreground))',
  destructive: 'hsl(var(--destructive))',
  destructiveForeground: 'hsl(var(--destructive-foreground))',
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  card: 'hsl(var(--card))',
  cardForeground: 'hsl(var(--card-foreground))',
  popover: 'hsl(var(--popover))',
  popoverForeground: 'hsl(var(--popover-foreground))',
  sidebar: 'hsl(var(--sidebar-background))',
  sidebarForeground: 'hsl(var(--sidebar-foreground))',
  ring: 'hsl(var(--ring))',
  
  // Status colors with semantic meaning
  success: 'hsl(var(--success))',
  successForeground: 'hsl(var(--success-foreground))',
  warning: 'hsl(var(--warning))',
  warningForeground: 'hsl(var(--warning-foreground))',
  info: 'hsl(var(--info))',
  infoForeground: 'hsl(var(--info-foreground))'
};

// Status color mapping for reconciliation statuses
export const statusColors = {
  'PERFECT_MATCH': 'success',
  'MISSING_ITEM': 'warning',
  'ATTRIBUTE_MISMATCH': 'warning',
  'MISSING_LAB_DATA': 'info',
  'QUANTITY_MISMATCH': 'warning',
  'NEW_PRODUCT': 'info',
  'BLOCKED_PRODUCT': 'destructive'
};

// Brand specific cannabis colors based on the new palette
export const cannabisColors = {
  // Leaf Green
  'primary-100': '#00461e', 
  // Kief Green
  'secondary-100': '#c4d600',
  // Resin Red
  'accent-100': '#cf4520',
  // Extended palette with lighter/darker variants
  50: 'rgb(var(--cannabis-50))',
  100: 'rgb(var(--cannabis-100))',
  200: 'rgb(var(--cannabis-200))',
  300: 'rgb(var(--cannabis-300))',
  400: 'rgb(var(--cannabis-400))',
  500: 'rgb(var(--cannabis-500))',
  600: 'rgb(var(--cannabis-600))',
  700: 'rgb(var(--cannabis-700))',
  800: 'rgb(var(--cannabis-800))',
  900: 'rgb(var(--cannabis-900))',
};
