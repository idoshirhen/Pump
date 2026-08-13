const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export function nutritionMarkup(screen) {
  const cards = screen.meals.map((meal) => {
    const state = meal.done ? ' done' : '';
    const action = meal.done ? 'ביטול' : '✓ אכלתי';
    const swap = meal.done ? '' : `<button class="nutrition-action secondary" data-action="swap" data-meal-id="${meal.id}">↻ החלפה</button>`;
    return `<article class="nutrition-meal${state}" data-meal-id="${meal.id}">
      <div class="nutrition-meta"><b>${meal.done ? '✓ ' : ''}${esc(meal.timing)}</b><span>${meal.done ? 'נשמר להיום' : `חלופה ${meal.optionIndex + 1} מתוך ${meal.options.length}`}</span></div>
      <p class="nutrition-label">${esc(meal.label)}</p><h3>${esc(meal.option.title)}</h3><p>${esc(meal.option.detail)}</p>
      <small>כ־${meal.protein} גרם חלבון · כ־${meal.calories} קל׳</small>
      <div class="nutrition-actions">${swap}<button class="nutrition-action primary" data-action="${meal.done ? 'undo' : 'eat'}" data-meal-id="${meal.id}">${action}</button></div>
    </article>`;
  }).join('');
  return `<section class="nutrition-v2" dir="rtl"><p class="kicker">תזונה מותאמת</p><h1>התפריט שלך להיום</h1>
    <section class="nutrition-target"><div><small>נאכלו היום</small><b>${screen.eatenCalories.toLocaleString()} <em>קל׳</em></b></div><div><small>חלבון</small><b>${screen.eatenProtein} <em>גרם</em></b></div></section>
    <div class="nutrition-v2-summary"><span>נותרו היום: <b>${screen.remainingCalories.toLocaleString()} קל׳</b></span><small>${screen.meals.filter((meal) => meal.done).length} מתוך ${screen.meals.length} ארוחות סומנו</small></div>
    <div class="nutrition-v2-list">${cards}</div></section>`;
}

export const nutritionStyles = `
  .nutrition-v2{padding:24px 0 88px;color:#fff}.nutrition-v2 h1{font-size:31px;line-height:1.05;margin:6px 0 20px}.nutrition-target{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:10px}.nutrition-target>div,.nutrition-v2-summary,.nutrition-meal{border:1px solid #2e2e2e;background:#181818;border-radius:17px}.nutrition-target>div{padding:13px}.nutrition-target small,.nutrition-v2-summary small,.nutrition-meal small{color:#aaa}.nutrition-target b{display:block;font-size:22px;margin-top:4px}.nutrition-target em{font-size:11px;font-style:normal;color:#aaa}.nutrition-v2-summary{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 14px;margin-bottom:16px;font-size:12px}.nutrition-v2-summary b{color:#ff8a3d}.nutrition-v2-list{display:grid;gap:11px}.nutrition-meal{padding:15px}.nutrition-meal.done{border-color:#27bd67;background:linear-gradient(135deg,#16261a,#181818)}.nutrition-meta{display:flex;justify-content:space-between;gap:8px}.nutrition-meta b{font-size:14px}.nutrition-meal.done .nutrition-meta b{color:#7ee4a5}.nutrition-meta span{color:#aaa;font-size:12px}.nutrition-label{margin:11px 0 4px;color:#ff9855;font-size:12px}.nutrition-meal h3{font-size:19px;margin:0 0 6px}.nutrition-meal p:not(.nutrition-label){margin:0 0 9px;color:#b7b7b7;font-size:14px;line-height:1.45}.nutrition-actions{display:flex;gap:8px;margin-top:14px}.nutrition-action{border:0;border-radius:11px;padding:11px 12px;font:inherit;font-weight:800;flex:1}.nutrition-action.primary{background:#ff6b00;color:white}.nutrition-action.secondary{background:#292929;color:white}.nutrition-action:disabled{opacity:.6}`;

export function mountNutritionView({ root, controller, onError = () => {} }) {
  let busy = false;
  const render = () => { root.innerHTML = nutritionMarkup(controller.view()); };
  root.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button || busy) return;
    busy = true;
    root.querySelectorAll('[data-action]').forEach((item) => { item.disabled = true; });
    try {
      const mealId = button.dataset.mealId;
      if (button.dataset.action === 'swap') await controller.swap(mealId);
      if (button.dataset.action === 'eat') await controller.eat(mealId);
      if (button.dataset.action === 'undo') await controller.undo(mealId);
      render();
    } catch (error) { onError(error); render(); }
    finally { busy = false; }
  });
  render();
  return { render };
}
