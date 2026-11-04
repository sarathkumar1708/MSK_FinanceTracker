import categoriesData from "../data/categories.json";

export const TRANSACTIONS_KEY = "daily-transactions";
export const CUSTOM_CATEGORIES_KEY = "custom-transaction-categories";

function safeParse(raw, fallback) {
  try {
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function cloneCategories(categories) {
  return JSON.parse(JSON.stringify(categories));
}

function readCustomCategories() {
  const parsed = safeParse(localStorage.getItem(CUSTOM_CATEGORIES_KEY), {
    expense: [],
    income: []
  });

  return {
    expense: Array.isArray(parsed.expense) ? parsed.expense : [],
    income: Array.isArray(parsed.income) ? parsed.income : []
  };
}

function mergeTypeCategories(baseList, customList) {
  const merged = cloneCategories(baseList);
  const byId = new Map(merged.map((item) => [item.id, item]));

  customList.forEach((custom) => {
    if (custom.isOverlay && byId.has(custom.id)) {
      const target = byId.get(custom.id);
      const existingSubIds = new Set(
        target.subcategories.map((sub) => sub.id)
      );

      (custom.subcategories || []).forEach((sub) => {
        if (!existingSubIds.has(sub.id)) {
          target.subcategories.push(sub);
        }
      });
      return;
    }

    if (!byId.has(custom.id)) {
      const next = {
        id: custom.id,
        name: custom.name,
        subcategories: cloneCategories(custom.subcategories || [])
      };
      merged.push(next);
      byId.set(next.id, next);
    }
  });

  return merged;
}

export function readTransactions() {
  const parsed = safeParse(localStorage.getItem(TRANSACTIONS_KEY), []);
  return Array.isArray(parsed) ? parsed : [];
}

export function saveTransactions(transactions) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

export function readCategories() {
  const custom = readCustomCategories();

  return {
    expense: mergeTypeCategories(categoriesData.expense, custom.expense),
    income: mergeTypeCategories(categoriesData.income, custom.income)
  };
}

export function saveCategories(categories) {
  const baseExpenseIds = new Set(categoriesData.expense.map((item) => item.id));
  const baseIncomeIds = new Set(categoriesData.income.map((item) => item.id));

  const buildCustomList = (type, baseIds) => {
    const baseList = categoriesData[type];
    const list = categories[type] || [];

    const newCategories = list
      .filter((item) => !baseIds.has(item.id))
      .map((item) => ({
        id: item.id,
        name: item.name,
        subcategories: item.subcategories || []
      }));

    const overlays = list
      .filter((item) => baseIds.has(item.id))
      .map((item) => {
        const baseCategory = baseList.find((entry) => entry.id === item.id);
        const baseSubIds = new Set(
          (baseCategory?.subcategories || []).map((sub) => sub.id)
        );
        const addedSubs = (item.subcategories || []).filter(
          (sub) => !baseSubIds.has(sub.id)
        );

        if (!addedSubs.length) return null;

        return {
          id: item.id,
          name: item.name,
          subcategories: addedSubs,
          isOverlay: true
        };
      })
      .filter(Boolean);

    return [...newCategories, ...overlays];
  };

  localStorage.setItem(
    CUSTOM_CATEGORIES_KEY,
    JSON.stringify({
      expense: buildCustomList("expense", baseExpenseIds),
      income: buildCustomList("income", baseIncomeIds)
    })
  );
}

export function createId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
