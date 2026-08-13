import { createNutritionRepository } from '../data/nutritionRepository.js';
import { createSupabaseRestClient } from '../data/supabaseRestClient.js';
import { startNutritionScreen } from './nutritionScreen.js';

const SUPABASE_URL = 'https://aebysqjymsjepvslidjl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DlOsq6M0Wrwl_9lIH1qvQQ_bKJxwgNg';

export async function mountPumpNutrition({ root, notify }) {
  const client = createSupabaseRestClient({ url: SUPABASE_URL, publishableKey: SUPABASE_KEY });
  const userId = client.userId();
  if (!userId) throw new Error('יש להתחבר מחדש לפני פתיחת התזונה.');
  const repository = createNutritionRepository({ request: client.request });
  return startNutritionScreen({ root, repository, userId, notify });
}
