import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// Stitch Design Tokens - The Digital Sommelier
// Typography: Newsreader (serif for headings) + Plus Jakarta Sans (sans-serif for UI)
class AppTypography {
  static TextTheme lightTextTheme() {
    // Headings - Newsreader (serif)
    final headings = GoogleFonts.newsreaderTextTheme();
    // Body/UI - Plus Jakarta Sans (sans-serif)
    final body = GoogleFonts.plusJakartaSansTextTheme();

    return TextTheme(
      // Display - Newsreader for premium feel
      displayLarge: headings.displayLarge?.copyWith(
        fontWeight: FontWeight.w600,
        letterSpacing: -0.02,
      ),
      displayMedium: headings.displayMedium?.copyWith(
        fontWeight: FontWeight.w600,
        letterSpacing: -0.01,
      ),
      displaySmall: headings.displaySmall?.copyWith(
        fontWeight: FontWeight.w500,
      ),
      // Headlines - Newsreader
      headlineLarge:
          headings.headlineLarge?.copyWith(fontWeight: FontWeight.w600),
      headlineMedium:
          headings.headlineMedium?.copyWith(fontWeight: FontWeight.w500),
      headlineSmall:
          headings.headlineSmall?.copyWith(fontWeight: FontWeight.w500),
      // Titles - Plus Jakarta Sans (clean UI)
      titleLarge: body.titleLarge?.copyWith(fontWeight: FontWeight.w600),
      titleMedium: body.titleMedium?.copyWith(fontWeight: FontWeight.w600),
      titleSmall: body.titleSmall?.copyWith(fontWeight: FontWeight.w600),
      // Body - Plus Jakarta Sans
      bodyLarge: body.bodyLarge?.copyWith(fontWeight: FontWeight.w400),
      bodyMedium: body.bodyMedium?.copyWith(fontWeight: FontWeight.w400),
      bodySmall: body.bodySmall?.copyWith(fontWeight: FontWeight.w400),
      // Labels - Plus Jakarta Sans
      labelLarge: body.labelLarge?.copyWith(fontWeight: FontWeight.w600),
      labelMedium: body.labelMedium?.copyWith(fontWeight: FontWeight.w500),
      labelSmall: body.labelSmall?.copyWith(fontWeight: FontWeight.w500),
    );
  }
}
