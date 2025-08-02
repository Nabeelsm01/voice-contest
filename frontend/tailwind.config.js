import daisyui from 'daisyui';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        prompt: ["Prompt", "sans-serif"],
      },
      keyframes: {
        fadeInLeft: {
          "0%": { opacity: "0", transform: "translateX(-50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        fadeInRight: {
          "0%": { opacity: "0", transform: "translateX(50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        fadeInLeft: "fadeInLeft 1s ease-in-out forwards",
        fadeInRight: "fadeInRight 1s ease-in-out forwards",
        slowpulse: 'pulse 5s linear infinite',
      },
    },
  },
  plugins: [
    daisyui,
  ],
  experimental: {
    animationDelay: true,
  }
};
