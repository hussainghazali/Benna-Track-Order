import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      colors: {
        ali: {
          orange: { 100: "#FFF0E5", 500: "#FA6400", 600: "#E85A00" },
          red: { 700: "#CC3D00" },
          ink: { 900: "#222222", 700: "#444444", 500: "#666666", 400: "#999999" },
          line: { 200: "#EEEEEE", 300: "#DDDDDD" },
          bg: { 0: "#FFFFFF", 100: "#F4F4F4" },
          success: "#00A870",
          warning: "#FAAD14",
          danger: "#D93026",
          info: "#1677FF",
          star: "#FFB400",
          "ai-tint": "#F5F0FF",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Legacy noon-* (remapped to Stripe palette in index.css)
        noon: {
          yellow: "hsl(var(--noon-yellow))",
          dark: "hsl(var(--noon-dark))",
          gray: "hsl(var(--noon-gray))",
          "light-gray": "hsl(var(--noon-light-gray))",
          blue: "hsl(var(--noon-blue))",
          orange: "hsl(var(--noon-orange))",
          red: "hsl(var(--noon-red))",
          green: "hsl(var(--noon-green))",
        },
        // Stripe — explicit token aliases
        stripe: {
          midnight: "hsl(var(--stripe-midnight))",
          slate: "hsl(var(--stripe-slate))",
          ghost: "hsl(var(--stripe-ghost))",
          porcelain: "hsl(var(--stripe-porcelain))",
          powder: "hsl(var(--stripe-powder))",
          stone: "hsl(var(--stripe-stone))",
          violet: "hsl(var(--stripe-violet))",
          "violet-soft": "hsl(var(--stripe-violet-soft))",
          "violet-washed": "hsl(var(--stripe-violet-washed))",
          green: "hsl(var(--stripe-green))",
          orange: "hsl(var(--stripe-orange))",
        },
        "surface-header": "hsl(var(--surface-header))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        card: "var(--shadow-card)",
        feature: "var(--shadow-feature)",
        hover: "var(--shadow-hover)",
        glass: "var(--glass-shadow)",
        "glass-lg": "var(--glass-shadow-lg)",
        "glow-yellow": "var(--shadow-glow-violet)",
        "glow-violet": "var(--shadow-glow-violet)",
      },
      backdropBlur: {
        glass: "var(--glass-blur)",
        "glass-lg": "var(--glass-blur-lg)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-left": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-right": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(83, 58, 253, 0.18)" },
          "50%": { boxShadow: "0 0 30px rgba(83, 58, 253, 0.32)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-left": "slide-left 0.5s ease-out",
        "slide-right": "slide-right 0.5s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        "gradient-shift": "gradient-shift 4s ease infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
