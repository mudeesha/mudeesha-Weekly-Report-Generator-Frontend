module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './providers/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'selector',
  theme: {
    container: { center: true, padding: '1.5rem', screens: { '2xl': '1280px' } },
    extend: {
      screens: { desktop: '990px' },
      colors: {
        background: 'var(--background)', foreground: 'var(--foreground)', card: 'var(--card)', 'card-foreground': 'var(--card-foreground)', popover: 'var(--popover)', 'popover-foreground': 'var(--popover-foreground)', primary: 'var(--primary)', 'primary-foreground': 'var(--primary-foreground)', secondary: 'var(--secondary)', 'secondary-foreground': 'var(--secondary-foreground)', muted: 'var(--muted)', 'muted-foreground': 'var(--muted-foreground)', accent: 'var(--accent)', 'accent-foreground': 'var(--accent-foreground)', destructive: 'var(--destructive)', input: 'var(--input)', ring: 'var(--ring)', 'chart-1': 'var(--chart-1)', 'chart-2': 'var(--chart-2)', 'chart-3': 'var(--chart-3)', 'chart-4': 'var(--chart-4)', 'chart-5': 'var(--chart-5)', 'destructive-foreground': 'var(--destructive-foreground)',
        brand: { 25: '#FBFAFE', 50: '#F4F1FB', 100: '#ECE8F7', 200: '#DCD6EE', 300: '#BEB7D8', 400: '#8878C1', 500: '#6D60BD', 600: '#594DBA', 700: '#463C98', 800: '#342C79', 900: '#272163', 950: '#1D194C' },
        gray: { 25: '#FCFCFD', 50: '#F9F8FB', 100: '#F0EEF4', 200: '#E7E5EB', 300: '#D9D8E0', 400: '#A9A3B3', 500: '#817A92', 600: '#655E79', 700: '#544C74', 800: '#3E3759', 900: '#2D2A44', 950: '#1B1A2B', dark: '#171724' },
        success: { 25: '#F5FCF8', 50: '#E9F8F0', 100: '#D2F0E1', 200: '#ABE1C7', 500: '#52C58D', 600: '#2DAA72', 700: '#21845A' },
        warning: { 25: '#FFF9F5', 50: '#FFF1E8', 100: '#FFE0CE', 500: '#FF806C', 600: '#EA6D58', 700: '#C55242' },
        error: { 25: '#FFF8F9', 50: '#FFF0F2', 100: '#FADADF', 500: '#EF6372', 600: '#D94A5B', 700: '#B93A49' },
        border: '#E7E5EB', sidebar: '#272163', 'sidebar-foreground': '#FFFFFF', 'sidebar-primary': '#8878C1', 'sidebar-primary-foreground': '#FFFFFF', 'sidebar-accent': '#594DBA', 'sidebar-accent-foreground': '#FFFFFF', 'sidebar-border': '#393275', 'sidebar-ring': '#8878C1'
      },
      fontFamily: {
        sans: ['Arial', '"Helvetica Neue"', 'Helvetica', 'sans-serif'],
        heading: ['Arial', '"Helvetica Neue"', 'Helvetica', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace']
      },
      fontSize: { 'title-md': ['26px', '32px'], 'title-sm': ['22px', '28px'], 'theme-xl': ['18px', '26px'], 'theme-sm': ['13px', '19px'], 'theme-xs': ['11px', '16px'] },
      boxShadow: { 'theme-xs': '0 1px 2px rgba(37,32,80,.04)', 'theme-sm': '0 4px 10px rgba(37,32,80,.05)', 'theme-md': '0 6px 16px rgba(37,32,80,.06)', 'theme-lg': '0 10px 24px rgba(37,32,80,.10)' },
      borderRadius: { '2xl': '12px', '3xl': '16px' }
    }
  }
}
