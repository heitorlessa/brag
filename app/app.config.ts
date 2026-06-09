export default defineAppConfig({
  ui: {
    colors: {
      primary: "sky",
      secondary: "green",
      neutral: "slate",
    },
    // Lighter, roomier buttons — more horizontal breathing room and a softer
    // radius. Icon-only (square) buttons keep their own compact padding.
    button: {
      slots: { base: "font-medium rounded-lg" },
      variants: {
        size: {
          xs: { base: "px-2 py-1" },
          sm: { base: "px-3 py-1.5" },
          md: { base: "px-4 py-2" },
          lg: { base: "px-5 py-2.5" },
          xl: { base: "px-6 py-3" },
        },
      },
    },
    // Airier cards: softer corners, more breathing room.
    card: {
      slots: {
        root: "rounded-2xl",
        header: "p-5 sm:p-6",
        body: "p-5 sm:p-6",
        footer: "p-5 sm:p-6",
      },
    },
    tooltip: {
      slots: {
        content:
          "bg-[var(--ui-text-highlighted)] text-[var(--ui-bg)] text-xs font-medium px-2.5 py-1 rounded-lg",
      },
    },
    modal: {
      slots: {
        content: "rounded-2xl",
      },
    },
  },
});
