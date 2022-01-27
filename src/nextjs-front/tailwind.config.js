module.exports = {
  content: ["./pages/**/*.tsx", "./components/**/*.tsx"],
  purge: {
    enabled: true,
    content: ["./pages/**/*.tsx", "./components/**/*.tsx"],
  },

  theme: {
    extend: {
      keyframes: {
        rotateFull: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        blink: {
          "0%,100%": { opacity: ".7" },
          "50%": { opacity: "1" },
        },
        fuse: {
          "0%,100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(2em, -2em)" },
        },
        upAndDown: {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(.05em)" },
        },
      },
      animation: {
        slowRotateFull: "rotateFull 10s infinite linear",
        blinkSlow: "blink 3s infinite linear",
        fuse: "fuse 3s infinite linear",
        upAndDown: "upAndDown .7s infinite alternate",
      },
    },
  },
  plugins: [],
};
