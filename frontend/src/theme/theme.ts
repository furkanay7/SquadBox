/**
 * Social Game Hub - Theme Configuration
 * Design System for Pass & Play Party Games
 */

import { TextStyle, ViewStyle } from 'react-native';

// ==========================================
// Color Palette
// ==========================================
export const colors = {
  // Primary Colors
  primary: {
    main: '#6366F1',      // Indigo - main brand color
    light: '#818CF8',     // Light indigo
    dark: '#4F46E5',      // Dark indigo
    contrast: '#FFFFFF',  // White text on primary
  },

  // Secondary Colors
  secondary: {
    main: '#F59E0B',      // Amber - accent/energy
    light: '#FBBF24',     // Light amber
    dark: '#D97706',      // Dark amber
    contrast: '#1F2937',  // Dark text on secondary
  },

  // Background Colors
  background: {
    primary: '#0F172A',   // Slate 900 - main dark background
    secondary: '#1E293B', // Slate 800 - cards/surfaces
    tertiary: '#334155',  // Slate 700 - elevated surfaces
    overlay: 'rgba(0, 0, 0, 0.7)', // Modal overlays
  },

  // Semantic Colors
  success: {
    main: '#10B981',      // Emerald - correct/right
    light: '#34D399',
    dark: '#059669',
  },

  error: {
    main: '#EF4444',      // Red - wrong/taboo
    light: '#F87171',
    dark: '#DC2626',
  },

  warning: {
    main: '#F59E0B',      // Amber - timer warning
    light: '#FBBF24',
    dark: '#D97706',
  },

  info: {
    main: '#3B82F6',      // Blue - neutral info
    light: '#60A5FA',
    dark: '#2563EB',
  },

  // Text Colors
  text: {
    primary: '#F8FAFC',   // Slate 50 - main text
    secondary: '#CBD5E1', // Slate 300 - muted text
    disabled: '#64748B',  // Slate 500 - disabled text
    inverse: '#0F172A',   // Dark text on light bg
  },

  // Game Specific
  game: {
    tabu: '#EF4444',      // Red for Taboo
    pass: '#6B7280',      // Gray for Pass
    correct: '#10B981',   // Green for Correct
    spy: '#EC4899',       // Pink for Spyfall spy
    location: '#8B5CF6',  // Purple for locations
  },
} as const;

// ==========================================
// Typography
// ==========================================
export const typography = {
  // Font Sizes - optimized for Pass & Play (readable from distance)
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
  } as const,

  // Font Weights
  weight: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    extrabold: '800' as TextStyle['fontWeight'],
  } as const,

  // Line Heights
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  } as const,

  // Letter Spacing
  letterSpacing: {
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
  } as const,
} as const;

// ==========================================
// Spacing Scale
// ==========================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

// ==========================================
// Border Radius
// ==========================================
export const borderRadius = {
  none: 0,
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
} as const;

// ==========================================
// Shadows (for dark theme)
// ==========================================
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
} as const;

// ==========================================
// Game Specific Styles
// ==========================================
export const gameStyles = {
  // Large touch targets for Pass & Play
  touchTarget: {
    minHeight: 64,
    minWidth: 64,
  },

  // Card styles
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.background.secondary,
    ...shadows.md,
  } as ViewStyle,

  // Timer display
  timer: {
    fontSize: typography.size['5xl'],
    fontWeight: typography.weight.extrabold,
    color: colors.text.primary,
  } as TextStyle,

  // Word display (for Tabu)
  wordDisplay: {
    fontSize: typography.size['4xl'],
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  } as TextStyle,

  // Taboo words list
  tabooWord: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.medium,
    color: colors.game.tabu,
    textAlign: 'center',
  } as TextStyle,
} as const;

// ==========================================
// Common Component Styles
// ==========================================
export const commonStyles = {
  // Container with safe padding
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.base,
  } as ViewStyle,

  // Centered content
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  } as ViewStyle,

  // Primary button
  primaryButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    minHeight: gameStyles.touchTarget.minHeight,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.base,
  } as ViewStyle,

  // Primary button text
  primaryButtonText: {
    color: colors.primary.contrast,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
  } as TextStyle,

  // Secondary button
  secondaryButton: {
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    minHeight: gameStyles.touchTarget.minHeight,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  // Secondary button text
  secondaryButtonText: {
    color: colors.text.primary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
  } as TextStyle,

  // Input field
  input: {
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    fontSize: typography.size.base,
    minHeight: gameStyles.touchTarget.minHeight,
  } as TextStyle,

  // Section title
  sectionTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  } as TextStyle,

  // Description text
  description: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed,
  } as TextStyle,
} as const;

// ==========================================
// Export Theme Object
// ==========================================
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  gameStyles,
  commonStyles,
} as const;

export default theme;
