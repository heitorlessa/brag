export default defineAppConfig({
  ui: {
    colors: {
      primary: "sky",
      secondary: "green",
      neutral: "slate",
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
