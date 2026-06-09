import {
  createEnablement,
  type EnablementInput,
  listEnablement,
  removeEnablement,
  updateEnablement,
} from "~/services/enablement";

export function useEnablement() {
  const state = useResource(listEnablement);

  async function create(input: EnablementInput): Promise<void> {
    await createEnablement(input);
    await state.refresh();
  }

  async function update(
    id: string,
    patch: Partial<EnablementInput>
  ): Promise<void> {
    await updateEnablement(id, patch);
    await state.refresh();
  }

  async function remove(id: string): Promise<void> {
    await removeEnablement(id);
    await state.refresh();
  }

  return {
    enablement: state.items,
    isLoading: state.isLoading,
    error: state.error,
    refresh: state.refresh,
    create,
    update,
    remove,
  };
}
