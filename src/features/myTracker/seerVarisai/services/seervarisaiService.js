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
        throw new Error("User is not authenticated.");
    }

    return user;
}

// ============================================
// OFFERING HELPERS
// ============================================

const VALID_OFFERING_TYPES = [
    "CASH",
    "GOLD",
    "SILVER",
    "DRESS",
    "THATTUVARISAI",
];

function normalizeOfferings(transactionData) {
    let sourceOfferings;

    if (Array.isArray(transactionData.offerings)) {
        sourceOfferings = transactionData.offerings;
    } else {
        // Backward compatibility with the original single-offering format.
        sourceOfferings = [{
            offering_type: transactionData.offering_type || "CASH",
            amount_minor: transactionData.amount_minor ?? null,
            gold_grams: transactionData.gold_grams ?? null,
            item_count: transactionData.item_count ?? null,
        }];
    }

    return sourceOfferings.map((item) => {
        const offeringType = item.offering_type || "CASH";

        if (!VALID_OFFERING_TYPES.includes(offeringType)) {
            throw new Error(`Invalid offering type: ${offeringType}`);
        }

        const isMoney =
            offeringType === "CASH" || offeringType === "SILVER";

        const isQuantity =
            offeringType === "DRESS" ||
            offeringType === "THATTUVARISAI";

        return {
            offering_type: offeringType,

            amount_minor: isMoney
                ? item.amount_minor ?? null
                : null,

            gold_grams: offeringType === "GOLD"
                ? item.gold_grams ?? null
                : null,

            item_count: isQuantity
                ? item.item_count ?? null
                : null,
        };
    });
}

function getLegacyOfferingColumns(offerings) {
    const first = offerings[0] || {};

    return {
        offering_type: first.offering_type || "CASH",
        amount_minor: first.amount_minor ?? null,
        gold_grams: first.gold_grams ?? null,
        item_count: first.item_count ?? null,
    };
}

async function insertOfferings(transactionId, offerings) {
    if (!offerings.length) return [];

    const rows = offerings.map((item) => ({
        transaction_id: transactionId,
        offering_type: item.offering_type,
        amount_minor: item.amount_minor ?? null,
        gold_grams: item.gold_grams ?? null,
        item_count: item.item_count ?? null,
    }));

    const { data, error } = await supabase
        .from("seervarisai_transaction_offerings")
        .insert(rows)
        .select();

    if (error) throw error;

    return data || [];
}

function getLegacyOffering(transaction) {
    return [{
        offering_type: transaction.offering_type || "CASH",
        amount_minor: transaction.amount_minor ?? null,
        gold_grams: transaction.gold_grams ?? null,
        item_count: transaction.item_count ?? null,
    }];
}

// ============================================
// FETCH ALL SEERVARISAI DATA
// ============================================

async function fetchSeervarisaiData() {
    const user = await getCurrentUser();

    const [
        familiesResult,
        membersResult,
        transactionsResult,
    ] = await Promise.all([
        supabase
            .from("seervarisai_families")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),

        supabase
            .from("seervarisai_members")
            .select("*")
            .eq("user_id", user.id)
            .order("member_name", { ascending: true }),

        supabase
            .from("seervarisai_transactions")
            .select("*")
            .eq("user_id", user.id)
            .order("transaction_date", { ascending: false })
            .order("created_at", { ascending: false }),
    ]);

    if (familiesResult.error) throw familiesResult.error;
    if (membersResult.error) throw membersResult.error;
    if (transactionsResult.error) throw transactionsResult.error;

    const transactions = transactionsResult.data || [];
    let offeringsByTransaction = {};

    if (transactions.length) {
        const transactionIds = transactions.map((item) => item.id);

        const { data: offeringRows, error: offeringsError } =
            await supabase
                .from("seervarisai_transaction_offerings")
                .select("*")
                .in("transaction_id", transactionIds);

        if (offeringsError) throw offeringsError;

        offeringsByTransaction = (offeringRows || []).reduce(
            (result, offering) => {
                if (!result[offering.transaction_id]) {
                    result[offering.transaction_id] = [];
                }

                result[offering.transaction_id].push(offering);
                return result;
            },
            {}
        );
    }

    const enrichedTransactions = transactions.map((transaction) => {
        const savedOfferings =
            offeringsByTransaction[transaction.id] || [];

        return {
            ...transaction,
            offerings: savedOfferings.length
                ? savedOfferings
                : getLegacyOffering(transaction),
        };
    });

    return {
        families: familiesResult.data || [],
        members: membersResult.data || [],
        transactions: enrichedTransactions,
    };
}

// ============================================
// FAMILY CRUD
// ============================================

async function createFamily(familyData) {
    const user = await getCurrentUser();

    const { data, error } = await supabase
        .from("seervarisai_families")
        .insert({
            user_id: user.id,
            family_name: familyData.family_name,
            family_type: familyData.family_type,
            opening_relations_spent_minor:
                familyData.opening_relations_spent_minor || 0,
            opening_i_spent_minor:
                familyData.opening_i_spent_minor || 0,
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}

async function updateFamily(familyId, familyData) {
    const user = await getCurrentUser();

    const { data, error } = await supabase
        .from("seervarisai_families")
        .update({
            family_name: familyData.family_name,
            family_type: familyData.family_type,
            opening_relations_spent_minor:
                familyData.opening_relations_spent_minor,
            opening_i_spent_minor:
                familyData.opening_i_spent_minor,
            updated_at: new Date().toISOString(),
        })
        .eq("id", familyId)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) throw error;

    return data;
}

async function deleteFamily(familyId) {
    const user = await getCurrentUser();

    const { error } = await supabase
        .from("seervarisai_families")
        .delete()
        .eq("id", familyId)
        .eq("user_id", user.id);

    if (error) throw error;

    return familyId;
}

// ============================================
// MEMBER CRUD
// ============================================

async function createMember(memberData) {
    const user = await getCurrentUser();

    const { data, error } = await supabase
        .from("seervarisai_members")
        .insert({
            user_id: user.id,
            family_id: memberData.family_id,
            member_name: memberData.member_name,
            relationship: memberData.relationship || null,
            remarks: memberData.remarks || null,
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}

async function updateMember(memberId, memberData) {
    const user = await getCurrentUser();

    const { data, error } = await supabase
        .from("seervarisai_members")
        .update({
            member_name: memberData.member_name,
            relationship: memberData.relationship || null,
            remarks: memberData.remarks || null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", memberId)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) throw error;

    return data;
}

async function deleteMember(memberId) {
    const user = await getCurrentUser();

    const { error } = await supabase
        .from("seervarisai_members")
        .delete()
        .eq("id", memberId)
        .eq("user_id", user.id);

    if (error) throw error;

    return memberId;
}

// ============================================
// TRANSACTION CRUD
// ============================================

async function createTransaction(transactionData) {
    const user = await getCurrentUser();

    const offerings = normalizeOfferings(transactionData);
    const legacyColumns = getLegacyOfferingColumns(offerings);

    const { data: transaction, error } = await supabase
        .from("seervarisai_transactions")
        .insert({
            user_id: user.id,
            member_id: transactionData.member_id,
            transaction_type: transactionData.transaction_type,
            ...legacyColumns,
            title: transactionData.title,
            transaction_date: transactionData.transaction_date,
            remarks: transactionData.remarks || null,
        })
        .select()
        .single();

    if (error) throw error;

    try {
        await insertOfferings(transaction.id, offerings);
    } catch (offeringError) {
        // Remove the parent record if child offering insertion fails.
        await supabase
            .from("seervarisai_transactions")
            .delete()
            .eq("id", transaction.id)
            .eq("user_id", user.id);

        throw offeringError;
    }

    return {
        ...transaction,
        offerings,
    };
}

async function updateTransaction(transactionId, transactionData) {
    const user = await getCurrentUser();

    const offerings = normalizeOfferings(transactionData);
    const legacyColumns = getLegacyOfferingColumns(offerings);

    const { data: transaction, error } = await supabase
        .from("seervarisai_transactions")
        .update({
            member_id: transactionData.member_id,
            transaction_type: transactionData.transaction_type,
            ...legacyColumns,
            title: transactionData.title,
            transaction_date: transactionData.transaction_date,
            remarks: transactionData.remarks || null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) throw error;

    const { error: deleteOfferingsError } = await supabase
        .from("seervarisai_transaction_offerings")
        .delete()
        .eq("transaction_id", transactionId);

    if (deleteOfferingsError) throw deleteOfferingsError;

    await insertOfferings(transactionId, offerings);

    return {
        ...transaction,
        offerings,
    };
}

async function deleteTransaction(transactionId) {
    const user = await getCurrentUser();

    const { error } = await supabase
        .from("seervarisai_transactions")
        .delete()
        .eq("id", transactionId)
        .eq("user_id", user.id);

    if (error) throw error;

    return transactionId;
}

// ============================================
// SERVICE EXPORTS
// ============================================

const seervarisaiService = {
    fetchSeervarisaiData,

    createFamily,
    updateFamily,
    deleteFamily,

    createMember,
    updateMember,
    deleteMember,

    createTransaction,
    updateTransaction,
    deleteTransaction,
};

export default seervarisaiService;