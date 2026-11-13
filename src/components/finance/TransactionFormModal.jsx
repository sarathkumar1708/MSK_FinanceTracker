
import { useEffect, useMemo, useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import SelectDropdown from "../common/SelectDropdown";
import { categoryService } from "../../services/categoryService";
import { PAYMENT_MODES } from "../../data/data";
const getToday = () => new Date().toISOString().split("T")[0];

const emptyForm = {
  categoryId: "",
  subcategoryId: "",
  amount: "",
  title: "",
  notes: "",
  date: getToday(),
  paymentMode: "Cash"
};

function isValidAmount(value) {
  if (value === "") return true;
  return /^\d*\.?\d{0,2}$/.test(value);
}

function buildFormFromTransaction(transaction) {
  if (!transaction) {
    return { ...emptyForm };
  }

  return {
    categoryId:
      transaction.categoryId || transaction.category_id || "",
    subcategoryId:
      transaction.subcategoryId || transaction.subcategory_id || "",
    amount:
      transaction.amount === undefined || transaction.amount === null
        ? ""
        : String(transaction.amount),
    title: transaction.title || transaction.description || "",
    notes: transaction.notes || "",
    date: transaction.date || transaction.transaction_date || getToday(),
    paymentMode:
      transaction.paymentMode ||
      transaction.payment_mode ||
      "",
  };
}

function TransactionFormModal({
  open,
  type = "expense",
  initialTransaction = null,
  onClose,
  onSave
}) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");

  const [showCategoryCreate, setShowCategoryCreate] = useState(false);
  const [showSubcategoryCreate, setShowSubcategoryCreate] = useState(false);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(initialTransaction);
  const isExpense = type === "expense";

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === form.categoryId) || null,
    [categories, form.categoryId]
  );

  const subcategories = selectedCategory?.subcategories || [];

  // Load categories from Supabase whenever the modal opens.
  useEffect(() => {
    if (!open) return;

    let active = true;

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        setError("");

        const data = await categoryService.getByType(type);

        if (!active) return;

        setCategories(data || []);
        setForm(buildFormFromTransaction(initialTransaction));
      } catch (err) {
        console.error("Failed to load categories:", err);

        if (active) {
          setError(err.message || "Unable to load categories.");
        }
      } finally {
        if (active) {
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();

    setNewCategoryName("");
    setNewSubcategoryName("");
    setShowCategoryCreate(false);
    setShowSubcategoryCreate(false);

    return () => {
      active = false;
    };
  }, [open, type, initialTransaction]);

  const handleAmountChange = (event) => {
    const { value } = event.target;

    if (!isValidAmount(value)) return;

    setForm((prev) => ({
      ...prev,
      amount: value
    }));
  };

  // Create a category in Supabase.
  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();

    if (!name) {
      setError("Enter a category name.");
      return;
    }

    const exists = categories.some(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      setError("That category already exists.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const category = await categoryService.create(name, type);

      setCategories((prev) => [...prev, category]);

      setForm((prev) => ({
        ...prev,
        categoryId: category.id,
        subcategoryId: ""
      }));

      setNewCategoryName("");
      setShowCategoryCreate(false);
    } catch (err) {
      console.error("Failed to create category:", err);
      setError(err.message || "Unable to create category.");
    } finally {
      setSaving(false);
    }
  };

  // Create a subcategory in Supabase.
  const handleCreateSubcategory = async () => {
    if (!selectedCategory) {
      setError("Select a category first.");
      return;
    }

    const name = newSubcategoryName.trim();

    if (!name) {
      setError("Enter a subcategory name.");
      return;
    }

    const exists = subcategories.some(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      setError("That subcategory already exists.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const subcategory = await categoryService.createSubcategory(
        name,
        selectedCategory.id
      );

      setCategories((prev) =>
        prev.map((category) =>
          category.id === selectedCategory.id
            ? {
              ...category,
              subcategories: [
                ...(category.subcategories || []),
                subcategory
              ]
            }
            : category
        )
      );

      setForm((prev) => ({
        ...prev,
        subcategoryId: subcategory.id
      }));

      setNewSubcategoryName("");
      setShowSubcategoryCreate(false);
    } catch (err) {
      console.error("Failed to create subcategory:", err);
      setError(err.message || "Unable to create subcategory.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.categoryId) {
      setError("Select a category.");
      return;
    }

    if (subcategories.length > 0 && !form.subcategoryId) {
      setError("Select a subcategory.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }

    if (!form.title.trim()) {
      setError("Enter a transaction title.");
      return;
    }

    if (!form.date) {
      setError("Select a transaction date.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await onSave?.({
        id: initialTransaction?.id,
        type,
        categoryId: form.categoryId,
        subcategoryId: form.subcategoryId,
        amount: Number(form.amount),
        title: form.title.trim(),
        notes: form.notes.trim(),
        date: form.date,
        paymentMode: form.paymentMode,
      });
    } catch (err) {
      console.error("Failed to save transaction:", err);
      setError(err.message || "Unable to save transaction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        isEditing
          ? isExpense
            ? "Edit Expense"
            : "Edit Income"
          : isExpense
            ? "Add Expense"
            : "Add Income"
      }
      onClose={onClose}
    >
      <form className="transaction-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="category">Category</label>

          <div className="field-with-action">
            <SelectDropdown
              id="category"
              value={form.categoryId}
              placeholder={
                loadingCategories
                  ? "Loading categories..."
                  : "Select category"
              }
              visibleCount={6}
              options={categories.map((category) => ({
                value: category.id,
                label: category.name
              }))}
              onChange={(categoryId) =>
                setForm((prev) => ({
                  ...prev,
                  categoryId,
                  subcategoryId: ""
                }))
              }
            />

            <Button
              type="button"
              variant="secondary"
              disabled={saving || loadingCategories}
              onClick={() => {
                setShowCategoryCreate((prev) => !prev);
                setShowSubcategoryCreate(false);
                setError("");
              }}
            >
              Create category
            </Button>
          </div>

          {showCategoryCreate && (
            <div className="inline-create">
              <input
                type="text"
                placeholder="New category name"
                value={newCategoryName}
                onChange={(event) =>
                  setNewCategoryName(event.target.value)
                }
              />

              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={handleCreateCategory}
              >
                Add
              </Button>
            </div>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="subcategory">SubCategory</label>

          <div className="field-with-action">
            <SelectDropdown
              id="subcategory"
              value={form.subcategoryId}
              placeholder="Select subcategory"
              disabled={!form.categoryId}
              visibleCount={6}
              options={subcategories.map((subcategory) => ({
                value: subcategory.id,
                label: subcategory.name
              }))}
              onChange={(subcategoryId) =>
                setForm((prev) => ({
                  ...prev,
                  subcategoryId
                }))
              }
            />

            <Button
              type="button"
              variant="secondary"
              disabled={!form.categoryId || saving}
              onClick={() => {
                setShowSubcategoryCreate((prev) => !prev);
                setShowCategoryCreate(false);
                setError("");
              }}
            >
              Create subcategory
            </Button>
          </div>

          {showSubcategoryCreate && (
            <div className="inline-create">
              <input
                type="text"
                placeholder="New subcategory name"
                value={newSubcategoryName}
                onChange={(event) =>
                  setNewSubcategoryName(event.target.value)
                }
              />

              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={handleCreateSubcategory}
              >
                Add
              </Button>
            </div>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="transactionDate">Transaction Date</label>

          <input
            id="transactionDate"
            type="date"
            value={form.date}
            max={getToday()}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                date: event.target.value
              }))
            }
          />
        </div>

        <div className="form-field">
          <label htmlFor="amount">Amount</label>

          <input
            id="amount"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={form.amount}
            onChange={handleAmountChange}
          />
        </div>


        <div className="form-field">
          <label htmlFor="paymentMode">Payment Mode</label>

          <select
            id="paymentMode"
            value={form.paymentMode}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                paymentMode: event.target.value
              }))
            }
          >
            <option value="">Select payment mode</option>

            {PAYMENT_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>


        <div className="form-field">
          <label htmlFor="title">Transaction Title</label>

          <input
            id="title"
            type="text"
            placeholder="Enter title"
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                title: event.target.value
              }))
            }
          />
        </div>

        <div className="form-field">
          <label htmlFor="notes">Notes</label>

          <textarea
            id="notes"
            rows={3}
            placeholder="Optional notes"
            value={form.notes}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                notes: event.target.value
              }))
            }
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant={isExpense ? "danger" : "success"}
            disabled={saving || loadingCategories}
          >
            {saving
              ? "Saving..."
              : isEditing
                ? "Update"
                : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TransactionFormModal;
