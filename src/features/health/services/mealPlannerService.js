
import { supabase } from "../../../lib/supabase";

// =====================================================
// AUTHENTICATED USER
// =====================================================

async function getCurrentUser() {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    if (!user) {
        throw new Error("User is not authenticated.");
    }

    return user;
}

// =====================================================
// ERROR HANDLER
// =====================================================

function handleError(error, fallbackMessage) {
    console.error(fallbackMessage, error);

    // Preserve the original Supabase error and its details.
    if (error) {
        throw error;
    }

    throw new Error(fallbackMessage);
}

// =====================================================
// MEAL JOURNEY SERVICES
// =====================================================

export const mealPlannerService = {

    // ---------------------------------------------
    // FETCH ALL JOURNEYS
    // ---------------------------------------------

    async fetchJourneys() {
        try {
            const user = await getCurrentUser();

            const { data, error } = await supabase
                .from("meal_planner_journeys")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;

            return data || [];
        } catch (error) {
            handleError(error, "Unable to fetch meal journeys.");
        }
    },

    // ---------------------------------------------
    // CREATE JOURNEY
    // ---------------------------------------------

    async createJourney(payload) {
        try {
            const user = await getCurrentUser();

            const { data, error } = await supabase
                .from("meal_planner_journeys")
                .insert([
                    {
                        user_id: user.id,
                        journey_name: payload.journey_name,
                        from_date: payload.from_date,
                        to_date: payload.to_date,
                        notes: payload.notes || null,
                        status: payload.status || "active",
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            handleError(error, "Unable to create meal journey.");
        }
    },

    // ---------------------------------------------
    // UPDATE JOURNEY
    // ---------------------------------------------

    async updateJourney({ id, ...payload }) {
        try {
            const user = await getCurrentUser();

            const { data, error } = await supabase
                .from("meal_planner_journeys")
                .update({
                    journey_name: payload.journey_name,
                    from_date: payload.from_date,
                    to_date: payload.to_date,
                    notes: payload.notes || null,
                    status: payload.status,
                })
                .eq("id", id)
                .eq("user_id", user.id)
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            handleError(error, "Unable to update meal journey.");
        }
    },

    // ---------------------------------------------
    // DELETE JOURNEY
    // ---------------------------------------------

    async deleteJourney(id) {
        try {
            const user = await getCurrentUser();

            const { error } = await supabase
                .from("meal_planner_journeys")
                .delete()
                .eq("id", id)
                .eq("user_id", user.id);

            if (error) throw error;

            return id;
        } catch (error) {
            handleError(error, "Unable to delete meal journey.");
        }
    },

    // =================================================
    // MEAL PLAN SERVICES
    // =================================================

    // ---------------------------------------------
    // FETCH MEALS FOR A DATE RANGE
    // Includes individual food items
    // ---------------------------------------------

    async fetchMealPlans({ journeyId, startDate, endDate }) {
        try {
            const user = await getCurrentUser();

            let query = supabase
                .from("meal_plans")
                .select("*")
                .eq("user_id", user.id)
                .eq("journey_id", journeyId)
                .order("meal_date", { ascending: true })
                .order("meal_time", { ascending: true });

            if (startDate) {
                query = query.gte("meal_date", startDate);
            }

            if (endDate) {
                query = query.lte("meal_date", endDate);
            }

            const { data: meals, error } = await query;

            if (error) throw error;

            if (!meals?.length) return [];

            const mealIds = meals.map((meal) => meal.id);

            const { data: foodItems, error: foodError } = await supabase
                .from("meal_food_items")
                .select("*")
                .eq("user_id", user.id)
                .in("meal_plan_id", mealIds)
                .order("created_at", { ascending: true });

            if (foodError) throw foodError;

            return meals.map((meal) => ({
                ...meal,
                food_items: (foodItems || []).filter(
                    (item) => item.meal_plan_id === meal.id
                ),
            }));
        } catch (error) {
            handleError(error, "Unable to fetch meal plans.");
        }
    },

    // ---------------------------------------------
    // CREATE MEAL PLAN
    // ---------------------------------------------

    async createMealPlan(payload) {
        try {
            const user = await getCurrentUser();

            const { data, error } = await supabase
                .from("meal_plans")
                .insert([
                    {
                        user_id: user.id,
                        journey_id: payload.journey_id,
                        meal_date: payload.meal_date,
                        meal_type: payload.meal_type,
                        meal_time: payload.meal_time,
                        notes: payload.notes || null,
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            return {
                ...data,
                food_items: [],
            };
        } catch (error) {
            handleError(error, "Unable to create meal plan.");
        }
    },

    // ---------------------------------------------
    // UPDATE MEAL PLAN
    // ---------------------------------------------

    async updateMealPlan({ id, ...payload }) {
        try {
            const user = await getCurrentUser();

            const { data, error } = await supabase
                .from("meal_plans")
                .update({
                    meal_date: payload.meal_date,
                    meal_type: payload.meal_type,
                    meal_time: payload.meal_time,
                    notes: payload.notes || null,
                })
                .eq("id", id)
                .eq("user_id", user.id)
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            handleError(error, "Unable to update meal plan.");
        }
    },

    // ---------------------------------------------
    // DELETE MEAL PLAN
    // Food items are deleted through ON DELETE CASCADE
    // ---------------------------------------------

    async deleteMealPlan(id) {
        try {
            const user = await getCurrentUser();

            const { error } = await supabase
                .from("meal_plans")
                .delete()
                .eq("id", id)
                .eq("user_id", user.id);

            if (error) throw error;

            return id;
        } catch (error) {
            handleError(error, "Unable to delete meal plan.");
        }
    },

    // =================================================
    // FOOD ITEM SERVICES
    // =================================================

    // ---------------------------------------------
    // ADD FOOD ITEM
    // ---------------------------------------------

    async createFoodItem(payload) {
        try {
            const user = await getCurrentUser();

            const { data, error } = await supabase
                .from("meal_food_items")
                .insert([
                    {
                        user_id: user.id,
                        meal_plan_id: payload.meal_plan_id,
                        food_name: payload.food_name,
                        quantity: payload.quantity,
                        quantity_unit: payload.quantity_unit,
                        calories: payload.calories || 0,
                        protein_g: payload.protein_g || 0,
                        carbs_g: payload.carbs_g || 0,
                        fat_g: payload.fat_g || 0,
                        notes: payload.notes || null,
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            handleError(error, "Unable to add food item.");
        }
    },

    // ---------------------------------------------
    // UPDATE FOOD ITEM
    // ---------------------------------------------

    async updateFoodItem({ id, ...payload }) {
        try {
            const user = await getCurrentUser();

            const { data, error } = await supabase
                .from("meal_food_items")
                .update({
                    food_name: payload.food_name,
                    quantity: payload.quantity,
                    quantity_unit: payload.quantity_unit,
                    calories: payload.calories || 0,
                    protein_g: payload.protein_g || 0,
                    carbs_g: payload.carbs_g || 0,
                    fat_g: payload.fat_g || 0,
                    notes: payload.notes || null,
                })
                .eq("id", id)
                .eq("user_id", user.id)
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            handleError(error, "Unable to update food item.");
        }
    },

    // ---------------------------------------------
    // DELETE FOOD ITEM
    // ---------------------------------------------

    async deleteFoodItem(id) {
        try {
            const user = await getCurrentUser();

            const { error } = await supabase
                .from("meal_food_items")
                .delete()
                .eq("id", id)
                .eq("user_id", user.id);

            if (error) throw error;

            return id;
        } catch (error) {
            handleError(error, "Unable to delete food item.");
        }
    },
};
