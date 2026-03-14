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
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Inter', 'system-ui', 'sans-serif'],
				'display': ['Playfair Display', 'Georgia', 'serif'],
				'times': ['"Times New Roman"', 'Times', 'serif'],
			},
			fontSize: {
				'13pt': '13pt',
			},
			letterSpacing: {
				'tight': '-0.025em',
				'tighter': '-0.05em',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))',
					muted: 'hsl(var(--warning-muted))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'float-particle': {
					'0%, 100%': { 
						transform: 'translate(0, 0) scale(1)',
						opacity: '0'
					},
					'50%': { 
						transform: 'translate(-20px, -100px) scale(1.5)',
						opacity: '1'
					}
				},
				'scan-down': {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(1000%)' }
				},
				'pulse-shield': {
					'0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
					'50%': { opacity: '0.4', transform: 'scale(1.02)' }
				},
				'pulse-glow': {
					'0%, 100%': { opacity: '0.5', filter: 'blur(20px)' },
					'50%': { opacity: '0.8', filter: 'blur(30px)' }
				},
				'shield-appear': {
					'0%': { opacity: '0', transform: 'scale(0.8)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.8)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'slide-in': {
					'0%': { transform: 'translateY(-20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'matrix-fall': {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(100vh)' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'float-card': {
					'0%, 100%': { transform: 'translateY(0px) rotate3d(1,1,0,0deg)' },
					'50%': { transform: 'translateY(-12px) rotate3d(1,1,0,3deg)' }
				},
				'stagger-fade-up': {
					from: { opacity: '0', transform: 'translateY(30px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'gradient-shift': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'timeline-grow': {
					from: { transform: 'scaleX(0)' },
					to: { transform: 'scaleX(1)' }
				},
				'scroll-reveal': {
					from: { opacity: '0', transform: 'translateY(40px) scale(0.97)' },
					to: { opacity: '1', transform: 'translateY(0) scale(1)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float-particle': 'float-particle 4s ease-in-out infinite',
				'scan-down': 'scan-down 2s linear infinite',
				'pulse-shield': 'pulse-shield 2s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'shield-appear': 'shield-appear 0.5s ease-out forwards',
				'scale-in': 'scale-in 0.3s ease-out forwards',
				'slide-in': 'slide-in 0.5s ease-out forwards',
				'fade-in': 'fade-in 0.5s ease-out forwards',
				'matrix-fall': 'matrix-fall 5s linear infinite',
				'shimmer': 'shimmer 2s linear infinite',
				'float-card': 'float-card 6s ease-in-out infinite',
				'stagger-fade-up': 'stagger-fade-up 0.7s ease-out forwards',
				'gradient-shift': 'gradient-shift 4s ease infinite',
				'timeline-grow': 'timeline-grow 1.5s ease-out forwards',
				'scroll-reveal': 'scroll-reveal 0.8s ease-out forwards',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
