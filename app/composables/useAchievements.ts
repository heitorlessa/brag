import {
  type AchievementInput,
  createAchievement,
  listAchievements,
  removeAchievement,
  updateAchievement,
} from "~/services/achievements";

export function useAchievements() {
  const state = useResource(listAchievements);

  async function create(input: AchievementInput): Promise<void> {
    await createAchievement(input);
    await state.refresh();
  }

  async function update(
    id: string,
    patch: Partial<AchievementInput>
  ): Promise<void> {
    await updateAchievement(id, patch);
    await state.refresh();
  }

  async function remove(id: string): Promise<void> {
    await removeAchievement(id);
    await state.refresh();
  }

  return {
    achievements: state.items,
    isLoading: state.isLoading,
    error: state.error,
    refresh: state.refresh,
    create,
    update,
    remove,
  };
}
