import 'package:flutter/material.dart';

class AppColors {
  static const brandPrimary = Color(0xFF0F766E);
  static const brandSecondary = Color(0xFF0EA5E9);
  static const surface = Color(0xFFF6F5F2);
  static const surfaceSoft = Color(0xFFE9F5F3);
  static const card = Color(0xFFFFFFFF);
  static const textPrimary = Color(0xFF0F172A);
  static const textMuted = Color(0xFF64748B);
  static const success = Color(0xFF16A34A);
  static const warning = Color(0xFFF59E0B);
  static const danger = Color(0xFFDC2626);
  static const outline = Color(0xFFE2E8F0);

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