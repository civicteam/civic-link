// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

// Apply oppacity to rgba colors.
function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

module.exports = {
  theme: {
    fontFamily: {
      sans: ["var(--font-family-sans)", "sans"],
    },

    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      fontFamily: { monument: "Monument Extended" },
      borderRadius: { DEFAULT: "32px" },
      animation: {
        "reverse-spin": "reverse-spin 1s linear infinite",
        "pulse-loading": "pulse 1.2s ease-in-out infinite",
      },
      keyframes: {
        "reverse-spin": {
          from: {
            transform: "rotate(360deg)",
          },
        },
      },
      boxShadow: {
        "lp-card":
          "0px 17.5391px 58.4635px rgba(63, 113, 241, 0.21), 29.2318px 46.7708px 58.4635px rgba(255, 85, 167, 0.12)",
        "lp-carousel-image": "3px 3px 12px rgba(86, 154, 255, 0.22)",
      },
      colors: {
        transparent: "transparent",

        // civic brand colors
        primary: withOpacity("--color-primary"),
        textPrimary: withOpacity("--color-primary-text"),
        borderPrimary: withOpacity("--color-primary-border"),
        secondary: withOpacity("--color-secondary"),
        textSecondary: withOpacity("--color-secondary-text"),
        borderSecondary: withOpacity("--color-secondary-border"),
        tertiary: withOpacity("--color-tertiary"),
        textTertiary: withOpacity("--color-tertiary-text"),
        borderTertiary: withOpacity("--color-tertiary-border"),
        quaternary: withOpacity("--color-quaternary"),
        textQuaternary: withOpacity("--color-quaternary-text"),
        borderQuaternary: withOpacity("--color-quaternary-border"),

        // ux colors
        base: withOpacity("--color-base"),
        textBase: withOpacity("--color-base-text"),
        borderBase: withOpacity("--color-base-border"),
        success: withOpacity("--color-success"),
        textSuccess: withOpacity("--color-success-text"),
        borderSuccess: withOpacity("--color-success-border"),
        info: withOpacity("--color-info"),
        textInfo: withOpacity("--color-info-text"),
        borderInfo: withOpacity("--color-info-border"),
        error: withOpacity("--color-error"),
        textError: withOpacity("--color-error-text"),
        borderError: withOpacity("--color-error-border"),
        warning: withOpacity("--color-warning"),
        textWarning: withOpacity("--color-warning-text"),
        borderWarning: withOpacity("--color-warning-border"),
        inactive: withOpacity("--color-inactive"),
        textInactive: withOpacity("--color-inactive-text"),
        borderInactive: withOpacity("--color-inactive-border"),
        delete: withOpacity("--color-delete"),
        textDelete: withOpacity("--color-delete-text"),
        borderDelete: withOpacity("--color-delete-border"),
        textLight: withOpacity("--color-light-text"),
        textLink: withOpacity("--color-link-text"),
        textActive: withOpacity("--color-active-text"),
        menuSelected: withOpacity("--color-selected-menu"),

        textDefault: withOpacity("--color-text"),
        background: withOpacity("--color-background"),
        backgroundHover: withOpacity("--color-background-hover"),
        pageBackground: withOpacity("--color-pageBackground"),

        // TODO remove after reskin
        marine: {
          50: "#FAFAFF",
          100: "#F5F5FF",
          200: "#EBEBFF",
          300: "#DCDBFF",
          400: "#D2D1FF",
          500: "#C7C6FF",
          600: "#6E6BFF",
          700: "#130FFF",
          800: "#0300B8",
          900: "#02005C",
        },
        navy: {
          50: "#EFEFF6",
          100: "#DEDFED",
          200: "#BEBFDA",
          300: "#A0A2CA",
          400: "#8082B7",
          500: "#5F61A5",
          600: "#4B4D86",
          700: "#393A65",
          800: "#252641",
          900: "#082537",
        },
        civic: {
          50: "#6a7a94",
          100: "#60708a",
          200: "#566680",
          300: "#4c5c76",
          400: "#42526c",
          500: "#384862",
          600: "#2e3e58",
          700: "#24344e",
          800: "#1a2a44",
          900: "#10203a",
        },
      },
    },
  },
};
