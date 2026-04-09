import 'package:flutter/material.dart';

class AppColors {
  // Brand colors from Figma design
  static const brandPrimary = Color(0xFFE84C3D); // Vivid Coral Red
  static const brandSecondary = Color(0xFF2C3E50); // Deep Midnight Blue
  
  // Surfaces
  static const surface = Color(0xFFF8F9FA); // Off-white app background
  static const surfaceDark = Color(0xFF1E272E); // Dark panels/sidebars
  static const card = Color(0xFFFFFFFF);
  
  // Text
  static const textPrimary = Color(0xFF2D3436);
  static const textMuted = Color(0xFF636E72);
  static const textLight = Color(0xFFFFFFFF);
  
  // Status
  static const success = Color(0xFF2ECC71); // Emerald Green
  static const warning = Color(0xFFF1C40F); // Sunflower Yellow
  static const danger = Color(0xFFE74C3C); // Alizarin Red
  
  // Utilities
  static const outline = Color(0xFFDFE6E9);
  static const divider = Color(0xFFF1F2F6);

  static const gradientBrand = LinearGradient(
    colors: [brandPrimary, Color(0xFFFF7675)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const gradientBackground = LinearGradient(
    colors: [surface, surface],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
