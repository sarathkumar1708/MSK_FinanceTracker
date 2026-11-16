
import { supabase } from "../../../../lib/supabase";

// ============================================
// AUTHENTICATED USER
// ============================================

async function getCurrentUser() {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    if (!user) {
        throw new Error("User not authenticated.");
    }

    return user;
}

// ============================================
// COMMON HELPERS
// ============================================

function cleanText(value) {
    return typeof value === "string" ? value.trim() : value;
}

function prepareOfferings(offerings = [], userId, transactionId) {
    return offerings.map((item) => ({
        user_id: userId,
        transaction_id: transactionId,
        offering_type: item.offering_type,
        amount_minor: item.amount_minor ?? null,
        gold_grams: item.gold_grams ?? null,
        item_count: item.item_count ?? null,
        description: cleanText(item.description) || null,
    }));
}

// ============================================
// 1. PARENT EVENTS
// ============================================

async function fetchEvents() {
    const user = await getCurrentUser();

    const { data, error } = await supabase
        .from("my_events")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) throw error;

    if (!data.length) return [];

    const eventIds = data.map((event) => event.id);

    const { data: instances, error: instanceError } = await supabase
        .from("my_event_instances")
        .select("id, event_id")
        .eq("user_id", user.id)
        .in("event_id", eventIds);

    if (instanceError) throw instanceError;

    const countMap = {};

    (instances || []).forEach((instance) => {
        countMap[instance.event_id] =
            (countMap[instance.event_id] || 0) + 1;
    });

    return data.map((event) => ({
        ...event,
        instance_count: countMap[event.id] || 0,
    }));
}

async function createEvent(eventData) {
    const user = await getCurrentUser();

    const { data, error } = await supabase
        .from("my_events")
        .insert({
            user_id: user.id,
            event_title: cleanText(eventData.event_title),
        })
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        instance_count: 0,
    };
}

async function updateEvent(eventId, eventData) {
    const user = await getCurrentUser();

    const { data, error } = await supabase
        .from("my_events")
        .update({
            event_title: cleanText(eventData.event_title),
            updated_at: new Date().toISOString(),
        })
        .eq("id", eventId)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) throw error;

    return data;
}

async function deleteEvent(eventId) {
    const user = await getCurrentUser();

    const { error } = await supabase
        .from("my_events")
        .delete()
        .eq("id", eventId)
        .eq("user_id", user.id);

    if (error) throw error;

    return eventId;
}

// ============================================
// 2. CHILD EVENTS / EVENT INSTANCES
// ============================================

async function fetchEventInstances(eventId) {
    const user = await getCurrentUser();

    const { data, error } = await supabase
        .from("my_event_instances")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .order("event_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

    if (error) throw error;

    if (!data.length) return [];

    const instanceIds = data.map((item) => item.id);

    const { data: transactions, error: transactionError } =
        await supabase
            .from("my_event_transactions")
            .select("id, event_instance_id")
            .eq("user_id", user.id)
            .in("event_instance_id", instanceIds);

    if (transactionError) throw transactionError;

    const countMap = {};

    (transactions || []).forEach((transaction) => {
        countMap[transaction.event_instance_id] =
            (countMap[transaction.event_instance_id] || 0) + 1;
    });

    return data.map((instance) => ({
        ...instance,
        transaction_count: countMap[instance.id] || 0,
    }));
}

async function createEventInstance(instanceData) {
    const user = await getCurrentUser();

    const { data, error } = await supabase
        .from("my_event_instances")
        .insert({
            user_id: user.id,
            event_id: instanceData.event_id,
            event_title: cleanText(instanceData.event_title),
            celebrated_person:
                cleanText(instanceData.celebrated_person) || null,
            event_date: instanceData.event_date || null,
            remarks: cleanText(instanceData.remarks) || null,
        })
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        transaction_count: 0,
    };
}

async function updateEventInstance(instanceId, instanceData) {
    const user = await getCurrentUser();

    const { data, error } = await supabase
        .from("my_event_instances")
        .update({
            event_title: cleanText(instanceData.event_title),
            celebrated_person:
                cleanText(instanceData.celebrated_person) || null,
            event_date: instanceData.event_date || null,
            remarks: cleanText(instanceData.remarks) || null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", instanceId)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) throw error;

    return data;
}

async function deleteEventInstance(instanceId) {
    const user = await getCurrentUser();

    const { error } = await supabase
        .from("my_event_instances")
        .delete()
        .eq("id", instanceId)
        .eq("user_id", user.id);

    if (error) throw error;

    return instanceId;
}

// ============================================
// 3. EVENT TRANSACTIONS
// ============================================

async function fetchEventTransactions(instanceId) {
    const user = await getCurrentUser();

    const { data, error } = await supabase
        .from("my_event_transactions")
        .select(`
            *,
            my_event_offerings (*)
        `)
        .eq("event_instance_id", instanceId)
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
}

async function createEventTransaction(transactionData) {
    const user = await getCurrentUser();

    const { data: transaction, error } = await supabase
        .from("my_event_transactions")
        .insert({
            user_id: user.id,
            event_instance_id: transactionData.event_instance_id,
            person_name: cleanText(transactionData.person_name),
            location: transactionData.location || null,
            transaction_date:
                transactionData.transaction_date,
            remarks: cleanText(transactionData.remarks) || null,
        })
        .select()
        .single();

    if (error) throw error;

    const offerings = prepareOfferings(
        transactionData.offerings || [],
        user.id,
        transaction.id
    );

    if (offerings.length > 0) {
        const { error: offeringError } = await supabase
            .from("my_event_offerings")
            .insert(offerings);

        if (offeringError) {
            // Remove the transaction if its offerings could not be saved.
            await supabase
                .from("my_event_transactions")
                .delete()
                .eq("id", transaction.id)
                .eq("user_id", user.id);

            throw offeringError;
        }
    }

    return {
        ...transaction,
        my_event_offerings: offerings,
    };
}

async function updateEventTransaction(transactionId, transactionData) {
    const user = await getCurrentUser();

    const { data: transaction, error } = await supabase
        .from("my_event_transactions")
        .update({
            person_name: cleanText(transactionData.person_name),
            transaction_date: transactionData.transaction_date,
            location: transactionData.location || null,
            remarks: cleanText(transactionData.remarks) || null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) throw error;

    // Replace offerings only when the caller supplies an offerings array.
    if (Array.isArray(transactionData.offerings)) {
        const { error: deleteError } = await supabase
            .from("my_event_offerings")
            .delete()
            .eq("transaction_id", transactionId)
            .eq("user_id", user.id);

        if (deleteError) throw deleteError;

        const offerings = prepareOfferings(
            transactionData.offerings,
            user.id,
            transactionId
        );

        if (offerings.length > 0) {
            const { error: insertError } = await supabase
                .from("my_event_offerings")
                .insert(offerings);

            if (insertError) throw insertError;
        }

        return {
            ...transaction,
            my_event_offerings: offerings,
        };
    }

    return transaction;
}

async function deleteEventTransaction(transactionId) {
    const user = await getCurrentUser();

    const { error } = await supabase
        .from("my_event_transactions")
        .delete()
        .eq("id", transactionId)
        .eq("user_id", user.id);

    if (error) throw error;

    return transactionId;
}

// ============================================
// EXPORT SERVICE
// ============================================

const myEventsService = {
    // Parent events
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,

    // Child events
    fetchEventInstances,
    createEventInstance,
    updateEventInstance,
    deleteEventInstance,

    // Transactions
    fetchEventTransactions,
    createEventTransaction,
    updateEventTransaction,
    deleteEventTransaction,
};

export default myEventsService;
