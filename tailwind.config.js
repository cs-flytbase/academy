module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Add other paths if necessary
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      boxShadow: {
        "custom-dark": "0 4px 30px rgba(0, 0, 0, 0.7)", // Darker and spread shadow
      },
      fontFamily: {
        sans: ["var(--font-atlassian-sans)", "system-ui", "sans-serif"],
      },
    },
  },
};
