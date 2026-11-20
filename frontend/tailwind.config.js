/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-body)'],
                heading: ['var(--font-heading)'],
            },
        },
    },
    plugins: [],
};
