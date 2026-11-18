
import { supabase } from "../../../lib/supabase";

// ============================================
// AUTHENTICATED USER
// ============================================

async function getCurrentUserId() {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    if (!user) throw new Error("User not authenticated.");

    return user.id;
}

// ============================================
// ERROR HANDLER
// ============================================

function throwIfError(error) {
    if (error) throw error;
}

// ============================================
// WEIGHTLOSS JOURNEYS
// ============================================

async function fetchJourneys() {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
        .from("weightloss_journeys")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    throwIfError(error);

    return data ?? [];
}

async function createJourney(payload) {
    const userId = await getCurrentUserId();

    const initialWeight = Number(payload.initial_weight);

    const journeyPayload = {
        ...payload,
        initial_weight: initialWeight,
        last_updated_weight:
            Number(payload.last_updated_weight) || initialWeight,
        status: "pending",
        user_id: userId,
    };

    const { data, error } = await supabase
        .from("weightloss_journeys")
        .insert(journeyPayload)
        .select()
        .single();

    throwIfError(error);

    return data;
}

async function updateJourney(id, payload) {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
        .from("weightloss_journeys")
        .update({
            ...payload,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

    throwIfError(error);

    return data;
}

async function deleteJourney(id) {
    const userId = await getCurrentUserId();

    const { error } = await supabase
        .from("weightloss_journeys")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

    throwIfError(error);

    return id;
}

// ============================================
// WEIGHT TRANSACTIONS
// ============================================

async function fetchWeightTransactions(journeyId = null) {
    const userId = await getCurrentUserId();

    let query = supabase
        .from("weight_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("update_date", { ascending: false });

    if (journeyId) {
        query = query.eq("journey_id", journeyId);
    }

    const { data, error } = await query;

    throwIfError(error);

    return data ?? [];
}

// ============================================
// SYNC LATEST WEIGHT TO JOURNEY
// ============================================

async function syncJourneyLatestWeight(journeyId, userId) {
    const { data: latestTransaction, error: transactionError } =
        await supabase
            .from("weight_transactions")
            .select("weight")
            .eq("journey_id", journeyId)
            .eq("user_id", userId)
            .order("update_date", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

    throwIfError(transactionError);

    // If there are no transactions, use the initial weight.
    let latestWeight = null;

    if (latestTransaction) {
        latestWeight = Number(latestTransaction.weight);
    } else {
        const { data: journey, error: journeyError } = await supabase
            .from("weightloss_journeys")
            .select("initial_weight")
            .eq("id", journeyId)
            .eq("user_id", userId)
            .single();

        throwIfError(journeyError);

        latestWeight = Number(journey.initial_weight);
    }

    const { data: updatedJourney, error: updateError } = await supabase
        .from("weightloss_journeys")
        .update({
            last_updated_weight: latestWeight,
            updated_at: new Date().toISOString(),
        })
        .eq("id", journeyId)
        .eq("user_id", userId)
        .select()
        .single();

    throwIfError(updateError);

    return updatedJourney;
}

// ============================================
// CREATE / UPDATE DAILY WEIGHT
// ============================================

async function saveWeightTransaction(payload) {
    const userId = await getCurrentUserId();

    const transactionPayload = {
        journey_id: payload.journey_id,
        user_id: userId,
        update_date: payload.update_date,
        weight: Number(payload.weight),
        notes: payload.notes || null,
        updated_at: new Date().toISOString(),
    };

    // One entry per journey per date.
    // Saving again for the same date updates that entry.
    const { data: transaction, error } = await supabase
        .from("weight_transactions")
        .upsert(transactionPayload, {
            onConflict: "journey_id,update_date",
        })
        .select()
        .single();

    throwIfError(error);

    // Keep the parent journey's latest weight synchronized.
    const journey = await syncJourneyLatestWeight(
        payload.journey_id,
        userId
    );

    return {
        transaction,
        journey,
    };
}

// ============================================
// DELETE DAILY WEIGHT
// ============================================

async function deleteWeightTransaction(id) {
    const userId = await getCurrentUserId();

    const { data: transaction, error: fetchError } = await supabase
        .from("weight_transactions")
        .select("id, journey_id")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

    throwIfError(fetchError);

    const { error: deleteError } = await supabase
        .from("weight_transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

    throwIfError(deleteError);

    const journey = await syncJourneyLatestWeight(
        transaction.journey_id,
        userId
    );

    return {
        id,
        journey,
    };
}

// ============================================
// EXPORT SERVICE
// ============================================

export const healthService = {
    fetchJourneys,
    createJourney,
    updateJourney,
    deleteJourney,

    fetchWeightTransactions,
    saveWeightTransaction,
    deleteWeightTransaction,
};
