import { buildNutritionPlan } from '../domain/nutrition.js';
import { calculateNutritionTargets } from '../domain/targets.js';
import { createNutritionController } from '../nutrition/controller.js';
import { mountNutritionView, nutritionStyles } from '../nutrition/view.js';

export async function startNutritionScreen({ root, repository, userId, notify = () => {} }) {
  root.innerHTML = '<p class="nutrition-loading">טוענים את התפריט…</p>';
  try {
    const data = await repository.load({ userId });
    if (!data.profile) throw new Error('לא נמצא פרופיל משתמש.');
    const plan = buildNutritionPlan({
      ...calculateNutritionTargets(data.profile),
      diet: data.profile.diet,
      mealPattern: data.profile.meal_pattern
    });
    const controller = createNutritionController({ plan, entries: data.entries, actions: data.actions, repository, userId });
    if (!document.querySelector('#pump-nutrition-v2-styles')) {
      const style = document.createElement('style');
      style.id = 'pump-nutrition-v2-styles';
      style.textContent = nutritionStyles;
      document.head.append(style);
    }
    return mountNutritionView({ root, controller, onError: (error) => notify(error.message || 'לא הצלחנו לעדכן את הארוחה.') });
  } catch (error) {
    root.innerHTML = `<p class="nutrition-load-error">${error.message || 'לא הצלחנו לטעון את התפריט.'}</p>`;
    throw error;
  }
}
