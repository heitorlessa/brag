import {
  type EnergyReflectionInput,
  listReflections,
  removeReflection,
  upsertReflection,
} from "~/services/energy";

export function useEnergy() {
  const state = useResource(listReflections);

  async function save(input: EnergyReflectionInput): Promise<void> {
    await upsertReflection(input);
    await state.refresh();
  }

  async function remove(id: string): Promise<void> {
    await removeReflection(id);
    await state.refresh();
  }

  return {
    reflections: state.items,
    isLoading: state.isLoading,
    error: state.error,
    refresh: state.refresh,
    save,
    remove,
  };
}
