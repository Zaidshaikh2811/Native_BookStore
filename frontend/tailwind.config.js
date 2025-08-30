/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}"
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            // 🎨 Colors
            colors: {
                // Backgrounds
                background: "#F9FAFB",     // Light neutral background
                backgroundAlt: "#FFFFFF",  // Pure white for cards
                surface: "#F3F4F6",        // Subtle gray sections
                surfaceLight: "#E5E7EB",   // Hover/secondary background
                overlay: "rgba(0,0,0,0.5)", // For modal overlays
                divider: "#D1D5DB",        // Light gray dividers

                // Brand palette
                primary: "#2563EB",
                primaryHover: "#1E40AF",
                secondary: "#10B981",
                secondaryHover: "#059669",

                // Accent colors
                accent: "#F59E0B",
                accentHover: "#D97706",

                text: "#111827",
                textMuted: "#6B7280",
                textSubtle: "#9CA3AF",

                // Status
                success: "#16A34A",
                warning: "#FBBF24",
                error: "#DC2626",
                info: "#3B82F6",
            },

            // 🔠 Fonts
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                display: ["Poppins", "sans-serif"],
                mono: ["Fira Code", "monospace"],
            },

            fontSize: {
                xs: ["0.75rem", { lineHeight: "1rem" }],
                sm: ["0.875rem", { lineHeight: "1.25rem" }],
                base: ["1rem", { lineHeight: "1.5rem" }],
                lg: ["1.125rem", { lineHeight: "1.75rem" }],
                xl: ["1.25rem", { lineHeight: "1.75rem" }],
                "2xl": ["1.5rem", { lineHeight: "2rem" }],
                "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
                "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
                "5xl": ["3rem", { lineHeight: "1.2" }],
                "6xl": ["3.75rem", { lineHeight: "1.2" }],
            },

            spacing: {
                18: "4.5rem",
                22: "5.5rem",
                36: "9rem",
                72: "18rem",
                100: "25rem", // Hero banners
            },

            borderRadius: {
                sm: "0.125rem",
                DEFAULT: "0.375rem",
                md: "0.5rem",
                lg: "0.75rem",
                xl: "1rem",
                "2xl": "1.5rem",
                "3xl": "2rem",
                full: "9999px",
            },

            boxShadow: {
                sm: "0 1px 2px rgba(0,0,0,0.05)",
                md: "0 4px 6px rgba(0,0,0,0.1)",
                lg: "0 10px 15px rgba(0,0,0,0.15)",
                xl: "0 20px 25px rgba(0,0,0,0.2)",
                card: "0 8px 20px rgba(0,0,0,0.08)",  // Subtle card shadow
                glow: "0 0 12px rgba(37,99,235,0.5)", // Blue glow for CTAs
            },

            // 🌈 Backgrounds
            backgroundImage: {
                "gradient-hero": "linear-gradient(135deg, #2563EB, #10B981)", // Blue → Green
                "gradient-accent": "linear-gradient(135deg, #F59E0B, #FBBF24)", // Orange → Yellow
            },

            // 🎞 Animations
            keyframes: {
                fadeIn: {
                    "0%": { opacity: 0 },
                    "100%": { opacity: 1 },
                },
                slideUp: {
                    "0%": { transform: "translateY(20px)", opacity: 0 },
                    "100%": { transform: "translateY(0)", opacity: 1 },
                },
                pulseGlow: {
                    "0%, 100%": { boxShadow: "0 0 8px rgba(37,99,235,0.6)" },
                    "50%": { boxShadow: "0 0 18px rgba(37,99,235,0.9)" },
                },
            },
            animation: {
                fadeIn: "fadeIn 0.8s ease-in-out",
                slideUp: "slideUp 0.6s ease-in-out",
                pulseGlow: "pulseGlow 2s infinite",
            },
        },
    },
    plugins: [],
};
