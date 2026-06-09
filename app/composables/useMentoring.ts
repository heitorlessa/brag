import {
  createPerson,
  listPeople,
  type PersonInput,
  removePerson,
  updatePerson,
} from "~/services/mentoring";

export function useMentoring() {
  const state = useResource(listPeople);

  async function create(input: PersonInput): Promise<void> {
    await createPerson(input);
    await state.refresh();
  }

  async function update(
    id: string,
    patch: Partial<PersonInput>
  ): Promise<void> {
    await updatePerson(id, patch);
    await state.refresh();
  }

  async function remove(id: string): Promise<void> {
    await removePerson(id);
    await state.refresh();
  }

  return {
    people: state.items,
    isLoading: state.isLoading,
    error: state.error,
    refresh: state.refresh,
    create,
    update,
    remove,
  };
}
