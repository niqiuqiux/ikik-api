/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#fbfaf7',
          100: '#f4f1eb',
          200: '#e8e2d8',
          300: '#d8cec0',
          400: '#aa9d8f',
          500: '#7a7066',
          600: '#5f574f',
          700: '#4b453f',
          800: '#332f2b',
          900: '#24211e',
          950: '#171512'
        },
        primary: {
          50: '#fcf6f0',
          100: '#f7e8db',
          200: '#edcfb8',
          300: '#e2ae8c',
          400: '#d58b65',
          500: '#c66f4a',
          600: '#a85a3c',
          700: '#864632',
          800: '#643428',
          900: '#4c2921',
          950: '#271512'
        },
        accent: {
          50: '#f6f7f0',
          100: '#e8eddc',
          200: '#d2dec0',
          300: '#b8ca9d',
          400: '#9caf7c',
          500: '#7f9362',
          600: '#64754d',
          700: '#4e5d3f',
          800: '#3d4933',
          900: '#303a2a',
          950: '#1a2118'
        },
        dark: {
          50: '#fbfaf7',
          100: '#f4f1eb',
          200: '#e8e2d8',
          300: '#d8cec0',
          400: '#a99b8d',
          500: '#786d62',
          600: '#5b5148',
          700: '#403832',
          800: '#2c2621',
          900: '#1f1a17',
          950: '#14110f'
        }
      },
      fontFamily: {
        sans: [
          'var(--font-app)',
          'Tiempos Text',
          'Iowan Old Style',
          'Songti SC',
          'Noto Serif CJK SC',
          'Noto Serif SC',
          'Source Han Serif SC',
          'STSong',
          'SimSun',
          'Georgia',
          'Times New Roman',
          'serif'
        ],
        serif: [
          'var(--font-home-display)',
          'Tiempos Text',
          'Iowan Old Style',
          'Songti SC',
          'Noto Serif CJK SC',
          'Noto Serif SC',
          'Source Han Serif SC',
          'STSong',
          'SimSun',
          'Georgia',
          'Times New Roman',
          'serif'
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        glass: '0 1px 2px rgba(70, 49, 35, 0.08)',
        'glass-sm': '0 1px 1px rgba(70, 49, 35, 0.06)',
        glow: '0 1px 2px rgba(70, 49, 35, 0.10)',
        'glow-lg': '0 2px 6px rgba(70, 49, 35, 0.12)',
        card: '0 1px 2px rgba(70, 49, 35, 0.06)',
        'card-hover': '0 2px 8px rgba(70, 49, 35, 0.08)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #1f1b17 0%, #3b3028 100%)',
        'gradient-dark': 'linear-gradient(135deg, #2c2621 0%, #14110f 100%)',
        'gradient-glass':
          'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'mesh-gradient':
          'linear-gradient(180deg, rgba(255,250,243,0.85) 0%, rgba(247,243,234,0.85) 100%)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
        glow: 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        glow: {
          '0%': { boxShadow: '0 1px 2px rgba(70, 49, 35, 0.08)' },
          '100%': { boxShadow: '0 2px 8px rgba(70, 49, 35, 0.10)' }
        }
      },
      backdropBlur: {
        xs: '2px'
      },
      borderRadius: {
        '4xl': '2rem'
      }
    }
  },
  plugins: []
}
