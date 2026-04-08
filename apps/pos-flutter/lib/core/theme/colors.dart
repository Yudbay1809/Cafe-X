import 'package:flutter/material.dart';

class AppColors {
  static const brandPrimary = Color(0xFF0F766E);
  static const brandSecondary = Color(0xFFC56A35);
  static const surface = Color(0xFFF6F1EB);
  static const surfaceSoft = Color(0xFFEFE7DE);
  static const card = Color(0xFFFFFFFF);
  static const textPrimary = Color(0xFF1B140F);
  static const textMuted = Color(0xFF6F6259);
  static const success = Color(0xFF16A34A);
  static const warning = Color(0xFFF59E0B);
  static const danger = Color(0xFFDC2626);
  static const outline = Color(0xFFE5E7EB);

  static const gradientBrand = LinearGradient(
    colors: [brandPrimary, brandSecondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const gradientBackground = LinearGradient(
    colors: [surface, surfaceSoft],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
