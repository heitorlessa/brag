// Module-level shared state so the rail trigger, the ⌘K shortcut and the
// palette component all read/write the same open flag.
const isOpen = ref(false);

export function useCommandPalette() {
  return {
    isOpen,
    open: () => {
      isOpen.value = true;
    },
    close: () => {
      isOpen.value = false;
    },
    toggle: () => {
      isOpen.value = !isOpen.value;
    },
  };
}
