
import { useEffect, useState } from "react";
import {
    X,
    Plus,
    Trash2,
    Utensils,
    Clock3,
    Save,
    Search,
    LoaderCircle,
    CheckCircle2,
    BookOpen,
    Globe,
} from "lucide-react";

import { foodNutritionService } from "../../services/foodNutritionService";
import {
    searchIndianFoods,
    calculateFoodNutrition,
} from "../../data/indianFoodNutrition";

import "./PlanMealModal.css";

const EMPTY_FOOD = {
    food_name: "",
    quantity: "",
    quantity_unit: "g",
    calories: "",
    protein_g: "",
    carbs_g: "",
    fat_g: "",
    notes: "",
};

const initialForm = {
    meal_type: "Morning",
    meal_time: "08:00",
    notes: "",
    foodItems: [{ ...EMPTY_FOOD }],
};

const roundValue = (value) => Number(Number(value || 0).toFixed(1));

function calculateExternalNutrition(product, quantity, unit) {
    const amount = Number(quantity);

    if (!Number.isFinite(amount) || amount <= 0 || unit !== "g") {
        return null;
    }

    const multiplier = amount / 100;

    return {
        calories: roundValue(product.calories * multiplier),
        protein_g: roundValue(product.protein_g * multiplier),
        carbs_g: roundValue(product.carbs_g * multiplier),
        fat_g: roundValue(product.fat_g * multiplier),
    };
}

export default function PlanMealModal({
    open,
    saving,
    editingFood,
    mealTypes = ["Morning", "Afternoon", "Evening", "Night"],
    onClose,
    onSave,
}) {
    const [form, setForm] = useState(initialForm);
    const [validationError, setValidationError] = useState("");

    const [searchTerms, setSearchTerms] = useState({});
    const [searchResults, setSearchResults] = useState({});
    const [searchLoading, setSearchLoading] = useState({});
    const [searchErrors, setSearchErrors] = useState({});

    const [localResults, setLocalResults] = useState({});
    const [selectedSources, setSelectedSources] = useState({});
    const [autoNutrition, setAutoNutrition] = useState({});

    const isEditing = Boolean(editingFood);

    useEffect(() => {
        if (!open) return;

        if (editingFood) {
            const food = editingFood;

            setForm({
                meal_type: food.meal?.meal_type || "Morning",
                meal_time: food.meal?.meal_time || "08:00",
                notes: food.meal?.notes || "",
                foodItems: [
                    {
                        food_name: food.food_name || "",
                        quantity: food.quantity ?? "",
                        quantity_unit: food.quantity_unit || "g",
                        calories: food.calories ?? "",
                        protein_g: food.protein_g ?? "",
                        carbs_g: food.carbs_g ?? "",
                        fat_g: food.fat_g ?? "",
                        notes: food.notes || "",
                    },
                ],
            });
        } else {
            setForm({
                ...initialForm,
                foodItems: [{ ...EMPTY_FOOD }],
            });
        }

        setValidationError("");
        setSearchTerms({});
        setSearchResults({});
        setSearchLoading({});
        setSearchErrors({});
        setLocalResults({});
        setSelectedSources({});
        setAutoNutrition({});
    }, [open, editingFood]);

    if (!open) return null;

    const updateForm = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const updateFood = (index, field, value) => {
        setForm((previous) => ({
            ...previous,
            foodItems: previous.foodItems.map((food, i) => {
                if (i !== index) return food;

                const updatedFood = {
                    ...food,
                    [field]: value,
                };

                const selected = autoNutrition[index];

                if (
                    selected &&
                    (field === "quantity" || field === "quantity_unit")
                ) {
                    let calculated = null;

                    if (selected.source === "indian") {
                        calculated = calculateFoodNutrition(
                            selected.food,
                            updatedFood.quantity,
                            updatedFood.quantity_unit
                        );
                    }

                    if (selected.source === "openfoodfacts") {
                        calculated = calculateExternalNutrition(
                            selected.food,
                            updatedFood.quantity,
                            updatedFood.quantity_unit
                        );
                    }

                    if (calculated) {
                        Object.assign(updatedFood, calculated);
                    }
                }

                return updatedFood;
            }),
        }));

        // Manual nutrition editing disables automatic calculation.
        if (
            ["calories", "protein_g", "carbs_g", "fat_g"].includes(field)
        ) {
            setAutoNutrition((previous) => ({
                ...previous,
                [index]: null,
            }));

            setSelectedSources((previous) => ({
                ...previous,
                [index]: "",
            }));
        }

        // Quantity and unit changes are recalculated automatically
        // while an automatic nutrition source is selected.
    };

    const addFood = () => {
        setForm((previous) => ({
            ...previous,
            foodItems: [
                ...previous.foodItems,
                { ...EMPTY_FOOD },
            ],
        }));
    };

    const removeFood = (index) => {
        setForm((previous) => ({
            ...previous,
            foodItems: previous.foodItems.filter(
                (_, i) => i !== index
            ),
        }));

        setAutoNutrition((previous) => {
            const next = {};

            Object.entries(previous).forEach(([key, value]) => {
                const currentIndex = Number(key);

                if (currentIndex < index) {
                    next[currentIndex] = value;
                } else if (currentIndex > index) {
                    next[currentIndex - 1] = value;
                }
            });

            return next;
        });

        setSelectedSources((previous) => {
            const next = {};

            Object.entries(previous).forEach(([key, value]) => {
                const currentIndex = Number(key);

                if (currentIndex < index) {
                    next[currentIndex] = value;
                } else if (currentIndex > index) {
                    next[currentIndex - 1] = value;
                }
            });

            return next;
        });
    };

    // =========================================
    // LOCAL INDIAN FOOD SEARCH
    // =========================================

    const handleLocalSearch = (index, term) => {
        if (term.trim().length < 2) {
            setLocalResults((previous) => ({
                ...previous,
                [index]: [],
            }));

            return;
        }

        const results = searchIndianFoods(term);

        setLocalResults((previous) => ({
            ...previous,
            [index]: results,
        }));
    };

    // =========================================
    // EXTERNAL FOOD SEARCH
    // =========================================

    const handleFoodSearch = async (index) => {
        const term = (searchTerms[index] || "").trim();

        if (term.length < 3) {
            setSearchErrors((previous) => ({
                ...previous,
                [index]: "Enter at least 3 characters to search.",
            }));
            return;
        }

        setSearchLoading((previous) => ({
            ...previous,
            [index]: true,
        }));

        setSearchErrors((previous) => ({
            ...previous,
            [index]: "",
        }));

        setSearchResults((previous) => ({
            ...previous,
            [index]: [],
        }));

        try {
            const results =
                await foodNutritionService.searchFoods(term);

            setSearchResults((previous) => ({
                ...previous,
                [index]: results,
            }));

            if (!results.length) {
                setSearchErrors((previous) => ({
                    ...previous,
                    [index]: "No packaged food products found. Try the Indian Food Library or enter nutrition manually.",
                }));
            }
        } catch (error) {
            setSearchErrors((previous) => ({
                ...previous,
                [index]:
                    error.message ||
                    "Unable to search nutrition information.",
            }));
        } finally {
            setSearchLoading((previous) => ({
                ...previous,
                [index]: false,
            }));
        }
    };

    // =========================================
    // SELECT INDIAN FOOD
    // =========================================

    const selectIndianFood = (index, food) => {
        const quantity = 1;
        const unit = "serving";

        const nutrition = calculateFoodNutrition(
            food,
            quantity,
            unit
        );

        setForm((previous) => ({
            ...previous,
            foodItems: previous.foodItems.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        food_name: food.name,
                        quantity,
                        quantity_unit: unit,
                        calories: nutrition?.calories ?? 0,
                        protein_g: nutrition?.protein_g ?? 0,
                        carbs_g: nutrition?.carbs_g ?? 0,
                        fat_g: nutrition?.fat_g ?? 0,
                    }
                    : item
            ),
        }));

        setAutoNutrition((previous) => ({
            ...previous,
            [index]: {
                source: "indian",
                food,
            },
        }));

        setSelectedSources((previous) => ({
            ...previous,
            [index]: "Indian Food Library",
        }));

        setLocalResults((previous) => ({
            ...previous,
            [index]: [],
        }));

        setSearchResults((previous) => ({
            ...previous,
            [index]: [],
        }));

        setSearchTerms((previous) => ({
            ...previous,
            [index]: "",
        }));

        setSearchErrors((previous) => ({
            ...previous,
            [index]: "",
        }));
    };

    // =========================================
    // SELECT OPEN FOOD FACTS PRODUCT
    // =========================================

    const selectExternalFood = (index, product) => {
        const quantity = 100;
        const unit = "g";

        const nutrition = calculateExternalNutrition(
            product,
            quantity,
            unit
        );

        setForm((previous) => ({
            ...previous,
            foodItems: previous.foodItems.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        food_name: product.name,
                        quantity,
                        quantity_unit: unit,
                        calories: nutrition?.calories ?? 0,
                        protein_g: nutrition?.protein_g ?? 0,
                        carbs_g: nutrition?.carbs_g ?? 0,
                        fat_g: nutrition?.fat_g ?? 0,
                    }
                    : item
            ),
        }));

        setAutoNutrition((previous) => ({
            ...previous,
            [index]: {
                source: "openfoodfacts",
                food: product,
            },
        }));

        setSelectedSources((previous) => ({
            ...previous,
            [index]: "Open Food Facts",
        }));

        setSearchResults((previous) => ({
            ...previous,
            [index]: [],
        }));

        setLocalResults((previous) => ({
            ...previous,
            [index]: [],
        }));

        setSearchTerms((previous) => ({
            ...previous,
            [index]: "",
        }));

        setSearchErrors((previous) => ({
            ...previous,
            [index]: "",
        }));
    };

    // =========================================
    // VALIDATE AND SAVE
    // =========================================

    const handleSubmit = async (event) => {
        event.preventDefault();
        setValidationError("");

        if (!form.foodItems.length) {
            setValidationError("Please add at least one food item.");
            return;
        }

        for (let i = 0; i < form.foodItems.length; i += 1) {
            const food = form.foodItems[i];

            if (!food.food_name.trim()) {
                setValidationError(
                    `Enter the food name for item ${i + 1}.`
                );
                return;
            }

            if (
                food.quantity === "" ||
                !Number.isFinite(Number(food.quantity)) ||
                Number(food.quantity) <= 0
            ) {
                setValidationError(
                    `Enter a valid quantity for ${food.food_name}.`
                );
                return;
            }

            const nutritionFields = [
                "calories",
                "protein_g",
                "carbs_g",
                "fat_g",
            ];

            for (const field of nutritionFields) {
                if (
                    food[field] !== "" &&
                    (!Number.isFinite(Number(food[field])) ||
                        Number(food[field]) < 0)
                ) {
                    setValidationError(
                        `Enter a valid nutrition value for ${food.food_name}.`
                    );
                    return;
                }
            }
        }

        const foodItems = form.foodItems.map((food) => ({
            food_name: food.food_name.trim(),
            quantity: Number(food.quantity),
            quantity_unit: food.quantity_unit || "g",
            calories: Number(food.calories) || 0,
            protein_g: Number(food.protein_g) || 0,
            carbs_g: Number(food.carbs_g) || 0,
            fat_g: Number(food.fat_g) || 0,
            notes: food.notes?.trim() || null,
        }));

        try {
            await onSave({
                meal_type: form.meal_type,
                meal_time: form.meal_time,
                notes: form.notes.trim(),
                foodItems,
            });
        } catch {
            // Parent displays the save error.
        }
    };

    return (
        <div
            className="plan-meal-overlay"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !saving
                ) {
                    onClose();
                }
            }}
        >
            <div
                className="plan-meal-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="plan-meal-title"
            >
                <div className="plan-meal-modal-header">
                    <div className="plan-meal-modal-heading">
                        <div className="plan-meal-modal-icon">
                            <Utensils size={22} />
                        </div>

                        <div>
                            <h2 id="plan-meal-title">
                                {isEditing
                                    ? "Edit Food Item"
                                    : "Plan Your Meal"}
                            </h2>

                            <p>
                                Select Indian foods or search packaged
                                food nutrition.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="plan-meal-close"
                        onClick={onClose}
                        disabled={saving}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    className="plan-meal-form"
                    onSubmit={handleSubmit}
                >
                    {!isEditing && (
                        <div className="plan-meal-meal-details">
                            <div className="plan-meal-field">
                                <label>Meal Category *</label>

                                <select
                                    value={form.meal_type}
                                    onChange={(event) =>
                                        updateForm(
                                            "meal_type",
                                            event.target.value
                                        )
                                    }
                                    required
                                >
                                    {mealTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="plan-meal-field">
                                <label>Meal Time *</label>

                                <div className="plan-meal-time-input">
                                    <Clock3 size={17} />

                                    <input
                                        type="time"
                                        value={form.meal_time}
                                        onChange={(event) =>
                                            updateForm(
                                                "meal_time",
                                                event.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="plan-meal-food-heading">
                        <div>
                            <h3>Food Items</h3>
                            <p>
                                Add one or more foods to this meal.
                            </p>
                        </div>

                        {!isEditing && (
                            <button
                                type="button"
                                className="plan-meal-add-food"
                                onClick={addFood}
                            >
                                <Plus size={16} />
                                Add Food
                            </button>
                        )}
                    </div>

                    <div className="plan-meal-food-list">
                        {form.foodItems.map((food, index) => (
                            <div
                                className="plan-meal-food-item"
                                key={index}
                            >
                                <div className="plan-meal-food-item-heading">
                                    <strong>
                                        Food Item {index + 1}
                                    </strong>

                                    {form.foodItems.length > 1 && (
                                        <button
                                            type="button"
                                            className="plan-meal-remove-food"
                                            onClick={() =>
                                                removeFood(index)
                                            }
                                            title="Remove food item"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* INDIAN FOOD LIBRARY */}

                                <div className="plan-food-search">
                                    <label>
                                        <BookOpen size={15} />
                                        Indian Food Library
                                    </label>

                                    <div className="plan-food-search-input">
                                        <Search size={17} />

                                        <input
                                            type="search"
                                            placeholder="Try Idli, Dosa, Rice, Chapati..."
                                            value={
                                                searchTerms[index] || ""
                                            }
                                            onChange={(event) => {
                                                const term =
                                                    event.target.value;

                                                setSearchTerms(
                                                    (previous) => ({
                                                        ...previous,
                                                        [index]: term,
                                                    })
                                                );

                                                handleLocalSearch(
                                                    index,
                                                    term
                                                );
                                            }}
                                        />
                                    </div>

                                    {localResults[index]?.length > 0 && (
                                        <div className="plan-food-results">
                                            {localResults[index].map(
                                                (item) => (
                                                    <button
                                                        type="button"
                                                        key={item.id}
                                                        className="plan-food-result"
                                                        onClick={() =>
                                                            selectIndianFood(
                                                                index,
                                                                item
                                                            )
                                                        }
                                                    >
                                                        <span>
                                                            <strong>
                                                                {item.name}
                                                            </strong>

                                                            <small>
                                                                {item.category}
                                                            </small>
                                                        </span>

                                                        <span className="plan-food-result-calories">
                                                            {item.calories} kcal
                                                            <small>/ 100 g</small>
                                                        </span>
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    )}

                                    <small className="plan-food-source">
                                        Approximate nutrition values.
                                        Select a food to calculate by
                                        serving size.
                                    </small>
                                </div>

                                {/* EXTERNAL FOOD SEARCH */}

                                <div className="plan-food-search external">
                                    <label>
                                        <Globe size={15} />
                                        Packaged Food Search
                                    </label>

                                    <div className="plan-food-search-input">
                                        <Search size={17} />

                                        <input
                                            type="search"
                                            placeholder="Search branded food products..."
                                            value={
                                                searchTerms[index] || ""
                                            }
                                            onChange={(event) =>
                                                setSearchTerms(
                                                    (previous) => ({
                                                        ...previous,
                                                        [index]:
                                                            event.target.value,
                                                    })
                                                )
                                            }
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key === "Enter"
                                                ) {
                                                    event.preventDefault();
                                                    handleFoodSearch(index);
                                                }
                                            }}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleFoodSearch(index)
                                            }
                                            disabled={
                                                searchLoading[index] ||
                                                (searchTerms[index] || "")
                                                    .trim().length < 3
                                            }
                                        >
                                            {searchLoading[index] ? (
                                                <LoaderCircle
                                                    size={16}
                                                    className="plan-food-spinner"
                                                />
                                            ) : (
                                                "Search"
                                            )}
                                        </button>
                                    </div>

                                    {searchErrors[index] && (
                                        <p className="plan-food-search-error">
                                            {searchErrors[index]}
                                        </p>
                                    )}

                                    {searchResults[index]?.length > 0 && (
                                        <div className="plan-food-results">
                                            {searchResults[index].map(
                                                (product, resultIndex) => (
                                                    <button
                                                        type="button"
                                                        key={
                                                            product.code ||
                                                            `${product.name}-${resultIndex}`
                                                        }
                                                        className="plan-food-result"
                                                        onClick={() =>
                                                            selectExternalFood(
                                                                index,
                                                                product
                                                            )
                                                        }
                                                    >
                                                        <span>
                                                            <strong>
                                                                {product.name}
                                                            </strong>

                                                            <small>
                                                                {product.brand ||
                                                                    "Food product"}
                                                            </small>
                                                        </span>

                                                        <span className="plan-food-result-calories">
                                                            {Number(
                                                                product.calories
                                                            ).toFixed(0)}{" "}
                                                            kcal
                                                            <small>/ 100 g</small>
                                                        </span>
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    )}

                                    <small className="plan-food-source">
                                        Packaged food nutrition from Open
                                        Food Facts. Check product labels
                                        for accuracy.
                                    </small>
                                </div>

                                {selectedSources[index] && (
                                    <div className="plan-food-selected">
                                        <CheckCircle2 size={15} />
                                        Nutrition loaded from{" "}
                                        {selectedSources[index]}.
                                        Quantity changes will recalculate
                                        the values where supported.
                                    </div>
                                )}

                                {/* FOOD DETAILS */}

                                <div className="plan-meal-food-grid">
                                    <div className="plan-meal-field food-name-field">
                                        <label>Food Name *</label>

                                        <input
                                            type="text"
                                            placeholder="e.g. Idli, Rice, Egg"
                                            value={food.food_name}
                                            onChange={(event) =>
                                                updateFood(
                                                    index,
                                                    "food_name",
                                                    event.target.value
                                                )
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="plan-meal-field">
                                        <label>Quantity *</label>

                                        <input
                                            type="number"
                                            min="0.01"
                                            step="any"
                                            placeholder="100"
                                            value={food.quantity}
                                            onChange={(event) =>
                                                updateFood(
                                                    index,
                                                    "quantity",
                                                    event.target.value
                                                )
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="plan-meal-field">
                                        <label>Unit</label>

                                        <select
                                            value={food.quantity_unit}
                                            onChange={(event) =>
                                                updateFood(
                                                    index,
                                                    "quantity_unit",
                                                    event.target.value
                                                )
                                            }
                                        >
                                            <option value="g">Grams (g)</option>
                                            <option value="ml">Millilitres (ml)</option>
                                            <option value="piece">Piece</option>
                                            <option value="cup">Cup</option>
                                            <option value="bowl">Bowl</option>
                                            <option value="plate">Plate</option>
                                            <option value="serving">Serving</option>
                                            <option value="tbsp">Tablespoon</option>
                                            <option value="tsp">Teaspoon</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="plan-meal-nutrition-heading">
                                    Nutrition Details

                                    {autoNutrition[index] && (
                                        <small>
                                            Automatically calculated from
                                            selected food and portion
                                        </small>
                                    )}
                                </div>

                                <div className="plan-meal-nutrition-grid">
                                    {[
                                        ["calories", "Calories (kcal)"],
                                        ["protein_g", "Protein (g)"],
                                        ["carbs_g", "Carbs (g)"],
                                        ["fat_g", "Fat (g)"],
                                    ].map(([field, label]) => (
                                        <div
                                            className="plan-meal-field"
                                            key={field}
                                        >
                                            <label>{label}</label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="any"
                                                placeholder="0"
                                                value={food[field]}
                                                onChange={(event) =>
                                                    updateFood(
                                                        index,
                                                        field,
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="plan-meal-field">
                                    <label>Food Notes</label>

                                    <input
                                        type="text"
                                        placeholder="Optional notes"
                                        value={food.notes}
                                        onChange={(event) =>
                                            updateFood(
                                                index,
                                                "notes",
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {!isEditing && (
                        <div className="plan-meal-field plan-meal-general-notes">
                            <label>Meal Notes</label>

                            <textarea
                                rows="2"
                                placeholder="Any additional notes about this meal..."
                                value={form.notes}
                                onChange={(event) =>
                                    updateForm(
                                        "notes",
                                        event.target.value
                                    )
                                }
                            />
                        </div>
                    )}

                    {validationError && (
                        <div className="plan-meal-validation-error">
                            {validationError}
                        </div>
                    )}

                    <div className="plan-meal-modal-footer">
                        <button
                            type="button"
                            className="plan-meal-cancel"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="plan-meal-submit"
                            disabled={saving}
                        >
                            <Save size={17} />

                            {saving
                                ? "Saving..."
                                : isEditing
                                    ? "Update Food"
                                    : "Save Meal"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
