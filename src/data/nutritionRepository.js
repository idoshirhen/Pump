const today = (clock = () => new Date()) => {
  const date = clock();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const keyFor = (mealId) => `nutrition-v2-${mealId}`;

export function createNutritionRepository({ request, clock }) {
  if (typeof request !== 'function') throw new Error('חסר לקוח נתונים לתזונה.');
  const day = () => today(clock);

  return {
    async load({ userId }) {
      const date = day();
      const [profiles, entries, actions] = await Promise.all([
        request(`profiles?select=*&id=eq.${userId}`),
        request(`food_entries?select=id,menu_key,name,calories,protein&user_id=eq.${userId}&date=eq.${date}&menu_key=like.nutrition-v2-*`),
        request(`meal_actions?select=meal_key,status,selected_option&user_id=eq.${userId}&date=eq.${date}&meal_key=like.nutrition-v2-*`)
      ]);
      return { profile: profiles[0] ?? null, entries, actions };
    },

    async markEaten({ userId, meal, optionIndex, option }) {
      const date = day();
      const menuKey = keyFor(meal.id);
      await request(`food_entries?user_id=eq.${userId}&date=eq.${date}&menu_key=eq.${menuKey}`, { method: 'DELETE' });
      const [entry] = await request('food_entries', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: {
          user_id: userId,
          date,
          menu_key: menuKey,
          name: option.title,
          calories: meal.calories,
          protein: meal.protein
        }
      });
      await request('meal_actions?on_conflict=user_id,date,meal_key', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: { user_id: userId, date, meal_key: menuKey, status: 'done', selected_option: optionIndex }
      });
      return entry;
    },

    async saveChoice({ userId, mealId, optionIndex }) {
      const date = day();
      await request('meal_actions?on_conflict=user_id,date,meal_key', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: { user_id: userId, date, meal_key: keyFor(mealId), status: 'planned', selected_option: optionIndex }
      });
    },

    async undo({ userId, mealId, entryId }) {
      const date = day();
      if (entryId) await request(`food_entries?id=eq.${entryId}`, { method: 'DELETE' });
      await request(`meal_actions?user_id=eq.${userId}&date=eq.${date}&meal_key=eq.${keyFor(mealId)}`, { method: 'DELETE' });
    },

    keyFor
  };
}
