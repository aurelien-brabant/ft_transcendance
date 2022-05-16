module.exports = {
  content: ["./pages/**/*.tsx", "./components/**/*.tsx", "./context/**/*.tsx"],

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
        bounceBack: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-.5em)" },
        },
        bounceForward: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(.5em)" },
        },
      },
      animation: {
        slowRotateFull: "rotateFull 10s infinite linear",
        blinkSlow: "blink 3s infinite linear",
        fuse: "fuse 3s infinite linear",
        upAndDown: "upAndDown .7s infinite alternate",
        bounceBack: "bounceBack 1s ease-in infinite",
        bounceForward: "bounceForward 1s ease-in infinite",
        "ping-3": "ping 0.5s ease-in 3",
      },
      colors: {
        dark: "#121212",
        primary: "#fb923c",
        "01dp": "#1e1e1e",
        "02dp": "#222222",
        "03dp": "#242424",
        "04dp": "#272727",
      },
    },
  },
  plugins: [],
};
