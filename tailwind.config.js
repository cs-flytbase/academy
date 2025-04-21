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
      colors: {
        'fb-bg-dark': '#0B121E',
        'fb-bg-light': '#F0F0F0',
        'fb-surface-1': '#1A212D',
        'fb-surface-2': '#DCDCDC',
        'fb-primary': '#2C7BF2',
        'fb-primary-dark': '#0E61DD',
        'fb-accent': '#FFAB49',
        'fb-accent-strong': '#FA8500',
        'fb-text-high': '#FFFFFF',
        'fb-text-med': '#9AA1AD',
      },
      boxShadow: {
        "custom-dark": "0 4px 30px rgba(0, 0, 0, 0.7)", // Darker and spread shadow
      },
      fontFamily: {
        sans: ["var(--font-atlassian-sans)", "system-ui", "sans-serif"],
      },
    },
  },
};
