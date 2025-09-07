
// Typography definitions to use across the application
export const typography = {
  // Font families
  fonts: {
    sans: 'var(--font-sans)',
    mono: 'var(--font-mono)',
  },
  
  // Font sizes follow a specific scale
  fontSize: {
    xs: 'text-xs', // 0.75rem
    sm: 'text-sm', // 0.875rem
    base: 'text-base', // 1rem
    lg: 'text-lg', // 1.125rem
    xl: 'text-xl', // 1.25rem
    '2xl': 'text-2xl', // 1.5rem
    '3xl': 'text-3xl', // 1.875rem
    '4xl': 'text-4xl', // 2.25rem
    '5xl': 'text-5xl', // 3rem
  },
  
  // Font weights
  fontWeight: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  },
  
  // Line heights
  lineHeight: {
    none: 'leading-none',
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: 'tracking-tighter',
    tight: 'tracking-tight',
    normal: 'tracking-normal',
    wide: 'tracking-wide',
    wider: 'tracking-wider',
  },
};

// Text variants for consistent usage
export const textVariants = {
  h1: `${typography.fontSize['4xl']} ${typography.fontWeight.bold} ${typography.lineHeight.tight}`,
  h2: `${typography.fontSize['3xl']} ${typography.fontWeight.semibold} ${typography.lineHeight.tight}`,
  h3: `${typography.fontSize['2xl']} ${typography.fontWeight.semibold} ${typography.lineHeight.tight}`,
  h4: `${typography.fontSize.xl} ${typography.fontWeight.semibold} ${typography.lineHeight.tight}`,
  h5: `${typography.fontSize.lg} ${typography.fontWeight.semibold} ${typography.lineHeight.tight}`,
  body: `${typography.fontSize.base} ${typography.lineHeight.normal}`,
  bodyLarge: `${typography.fontSize.lg} ${typography.lineHeight.normal}`,
  bodySmall: `${typography.fontSize.sm} ${typography.lineHeight.normal}`,
  caption: `${typography.fontSize.xs} ${typography.lineHeight.normal}`,
  label: `${typography.fontSize.sm} ${typography.fontWeight.medium}`,
};
