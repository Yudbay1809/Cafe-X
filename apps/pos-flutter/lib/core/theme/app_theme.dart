import 'package:flutter/material.dart';
import 'colors.dart';
import 'typography.dart';

// Stitch Design Tokens - The Digital Sommelier
// No-Line Rule: No 1px borders - use tonal layering
// Border radius: Full rounded (border-radius: 9999px for buttons)
class AppTheme {
  // Spacing tokens
  static const double spacingXs = 4;
  static const double spacingSm = 8;
  static const double spacingMd = 12;
  static const double spacingLg = 16;
  static const double spacingXl = 24;
  static const double spacing2xl = 32;

  // Border radius tokens
  static const double radiusSm = 8;
  static const double radiusMd = 12;
  static const double radiusLg = 16;
  static const double radiusFull = 9999; // Full rounded for buttons

  // Shadow tokens - coffee-brown tinted (no neumorphic)
  static List<BoxShadow> get cardShadow => [
        BoxShadow(
          color: AppColors.shadow,
          blurRadius: 8,
          offset: const Offset(0, 2),
        ),
      ];

  static List<BoxShadow> get elevatedShadow => [
        BoxShadow(
          color: AppColors.shadow,
          blurRadius: 16,
          offset: const Offset(0, 4),
        ),
      ];

  static ThemeData light() {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.light(
        primary: AppColors.brandPrimary,
        secondary: AppColors.brandSecondary,
        tertiary: AppColors.accent,
        surface: AppColors.surface,
        error: AppColors.danger,
        onPrimary: AppColors.textLight,
        onSecondary: AppColors.textOnSecondary,
      ),
      scaffoldBackgroundColor: AppColors.surface,
      textTheme: AppTypography.lightTextTheme(),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: AppTypography.lightTextTheme().headlineMedium?.copyWith(
              color: AppColors.textPrimary,
            ),
        iconTheme: const IconThemeData(color: AppColors.textPrimary),
      ),
      cardTheme: CardThemeData(
        color: AppColors.card,
        elevation: 0,
        shadowColor: AppColors.shadow,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusMd),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.brandPrimary,
          foregroundColor: AppColors.textLight,
          elevation: 0,
          padding: const EdgeInsets.symmetric(
              horizontal: spacingXl, vertical: spacingLg),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusFull), // Full rounded
          ),
          textStyle: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 16,
            letterSpacing: 0.5,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.brandPrimary,
          side: BorderSide.none, // No-line rule
          padding: const EdgeInsets.symmetric(
              horizontal: spacingXl, vertical: spacingLg),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusFull),
          ),
          textStyle: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceDark,
        contentPadding: const EdgeInsets.symmetric(
            horizontal: spacingLg, vertical: spacingLg),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMd),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMd),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMd),
          borderSide: const BorderSide(color: AppColors.brandPrimary, width: 2),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.divider,
        thickness: 0, // No-line rule - use spacing instead
        space: spacingXl,
      ),
      iconTheme: const IconThemeData(
        color: AppColors.textPrimary,
        size: 24,
      ),
    );
  }
}
