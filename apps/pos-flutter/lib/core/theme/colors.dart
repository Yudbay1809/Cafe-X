import 'package:flutter/material.dart';

// Stitch Design Tokens - The Digital Sommelier
// Colors: Coffee Brown (#361f1a), Terracotta (#a33d23), Forest Green (#032834), Cream (#fdf9f1)
class AppColors {
  // Primary - Coffee Brown
  static const brandPrimary = Color(0xFF361f1a);
  static const brandPrimaryLight = Color(0xFF5a3f37);
  static const brandPrimaryDark = Color(0xFF1a0d0a);

  // Secondary - Terracotta
  static const brandSecondary = Color(0xFFa33d23);
  static const brandSecondaryLight = Color(0xFFc56a4f);
  static const brandSecondaryDark = Color(0xFF6d2312);

  // Accent - Forest Green
  static const accent = Color(0xFF032834);
  static const accentLight = Color(0xFF1a4a52);

  // Surfaces - Cream background
  static const surface = Color(0xFFfdf9f1);
  static const surfaceDark = Color(0xFFf5efe3);
  static const card = Color(0xFFFFFFFF);
  static const cardElevated = Color(0xFFFFFDF9);

  // Text
  static const textPrimary = Color(0xFF1B140F);
  static const textMuted = Color(0xFF7C6A5A);
  static const textLight = Color(0xFFFFFFFF);
  static const textOnSecondary = Color(0xFFfdf9f1);

  // Status
  static const success = Color(0xFF032834); // Forest Green
  static const warning = Color(0xFFc9963c); // Warm amber
  static const danger = Color(0xFFa33d23); // Terracotta

  // Utilities - No 1px borders, use tonal layering
  static const outline = Color(0xFFe8e2da); // Light cream outline
  static const divider = Color(0xFFf0ebe4);
  static const shadow = Color(0x8c361f1a); // Coffee brown shadow tint (55%)

  // Gradients
  static const gradientBrand = LinearGradient(
    colors: [brandPrimary, brandPrimaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const gradientBackground = LinearGradient(
    colors: [surface, surfaceDark],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}
