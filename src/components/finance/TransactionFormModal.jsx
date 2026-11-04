import { useEffect, useMemo, useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import SelectDropdown from "../common/SelectDropdown";
import {
  createId,
  readCategories,
  saveCategories
} from "../../utils/transactionStorage";

const emptyForm = {
  categoryId: "",
  subcategoryId: "",
  amount: "",
  title: "",
  notes: "",
  date: new Date().toISOString().split("T")[0]
};

function isValidAmount(value) {
  if (value === "") return true;
  return /^\d*\.?\d{0,2}$/.test(value);
}

function buildFormFromTransaction(transaction, categories) {
  if (!transaction) return emptyForm;

  const matchedCategory =
    categories.find(
      (item) =>
        item.name.toLowerCase() === String(transaction.category || "").toLowerCase()
    ) || null;

  const matchedSubcategory =
    matchedCategory?.subcategories.find(
      (item) =>
        item.name.toLowerCase() ===
        String(transaction.subcategory || "").toLowerCase()
    ) || null;

  return {
    categoryId: matchedCategory?.id || "",
    subcategoryId: matchedSubcategory?.id || "",
    amount:
      transaction.amount === undefined || transaction.amount === null
        ? ""
        : String(transaction.amount),
    title: transaction.title || "",
    notes: transaction.notes || "",
    date: transaction.date || new Date().toISOString().split("T")[0]
  };
}

function TransactionFormModal({
  open,
  type = "expense",
  initialTransaction = null,
  onClose,
  onSave
}) {
  const [categoriesByType, setCategoriesByType] = useState(() =>
    readCategories()
  );
  const [form, setForm] = useState(emptyForm);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [showCategoryCreate, setShowCategoryCreate] = useState(false);
  const [showSubcategoryCreate, setShowSubcategoryCreate] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(initialTransaction);
  const isExpense = type === "expense";
  const categories = categoriesByType[type] || [];

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === form.categoryId) || null,
    [categories, form.categoryId]
  );

  const subcategories = selectedCategory?.subcategories || [];

  useEffect(() => {
    if (!open) return;

    const nextCategories = readCategories();
    setCategoriesByType(nextCategories);
    setForm(
      buildFormFromTransaction(
        initialTransaction,
        nextCategories[type] || []
      )
    );
    setNewCategoryName("");
    setNewSubcategoryName("");
    setShowCategoryCreate(false);
    setShowSubcategoryCreate(false);
    setError("");
  }, [open, type, initialTransaction]);

  const updateCategories = (next) => {
    setCategoriesByType(next);
    saveCategories(next);
  };

  const handleAmountChange = (event) => {
    const { value } = event.target;
    if (!isValidAmount(value)) return;
    setForm((prev) => ({ ...prev, amount: value }));
  };

  const handleCreateCategory = () => {
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

    const category = {
      id: createId("cat"),
      name,
      subcategories: []
    };

    const next = {
      ...categoriesByType,
      [type]: [...categories, category]
    };

    updateCategories(next);
    setForm((prev) => ({
      ...prev,
      categoryId: category.id,
      subcategoryId: ""
    }));
    setNewCategoryName("");
    setShowCategoryCreate(false);
    setError("");
  };

  const handleCreateSubcategory = () => {
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

    const subcategory = {
      id: createId("sub"),
      name
    };

    const next = {
      ...categoriesByType,
      [type]: categories.map((category) =>
        category.id === selectedCategory.id
          ? {
            ...category,
            subcategories: [...category.subcategories, subcategory]
          }
          : category
      )
    };

    updateCategories(next);
    setForm((prev) => ({ ...prev, subcategoryId: subcategory.id }));
    setNewSubcategoryName("");
    setShowSubcategoryCreate(false);
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.categoryId) {
      setError("Select a category.");
      return;
    }

    if (!form.subcategoryId) {
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

    onSave?.({
      type,
      category: selectedCategory.name,
      subcategory:
        subcategories.find((item) => item.id === form.subcategoryId)?.name ||
        "",
      amount: Number(form.amount),
      title: form.title.trim(),
      notes: form.notes.trim(),
      date: form.date
    });
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
              placeholder="Select category"
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
                onChange={(event) => setNewCategoryName(event.target.value)}
              />
              <Button type="button" variant="secondary" onClick={handleCreateCategory}>
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
              disabled={!form.categoryId}
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
                onChange={(event) => setNewSubcategoryName(event.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
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
            max={new Date().toISOString().split("T")[0]}
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
          <label htmlFor="title">Transaction Title</label>
          <input
            id="title"
            type="text"
            placeholder="Enter title"
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
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
              setForm((prev) => ({ ...prev, notes: event.target.value }))
            }
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant={isExpense ? "danger" : "success"}>
            {isEditing ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TransactionFormModal;
