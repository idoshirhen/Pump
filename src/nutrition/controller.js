export function createNutritionController({ plan, entries = [], actions = [], repository, userId }) {
  if (!plan?.meals || !repository || !userId) throw new Error('חסרים נתונים להפעלת התזונה.');
  const selected = new Map(actions.map((action) => [action.meal_key.replace('nutrition-v2-', ''), action.selected_option ?? 0]));
  const saved = new Map(entries.map((entry) => [entry.menu_key.replace('nutrition-v2-', ''), entry]));

  const view = () => {
    const meals = plan.meals.map((meal) => {
      const optionIndex = selected.get(meal.id) ?? 0;
      return { ...meal, optionIndex, option: meal.options[optionIndex], entry: saved.get(meal.id) ?? null, done: saved.has(meal.id) };
    });
    return {
      meals,
      eatenCalories: meals.reduce((sum, meal) => sum + (meal.entry?.calories ?? 0), 0),
      eatenProtein: meals.reduce((sum, meal) => sum + (meal.entry?.protein ?? 0), 0),
      remainingCalories: Math.max(0, plan.totals.calories - meals.reduce((sum, meal) => sum + (meal.entry?.calories ?? 0), 0))
    };
  };

  return {
    view,
    async swap(mealId) {
      const meal = plan.meals.find((item) => item.id === mealId);
      if (!meal || saved.has(mealId)) return view();
      const next = ((selected.get(mealId) ?? 0) + 1) % meal.options.length;
      selected.set(mealId, next);
      await repository.saveChoice({ userId, mealId, optionIndex: next });
      return view();
    },
    async eat(mealId) {
      const meal = plan.meals.find((item) => item.id === mealId);
      if (!meal || saved.has(mealId)) return view();
      const optionIndex = selected.get(mealId) ?? 0;
      const entry = await repository.markEaten({ userId, meal, optionIndex, option: meal.options[optionIndex] });
      saved.set(mealId, entry);
      return view();
    },
    async undo(mealId) {
      const entry = saved.get(mealId);
      if (!entry) return view();
      await repository.undo({ userId, mealId, entryId: entry.id });
      saved.delete(mealId);
      selected.delete(mealId);
      return view();
    }
  };
}
