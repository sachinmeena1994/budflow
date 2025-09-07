
// Centralized export for the design system
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radius';
export * from './shadows';
export * from './transitions';

// Theme composition - combine all design tokens into a theme
export const theme = {
  // Re-export all design tokens
  colors: require('./colors'),
  typography: require('./typography'),
  spacing: require('./spacing'),
  radius: require('./radius'),
  shadows: require('./shadows'),
  transitions: require('./transitions'),
};
