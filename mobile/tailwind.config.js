/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            // Custom color palette for bookstore
            colors: {
                // Primary brand colors - warm, literary feel
                brand: {
                    50: '#fef7ed',
                    100: '#fdedd3',
                    200: '#fbd9a5',
                    300: '#f8c06d',
                    400: '#f59e0b',
                    500: '#d97706',
                    600: '#b45309',
                    700: '#92400e',
                    800: '#78350f',
                    900: '#451a03',
                },

                // Secondary colors - deep blues for knowledge/trust
                literary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },

                // Accent colors for categories/genres
                genre: {
                    fiction: '#8b5cf6',
                    mystery: '#1f2937',
                    romance: '#ec4899',
                    scifi: '#06b6d4',
                    history: '#92400e',
                    biography: '#059669',
                },

                // Semantic colors
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
                info: '#3b82f6',

                // Custom neutrals
                paper: '#fefcf3', // Warm white like book pages
                ink: '#1f2937',   // Dark text color
                leather: '#92400e', // Brown like book binding
            },

            // Typography
            fontFamily: {
                // Primary fonts for different use cases
                'primary': ['Inter', 'system-ui', 'sans-serif'],
                'serif': ['Playfair Display', 'Georgia', 'serif'],
                'mono': ['JetBrains Mono', 'Courier New', 'monospace'],
                'body': ['Source Sans Pro', 'system-ui', 'sans-serif'],
            },

            // Custom font sizes
            fontSize: {
                'xs': ['12px', { lineHeight: '16px' }],
                'sm': ['14px', { lineHeight: '20px' }],
                'base': ['16px', { lineHeight: '24px' }],
                'lg': ['18px', { lineHeight: '28px' }],
                'xl': ['20px', { lineHeight: '28px' }],
                '2xl': ['24px', { lineHeight: '32px' }],
                '3xl': ['30px', { lineHeight: '36px' }],
                '4xl': ['36px', { lineHeight: '40px' }],
                '5xl': ['48px', { lineHeight: '1' }],
                '6xl': ['60px', { lineHeight: '1' }],
            },

            // Spacing scale
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },

            // Border radius
            borderRadius: {
                'none': '0',
                'sm': '4px',
                'md': '8px',
                'lg': '12px',
                'xl': '16px',
                '2xl': '24px',
                'full': '9999px',
            },

            // Custom shadows
            boxShadow: {
                'book': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                'floating': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },

            // Animation durations
            transitionDuration: {
                '250': '250ms',
                '350': '350ms',
                '400': '400ms',
            },

            // Custom gradients
            backgroundImage: {
                'brand-gradient': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                'literary-gradient': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                'paper-gradient': 'linear-gradient(180deg, #fefcf3 0%, #fef7ed 100%)',
            },
        },
    },
    plugins: [],
}