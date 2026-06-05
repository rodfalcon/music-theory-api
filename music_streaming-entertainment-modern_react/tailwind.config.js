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
