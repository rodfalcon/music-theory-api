/** @type {import('tailwindcss').Config} */
module.exports = {
  "darkMode": "class",
  "content": [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  "theme": {
    "extend": {
      "colors": {
        "background": "#000000",
        "surface": "#121212",
        "surfaceHighlight": "#27272a",
        "primary": "#1DB954",
        "primaryHover": "#1ed760",
        "accent": "#7C3AED",
        "accentPink": "#EC4899",
        "textMain": "#FFFFFF",
        "textMuted": "#A1A1AA"
      },
      "keyframes": {
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" }
        }
      },
      "animation": {
        "slide-up": "slide-up 0.25s ease-out"
      },
      "fontFamily": {
        "dm-sans": [
          "DM Sans",
          "sans-serif"
        ],
        "sans": [
          "DM Sans",
          "sans-serif"
        ],
        "display": [
          "Space Grotesk",
          "sans-serif"
        ]
      }
    }
  },
  "plugins": []
};
