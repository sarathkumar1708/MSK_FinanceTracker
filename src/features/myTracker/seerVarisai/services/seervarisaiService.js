
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
// FETCH ALL SEERVARISAI DATA
// ============================================

async function fetchSeervarisaiData() {
    const user = await getCurrentUser();

    const [familiesResult, membersResult, transactionsResult] =
        await Promise.all([
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

    return {
        families: familiesResult.data || [],
        members: membersResult.data || [],
        transactions: transactionsResult.data || [],
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

    const { data, error } = await supabase
        .from("seervarisai_transactions")
        .insert({
            user_id: user.id,
            member_id: transactionData.member_id,
            transaction_type: transactionData.transaction_type,
            offering_type: transactionData.offering_type || "CASH",
            title: transactionData.title,

            amount_minor: transactionData.amount_minor ?? null,
            gold_grams: transactionData.gold_grams ?? null,
            item_count: transactionData.item_count ?? null,

            transaction_date: transactionData.transaction_date,
            remarks: transactionData.remarks || null,
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}



async function updateTransaction(transactionId, transactionData) {
    const user = await getCurrentUser();

    const { data, error } = await supabase
        .from("seervarisai_transactions")
        .update({
            member_id: transactionData.member_id,
            transaction_type: transactionData.transaction_type,
            offering_type: transactionData.offering_type || "CASH",
            title: transactionData.title,

            amount_minor: transactionData.amount_minor ?? null,
            gold_grams: transactionData.gold_grams ?? null,
            item_count: transactionData.item_count ?? null,

            transaction_date: transactionData.transaction_date,
            remarks: transactionData.remarks || null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) throw error;

    return data;
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
