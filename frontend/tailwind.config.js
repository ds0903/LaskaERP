/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        crm: {
          sidebar:  '#2c3e50',
          primary:  '#3498db',
          'primary-dark': '#2980b9',
          bg:       '#f0f2f5',
          'bg-light': '#f8f9fa',
          success:  '#27ae60',
          danger:   '#e74c3c',
          warning:  '#f39c12',
          border:   '#e0e0e0',
          text:     '#2c3e50',
          muted:    '#7f8c8d',
          subtle:   '#95a5a6',
        },
      },
    },
  },
  plugins: [],
}
