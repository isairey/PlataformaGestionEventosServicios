/** @type {import('tailwindcss').Config} */
module.exports = {
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
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // EventPro Custom Colors
        "event-red": "#EE1133",
        "event-navy": "#1A2B4C",
        "event-white": "#FFFFFF",
        "event-gray": "#F5F5F7",
        "event-charcoal": "#2C3E50",
        "event-blue": "#3498DB",
        // Alternative Reds
        "event-red-vibrant": "#E31837",
        "event-red-classic": "#DC143C",
        "event-red-dark": "#C41230",

        // Original Shadcn Colors
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        Mainfront: ["plusSans", "sense-sarif"],
        Inter: ["inter", "sense-sarif"],
        BeVietnam: ["beVietnam", "sense-sarif"],
        productSans: ["productSans", "sense-sarif"],
      },
      screens: {
        xssm: "375px",
        xxsm: "420px",
        midmid: "455px",
        midsm: "500px",
        midxmid: "560px",
        mlg: "800px",
        midlg: "960px",
        bxl: "1400px",
        xlg: "1445px",
        x2xl: "1650px",
        xmlg: "1760px",
        xmllg: "1840px",
        xxlg: "1900px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
