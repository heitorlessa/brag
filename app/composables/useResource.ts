import type { Ref } from "vue";

export interface ResourceState<T> {
  items: Ref<T[]>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
  refresh: () => Promise<void>;
}

/**
 * Reactive list-resource wrapper: loads on mount, exposes loading/error state,
 * and a `refresh()` to re-run the loader after mutations. The shared base for
 * every module's `use<Entity>` composable.
 */
export function useResource<T>(loader: () => Promise<T[]>): ResourceState<T> {
  const items = ref<T[]>([]) as Ref<T[]>;
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  async function refresh(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      items.value = await loader();
    } catch (caught) {
      error.value =
        caught instanceof Error ? caught : new Error(String(caught));
      console.error("[useResource] load failed:", caught);
    } finally {
      isLoading.value = false;
    }
  }

  onMounted(refresh);

  return { items, isLoading, error, refresh };
}
