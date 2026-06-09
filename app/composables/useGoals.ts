import {
  createGoal,
  type GoalInput,
  listGoals,
  removeGoal,
  updateGoal,
} from "~/services/goals";

export function useGoals() {
  const state = useResource(listGoals);

  async function create(input: GoalInput): Promise<void> {
    await createGoal(input);
    await state.refresh();
  }

  async function update(id: string, patch: Partial<GoalInput>): Promise<void> {
    await updateGoal(id, patch);
    await state.refresh();
  }

  async function remove(id: string): Promise<void> {
    await removeGoal(id);
    await state.refresh();
  }

  return {
    goals: state.items,
    isLoading: state.isLoading,
    error: state.error,
    refresh: state.refresh,
    create,
    update,
    remove,
  };
}
