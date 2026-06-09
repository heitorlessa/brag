/**
 * Open a "create" modal when the page is reached with `?new=1` — the mechanism
 * behind the command palette's "New …" actions. Clears the query afterwards so
 * a refresh doesn't reopen it.
 */
export function useCreateIntent(open: () => void): void {
  const route = useRoute();
  const router = useRouter();

  function maybeOpen(): void {
    if (route.query.new) {
      open();
      void router.replace({ query: {} });
    }
  }

  onMounted(maybeOpen);
  watch(() => route.query.new, maybeOpen);
}
