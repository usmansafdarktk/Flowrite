module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{tsx,ts,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "rgb(8, 38, 54)",
          100: "rgb(8, 45, 65)",
          200: "rgb(8, 53, 76)",
          300: "rgb(8, 62, 89)",
          400: "rgb(6, 75, 107)",
          500: "rgb(0, 93, 133)",
          600: "rgb(104, 221, 253)",
          700: "rgb(138, 232, 255)",
          800: "rgb(46, 200, 238)",
          900: "rgb(234, 248, 255)",
        },
        neutral: {
          0: "rgb(3, 7, 18)",
          50: "rgb(17, 24, 39)",
          100: "rgb(31, 41, 55)",
          200: "rgb(55, 65, 81)",
          300: "rgb(75, 85, 99)",
          400: "rgb(107, 114, 128)",
          500: "rgb(156, 163, 175)",
          600: "rgb(209, 213, 219)",
          700: "rgb(229, 231, 235)",
          800: "rgb(243, 244, 246)",
          900: "rgb(249, 250, 251)",
          950: "rgb(255, 255, 255)",
        },
        error: {
          50: "rgb(60, 24, 39)",
          100: "rgb(72, 26, 45)",
          200: "rgb(84, 27, 51)",
          300: "rgb(100, 29, 59)",
          400: "rgb(128, 29, 69)",
          500: "rgb(174, 25, 85)",
          600: "rgb(233, 61, 130)",
          700: "rgb(240, 79, 136)",
          800: "rgb(247, 97, 144)",
          900: "rgb(254, 236, 244)",
        },
        warning: {
          50: "rgb(57, 26, 3)",
          100: "rgb(68, 31, 4)",
          200: "rgb(79, 35, 5)",
          300: "rgb(95, 42, 6)",
          400: "rgb(118, 50, 5)",
          500: "rgb(148, 62, 0)",
          600: "rgb(247, 104, 8)",
          700: "rgb(255, 128, 43)",
          800: "rgb(255, 139, 62)",
          900: "rgb(254, 234, 221)",
        },
        success: {
          50: "rgb(30, 38, 13)",
          100: "rgb(37, 46, 15)",
          200: "rgb(43, 55, 17)",
          300: "rgb(52, 66, 19)",
          400: "rgb(65, 82, 21)",
          500: "rgb(83, 103, 22)",
          600: "rgb(153, 213, 42)",
          700: "rgb(196, 240, 66)",
          800: "rgb(135, 190, 34)",
          900: "rgb(239, 251, 221)",
        },
        "brand-primary": "rgb(104, 221, 253)",
        "default-font": "rgb(249, 250, 251)",
        "subtext-color": "rgb(156, 163, 175)",
        "neutral-border": "rgb(55, 65, 81)",
        black: "rgb(3, 7, 18)",
        "default-background": "rgb(3, 7, 18)",
      },
      fontSize: {
        caption: [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "400",
            letterSpacing: "0em",
          },
        ],
        "caption-bold": [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "500",
            letterSpacing: "0em",
          },
        ],
        body: [
          "14px",
          {
            lineHeight: "20px",
            fontWeight: "400",
            letterSpacing: "0em",
          },
        ],
        "body-bold": [
          "14px",
          {
            lineHeight: "20px",
            fontWeight: "500",
            letterSpacing: "0em",
          },
        ],
        "heading-3": [
          "16px",
          {
            lineHeight: "20px",
            fontWeight: "500",
            letterSpacing: "0em",
          },
        ],
        "heading-2": [
          "20px",
          {
            lineHeight: "24px",
            fontWeight: "500",
            letterSpacing: "0em",
          },
        ],
        "heading-1": [
          "30px",
          {
            lineHeight: "36px",
            fontWeight: "500",
            letterSpacing: "0em",
          },
        ],
        "monospace-body": [
          "14px",
          {
            lineHeight: "20px",
            fontWeight: "400",
            letterSpacing: "0em",
          },
        ],
      },
      fontFamily: {
        caption: '"Public Sans"',
        "caption-bold": '"Public Sans"',
        body: '"Public Sans"',
        "body-bold": '"Public Sans"',
        "heading-3": '"Public Sans"',
        "heading-2": '"Public Sans"',
        "heading-1": '"Public Sans"',
        "monospace-body": "monospace",
      },
      boxShadow: {
        sm: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
        default: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
        md: "0px 4px 16px -2px rgba(0, 0, 0, 0.08), 0px 2px 4px -1px rgba(0, 0, 0, 0.08)",
        lg: "0px 12px 32px -4px rgba(0, 0, 0, 0.08), 0px 4px 8px -2px rgba(0, 0, 0, 0.08)",
        overlay:
          "0px 12px 32px -4px rgba(0, 0, 0, 0.08), 0px 4px 8px -2px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        DEFAULT: "8px",
        lg: "12px",
        full: "9999px",
      },
      container: {
        padding: {
          DEFAULT: "16px",
          sm: "calc((100vw + 16px - 640px) / 2)",
          md: "calc((100vw + 16px - 768px) / 2)",
          lg: "calc((100vw + 16px - 1024px) / 2)",
          xl: "calc((100vw + 16px - 1280px) / 2)",
          "2xl": "calc((100vw + 16px - 1536px) / 2)",
        },
      },
      spacing: {
        112: "28rem",
        144: "36rem",
        192: "48rem",
        256: "64rem",
        320: "80rem",
      },
      screens: {
        mobile: {
          max: "767px",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#ffffff', // body text
            h1: { color: '#ffffff', marginBottom: '1rem !important', marginTop: '1rem !important' },
            h2: { color: '#ffffff', marginBottom: '1rem !important', marginTop: '1rem !important' },
            h3: { color: '#ffffff', marginBottom: '1rem !important', marginTop: '1rem !important' },
            h4: { color: '#ffffff', marginBottom: '1rem !important', marginTop: '1rem !important' },
            a: { color: '#ffffff' },
            th: { color: '#ffffff' },
            strong: { color: '#ffffff' },
            code: { color: '#ffffff' },
            'ul > li::marker': { color: '#ffffff' },
            blockquote: { color: '#ffffff', borderLeftColor: '#ffffff' },
            hr: { marginTop: '1rem !important', marginBottom: '1rem !important' },
          },
        },
      },
    },
    backgroundImage: {
      "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      "gradient-conic":
        "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
    },

  },
  plugins: [require('@tailwindcss/typography'),],
};
