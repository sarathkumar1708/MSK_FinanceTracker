const DEFAULT_SERVING_SIZES = {
    piece: 50,
    cup: 160,
    bowl: 150,
    plate: 250,
    serving: 150,
    tbsp: 15,
    tsp: 5,
};

export const INDIAN_FOOD_NUTRITION = [
    // Breakfast and main course
    { id: "idli", name: "Idli", category: "Breakfast", calories: 146, protein_g: 4.5, carbs_g: 30, fat_g: 0.7, servingSizes: { piece: 40, serving: 80 } },
    { id: "plain-dosa", name: "Plain Dosa", category: "Breakfast", calories: 168, protein_g: 4, carbs_g: 28, fat_g: 4.5, servingSizes: { piece: 100, serving: 100 } },
    { id: "masala-dosa", name: "Masala Dosa", category: "Breakfast", calories: 190, protein_g: 4, carbs_g: 29, fat_g: 6, servingSizes: { piece: 180, serving: 180 } },
    { id: "pongal", name: "Ven Pongal", category: "Breakfast", calories: 160, protein_g: 4.5, carbs_g: 23, fat_g: 5.5, servingSizes: { cup: 200, bowl: 200, serving: 200 } },
    { id: "upma", name: "Vegetable Upma", category: "Breakfast", calories: 150, protein_g: 4, carbs_g: 25, fat_g: 4, servingSizes: { cup: 180, bowl: 180, serving: 180 } },
    { id: "poha", name: "Poha", category: "Breakfast", calories: 130, protein_g: 2.5, carbs_g: 25, fat_g: 2.5, servingSizes: { cup: 150, bowl: 150, serving: 150 } },
    { id: "chapati", name: "Chapati", category: "Main Course", calories: 297, protein_g: 9, carbs_g: 50, fat_g: 7, servingSizes: { piece: 40, serving: 40 } },
    { id: "parotta", name: "Parotta", category: "Main Course", calories: 320, protein_g: 6, carbs_g: 45, fat_g: 13, servingSizes: { piece: 100, serving: 100 } },
    { id: "cooked-white-rice", name: "Cooked White Rice", category: "Main Course", calories: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3, servingSizes: { cup: 160, bowl: 180, plate: 250, serving: 160 } },
    { id: "brown-rice", name: "Cooked Brown Rice", category: "Main Course", calories: 123, protein_g: 2.7, carbs_g: 25.6, fat_g: 1, servingSizes: { cup: 160, bowl: 180, plate: 250, serving: 160 } },

    // Side dishes and dairy
    { id: "sambar", name: "Sambar", category: "Side Dish", calories: 65, protein_g: 3, carbs_g: 10, fat_g: 1.5, servingSizes: { cup: 180, bowl: 150, serving: 150 } },
    { id: "rasam", name: "Rasam", category: "Side Dish", calories: 35, protein_g: 1.5, carbs_g: 5, fat_g: 0.8, servingSizes: { cup: 180, bowl: 150, serving: 150 } },
    { id: "curd", name: "Plain Curd", category: "Dairy", calories: 61, protein_g: 3.5, carbs_g: 4.7, fat_g: 3.3, servingSizes: { cup: 150, bowl: 150, serving: 150 } },
    { id: "buttermilk", name: "Buttermilk", category: "Dairy", calories: 40, protein_g: 2, carbs_g: 4, fat_g: 1.5, servingSizes: { cup: 240, serving: 240 } },

    // Protein and non-vegetarian
    { id: "boiled-egg", name: "Boiled Egg", category: "Protein", calories: 155, protein_g: 13, carbs_g: 1.1, fat_g: 11, servingSizes: { piece: 50, serving: 50 } },
    { id: "egg-white", name: "Boiled Egg White", category: "Protein", calories: 52, protein_g: 11, carbs_g: 0.7, fat_g: 0.2, servingSizes: { piece: 33, serving: 33 } },
    { id: "chicken-curry", name: "Chicken Curry", category: "Non-Vegetarian", calories: 170, protein_g: 18, carbs_g: 4, fat_g: 9, servingSizes: { cup: 180, bowl: 180, serving: 180 } },
    { id: "grilled-chicken", name: "Grilled Chicken", category: "Non-Vegetarian", calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, servingSizes: { piece: 100, serving: 100 } },
    { id: "dal", name: "Cooked Dal", category: "Side Dish", calories: 116, protein_g: 9, carbs_g: 20, fat_g: 0.4, servingSizes: { cup: 180, bowl: 150, serving: 150 } },
    { id: "channa", name: "Cooked Channa", category: "Protein", calories: 164, protein_g: 8.9, carbs_g: 27.4, fat_g: 2.6, servingSizes: { cup: 160, bowl: 150, serving: 150 } },
    { id: "green-gram", name: "Cooked Green Gram", category: "Protein", calories: 105, protein_g: 7, carbs_g: 19, fat_g: 0.4, servingSizes: { cup: 160, bowl: 150, serving: 150 } },

    // Fruits and nuts
    { id: "banana", name: "Banana", category: "Fruit", calories: 89, protein_g: 1.1, carbs_g: 22.8, fat_g: 0.3, servingSizes: { piece: 100, serving: 100 } },
    { id: "apple", name: "Apple", category: "Fruit", calories: 52, protein_g: 0.3, carbs_g: 13.8, fat_g: 0.2, servingSizes: { piece: 180, serving: 180 } },
    { id: "orange", name: "Orange", category: "Fruit", calories: 47, protein_g: 0.9, carbs_g: 11.8, fat_g: 0.1, servingSizes: { piece: 130, serving: 130 } },
    { id: "peanuts", name: "Roasted Peanuts", category: "Snack", calories: 585, protein_g: 25.8, carbs_g: 21.5, fat_g: 49.7, servingSizes: { tbsp: 10, serving: 30 } },
    { id: "almonds", name: "Almonds", category: "Snack", calories: 579, protein_g: 21.2, carbs_g: 21.6, fat_g: 49.9, servingSizes: { piece: 1.2, serving: 30 } },

    // Additional breakfast items
    { id: "rava-idli", name: "Rava Idli", category: "Breakfast", calories: 184, protein_g: 5, carbs_g: 28, fat_g: 6, servingSizes: { piece: 60, serving: 120 } },
    { id: "ragi-idli", name: "Ragi Idli", category: "Breakfast", calories: 145, protein_g: 4, carbs_g: 29, fat_g: 1.5, servingSizes: { piece: 50, serving: 100 } },
    { id: "mini-idli", name: "Mini Idli", category: "Breakfast", calories: 146, protein_g: 4.5, carbs_g: 30, fat_g: 0.7, servingSizes: { piece: 15, serving: 90 } },
    { id: "set-dosa", name: "Set Dosa", category: "Breakfast", calories: 190, protein_g: 4.5, carbs_g: 31, fat_g: 5.5, servingSizes: { piece: 70, serving: 210 } },
    { id: "onion-dosa", name: "Onion Dosa", category: "Breakfast", calories: 190, protein_g: 5, carbs_g: 30, fat_g: 6, servingSizes: { piece: 120, serving: 120 } },
    { id: "rava-dosa", name: "Rava Dosa", category: "Breakfast", calories: 210, protein_g: 5, carbs_g: 31, fat_g: 7.5, servingSizes: { piece: 120, serving: 120 } },
    { id: "wheat-dosa", name: "Wheat Dosa", category: "Breakfast", calories: 185, protein_g: 5.5, carbs_g: 30, fat_g: 5, servingSizes: { piece: 100, serving: 100 } },
    { id: "ragi-dosa", name: "Ragi Dosa", category: "Breakfast", calories: 165, protein_g: 4, carbs_g: 32, fat_g: 2.5, servingSizes: { piece: 100, serving: 100 } },
    { id: "adai", name: "Adai", category: "Breakfast", calories: 190, protein_g: 8, carbs_g: 28, fat_g: 5.5, servingSizes: { piece: 100, serving: 100 } },
    { id: "appam", name: "Appam", category: "Breakfast", calories: 130, protein_g: 2.5, carbs_g: 27, fat_g: 1, servingSizes: { piece: 60, serving: 120 } },
    { id: "puttu", name: "Rice Puttu", category: "Breakfast", calories: 150, protein_g: 3, carbs_g: 31, fat_g: 1.5, servingSizes: { cup: 150, serving: 150 } },
    { id: "idiyappam", name: "Idiyappam", category: "Breakfast", calories: 150, protein_g: 2.5, carbs_g: 33, fat_g: 0.5, servingSizes: { piece: 50, serving: 100 } },
    { id: "paniyaram", name: "Kuzhi Paniyaram", category: "Breakfast", calories: 190, protein_g: 4, carbs_g: 29, fat_g: 6, servingSizes: { piece: 30, serving: 120 } },
    { id: "poori", name: "Poori", category: "Breakfast", calories: 300, protein_g: 6, carbs_g: 40, fat_g: 13, servingSizes: { piece: 35, serving: 105 } },
    { id: "rava-kichadi", name: "Rava Kichadi", category: "Breakfast", calories: 145, protein_g: 3.5, carbs_g: 22, fat_g: 5, servingSizes: { cup: 180, serving: 180 } },
    { id: "semiya-upma", name: "Semiya Upma", category: "Breakfast", calories: 155, protein_g: 4, carbs_g: 25, fat_g: 4.5, servingSizes: { cup: 180, serving: 180 } },

    // Rice varieties
    { id: "lemon-rice", name: "Lemon Rice", category: "Rice", calories: 180, protein_g: 3, carbs_g: 30, fat_g: 5.5, servingSizes: { cup: 180, plate: 250 } },
    { id: "tamarind-rice", name: "Tamarind Rice (Puliyodarai)", category: "Rice", calories: 190, protein_g: 3.5, carbs_g: 30, fat_g: 6, servingSizes: { cup: 180, plate: 250 } },
    { id: "curd-rice", name: "Curd Rice", category: "Rice", calories: 130, protein_g: 3.5, carbs_g: 21, fat_g: 3, servingSizes: { cup: 180, bowl: 200, plate: 250 } },
    { id: "tomato-rice", name: "Tomato Rice", category: "Rice", calories: 165, protein_g: 3, carbs_g: 28, fat_g: 4.5, servingSizes: { cup: 180, plate: 250 } },
    { id: "coconut-rice", name: "Coconut Rice", category: "Rice", calories: 195, protein_g: 3.5, carbs_g: 29, fat_g: 7, servingSizes: { cup: 180, plate: 250 } },
    { id: "ghee-rice", name: "Ghee Rice", category: "Rice", calories: 190, protein_g: 3.5, carbs_g: 29, fat_g: 6.5, servingSizes: { cup: 180, plate: 250 } },
    { id: "veg-biryani", name: "Vegetable Biryani", category: "Rice", calories: 160, protein_g: 3.5, carbs_g: 25, fat_g: 5, servingSizes: { cup: 180, plate: 300 } },
    { id: "chicken-biryani", name: "Chicken Biryani", category: "Non-Vegetarian", calories: 180, protein_g: 9, carbs_g: 22, fat_g: 6, servingSizes: { cup: 200, plate: 350 } },
    { id: "egg-biryani", name: "Egg Biryani", category: "Non-Vegetarian", calories: 175, protein_g: 7, carbs_g: 23, fat_g: 6, servingSizes: { cup: 200, plate: 300 } },
    { id: "sambar-rice", name: "Sambar Rice", category: "Meals", calories: 125, protein_g: 3.5, carbs_g: 21, fat_g: 2.5, servingSizes: { cup: 200, plate: 300 } },
    { id: "rasam-rice", name: "Rasam Rice", category: "Meals", calories: 115, protein_g: 2.5, carbs_g: 23, fat_g: 1.5, servingSizes: { cup: 200, plate: 300 } },

    // Side dishes and vegetables
    { id: "veg-kurma", name: "Vegetable Kurma", category: "Side Dish", calories: 130, protein_g: 3, carbs_g: 10, fat_g: 8, servingSizes: { cup: 150, bowl: 150 } },
    { id: "potato-fry", name: "Potato Fry", category: "Side Dish", calories: 180, protein_g: 2.5, carbs_g: 25, fat_g: 8, servingSizes: { cup: 120, bowl: 120 } },
    { id: "beans-poriyal", name: "Beans Poriyal", category: "Side Dish", calories: 95, protein_g: 3, carbs_g: 10, fat_g: 5, servingSizes: { cup: 120 } },
    { id: "cabbage-poriyal", name: "Cabbage Poriyal", category: "Side Dish", calories: 85, protein_g: 2, carbs_g: 9, fat_g: 4.5, servingSizes: { cup: 120 } },
    { id: "avial", name: "Avial", category: "Side Dish", calories: 110, protein_g: 3, carbs_g: 12, fat_g: 6, servingSizes: { cup: 150, bowl: 150 } },

    // Snacks and street food
    { id: "medu-vada", name: "Medu Vadai", category: "Snack", calories: 280, protein_g: 8, carbs_g: 30, fat_g: 14, servingSizes: { piece: 45, serving: 90 } },
    { id: "masala-vada", name: "Masala Vadai", category: "Snack", calories: 300, protein_g: 10, carbs_g: 35, fat_g: 13, servingSizes: { piece: 40, serving: 80 } },
    { id: "onion-bajji", name: "Onion Bajji", category: "Snack", calories: 280, protein_g: 5, carbs_g: 32, fat_g: 15, servingSizes: { piece: 45, serving: 90 } },
    { id: "potato-bajji", name: "Potato Bajji", category: "Snack", calories: 270, protein_g: 4, carbs_g: 35, fat_g: 12, servingSizes: { piece: 45, serving: 90 } },
    { id: "samosa", name: "Vegetable Samosa", category: "Snack", calories: 300, protein_g: 5, carbs_g: 32, fat_g: 17, servingSizes: { piece: 70 } },
    { id: "pani-puri", name: "Pani Puri", category: "Street Food", calories: 180, protein_g: 4, carbs_g: 30, fat_g: 5, servingSizes: { piece: 20, serving: 120 } },
    { id: "pav-bhaji", name: "Pav Bhaji", category: "Street Food", calories: 180, protein_g: 4, carbs_g: 25, fat_g: 7, servingSizes: { plate: 250 } },
    { id: "pakora", name: "Mixed Vegetable Pakora", category: "Snack", calories: 280, protein_g: 6, carbs_g: 30, fat_g: 15, servingSizes: { cup: 100 } },
    { id: "banana-chips", name: "Banana Chips", category: "Snack", calories: 520, protein_g: 2.5, carbs_g: 58, fat_g: 32, servingSizes: { cup: 30, serving: 30 } },
    { id: "murukku", name: "Murukku", category: "Snack", calories: 480, protein_g: 8, carbs_g: 55, fat_g: 25, servingSizes: { piece: 20, serving: 40 } },
    { id: "mixture", name: "South Indian Mixture", category: "Snack", calories: 500, protein_g: 10, carbs_g: 50, fat_g: 28, servingSizes: { cup: 30 } },
    { id: "sundal", name: "Chickpea Sundal", category: "Snack", calories: 160, protein_g: 8, carbs_g: 24, fat_g: 4, servingSizes: { cup: 150, bowl: 150 } },

    // Beverages
    { id: "milk-tea", name: "Milk Tea with Sugar", category: "Beverage", calories: 65, protein_g: 1.5, carbs_g: 9, fat_g: 2, servingSizes: { cup: 150, serving: 150 } },
    { id: "black-tea", name: "Black Tea with Sugar", category: "Beverage", calories: 30, protein_g: 0.1, carbs_g: 7.5, fat_g: 0, servingSizes: { cup: 150 } },
    { id: "filter-coffee", name: "South Indian Filter Coffee", category: "Beverage", calories: 75, protein_g: 2, carbs_g: 10, fat_g: 2.5, servingSizes: { cup: 120 } },
    { id: "black-coffee", name: "Black Coffee", category: "Beverage", calories: 2, protein_g: 0.3, carbs_g: 0, fat_g: 0, servingSizes: { cup: 150 } },
    { id: "lassi", name: "Sweet Lassi", category: "Beverage", calories: 100, protein_g: 3.5, carbs_g: 15, fat_g: 3, servingSizes: { cup: 200 } },
    { id: "tender-coconut", name: "Tender Coconut Water", category: "Beverage", calories: 19, protein_g: 0.7, carbs_g: 3.7, fat_g: 0.2, servingSizes: { cup: 200 } },
    { id: "sugarcane-juice", name: "Sugarcane Juice", category: "Beverage", calories: 65, protein_g: 0.2, carbs_g: 16, fat_g: 0.1, servingSizes: { cup: 200 } },

    // Bakery
    { id: "white-bread", name: "White Bread", category: "Bakery", calories: 265, protein_g: 9, carbs_g: 49, fat_g: 3.2, servingSizes: { piece: 30, serving: 60 } },
    { id: "veg-puff", name: "Vegetable Puff", category: "Bakery", calories: 330, protein_g: 5, carbs_g: 35, fat_g: 19, servingSizes: { piece: 80 } },
    { id: "egg-puff", name: "Egg Puff", category: "Bakery", calories: 320, protein_g: 8, carbs_g: 32, fat_g: 18, servingSizes: { piece: 80 } },
    { id: "rusk", name: "Rusk", category: "Bakery", calories: 400, protein_g: 10, carbs_g: 75, fat_g: 7, servingSizes: { piece: 10, serving: 30 } },

    // Sweets
    { id: "gulab-jamun", name: "Gulab Jamun", category: "Sweet", calories: 330, protein_g: 5, carbs_g: 55, fat_g: 10, servingSizes: { piece: 35, serving: 70 } },
    { id: "jalebi", name: "Jalebi", category: "Sweet", calories: 400, protein_g: 3, carbs_g: 75, fat_g: 12, servingSizes: { piece: 25, serving: 50 } },
    { id: "mysore-pak", name: "Mysore Pak", category: "Sweet", calories: 500, protein_g: 7, carbs_g: 50, fat_g: 30, servingSizes: { piece: 30, serving: 60 } },
    { id: "adhirasam", name: "Adhirasam", category: "Sweet", calories: 350, protein_g: 4, carbs_g: 60, fat_g: 12, servingSizes: { piece: 50 } },
    { id: "rava-kesari", name: "Rava Kesari", category: "Sweet", calories: 300, protein_g: 4, carbs_g: 50, fat_g: 10, servingSizes: { cup: 100 } },

    // Fruits
    { id: "watermelon", name: "Watermelon", category: "Fruit", calories: 30, protein_g: 0.6, carbs_g: 7.6, fat_g: 0.2, servingSizes: { cup: 150, serving: 150 } },
    { id: "guava", name: "Guava", category: "Fruit", calories: 68, protein_g: 2.6, carbs_g: 14.3, fat_g: 1, servingSizes: { piece: 100 } },
    { id: "grapes", name: "Grapes", category: "Fruit", calories: 69, protein_g: 0.7, carbs_g: 18.1, fat_g: 0.2, servingSizes: { cup: 150 } },
    { id: "pomegranate", name: "Pomegranate", category: "Fruit", calories: 83, protein_g: 1.7, carbs_g: 18.7, fat_g: 1.2, servingSizes: { cup: 150 } },
    { id: "pineapple", name: "Pineapple", category: "Fruit", calories: 50, protein_g: 0.5, carbs_g: 13.1, fat_g: 0.1, servingSizes: { cup: 150 } },
    { id: "papaya", name: "Papaya", category: "Fruit", calories: 43, protein_g: 0.5, carbs_g: 10.8, fat_g: 0.3, servingSizes: { cup: 150 } },
    { id: "mango", name: "Mango", category: "Fruit", calories: 60, protein_g: 0.8, carbs_g: 15, fat_g: 0.4, servingSizes: { cup: 150 } },
    { id: "dates", name: "Dates", category: "Fruit", calories: 282, protein_g: 2.5, carbs_g: 75, fat_g: 0.4, servingSizes: { piece: 8, serving: 30 } },

    // Vegetables
    { id: "carrot", name: "Carrot", category: "Vegetable", calories: 41, protein_g: 0.9, carbs_g: 9.6, fat_g: 0.2, servingSizes: { piece: 60, cup: 120 } },
    { id: "cucumber", name: "Cucumber", category: "Vegetable", calories: 15, protein_g: 0.7, carbs_g: 3.6, fat_g: 0.1, servingSizes: { piece: 100, cup: 100 } },
    { id: "tomato", name: "Tomato", category: "Vegetable", calories: 18, protein_g: 0.9, carbs_g: 3.9, fat_g: 0.2, servingSizes: { piece: 100, cup: 150 } },
    { id: "spinach", name: "Spinach", category: "Vegetable", calories: 23, protein_g: 2.9, carbs_g: 3.6, fat_g: 0.4, servingSizes: { cup: 30, serving: 100 } },
    { id: "beetroot", name: "Beetroot", category: "Vegetable", calories: 43, protein_g: 1.6, carbs_g: 9.6, fat_g: 0.2, servingSizes: { piece: 80, cup: 100 } },
    { id: "okra", name: "Ladies Finger (Okra)", category: "Vegetable", calories: 33, protein_g: 1.9, carbs_g: 7.5, fat_g: 0.2, servingSizes: { cup: 100 } },
    { id: "cauliflower", name: "Cauliflower", category: "Vegetable", calories: 25, protein_g: 1.9, carbs_g: 5, fat_g: 0.3, servingSizes: { cup: 100 } },

    // Dairy and plant protein
    { id: "paneer", name: "Paneer", category: "Dairy", calories: 265, protein_g: 18.3, carbs_g: 1.2, fat_g: 20.8, servingSizes: { piece: 50, serving: 100 } },
    { id: "tofu", name: "Tofu", category: "Protein", calories: 76, protein_g: 8, carbs_g: 1.9, fat_g: 4.8, servingSizes: { piece: 100, serving: 100 } },
    { id: "sprouts", name: "Mixed Sprouts", category: "Protein", calories: 100, protein_g: 7, carbs_g: 18, fat_g: 1, servingSizes: { cup: 100, serving: 100 } },

    // Fish, meat and egg
    { id: "fish-curry", name: "Fish Curry", category: "Non-Vegetarian", calories: 140, protein_g: 15, carbs_g: 3, fat_g: 7, servingSizes: { cup: 180, bowl: 180 } },
    { id: "grilled-fish", name: "Grilled Fish", category: "Non-Vegetarian", calories: 150, protein_g: 26, carbs_g: 0, fat_g: 5, servingSizes: { piece: 100 } },
    { id: "mutton-curry", name: "Mutton Curry", category: "Non-Vegetarian", calories: 220, protein_g: 17, carbs_g: 4, fat_g: 15, servingSizes: { cup: 180, bowl: 180 } },
    { id: "omelette", name: "Plain Omelette", category: "Protein", calories: 154, protein_g: 11, carbs_g: 1.1, fat_g: 12, servingSizes: { piece: 60, serving: 60 } },
    { id: "maggi", name: "Maggi Noodles", category: "Noodles", calories: 310, protein_g: 7, carbs_g: 44, fat_g: 12, servingSizes: { cup: 150, packet: 70 } },
];

// Nutrition values are approximate per 100 g; actual values vary by recipe and preparation.

export function searchIndianFoods(searchTerm) {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return [];

    return INDIAN_FOOD_NUTRITION.filter((food) =>
        `${food.name} ${food.category}`.toLowerCase().includes(term)
    );
}

export function calculateFoodNutrition(food, quantity, unit) {
    const amount = Number(quantity);

    if (!food || !Number.isFinite(amount) || amount <= 0) {
        return null;
    }

    // Millilitres are not converted because food density varies.
    if (unit === "ml") return null;

    const gramsPerUnit =
        unit === "g"
            ? 1
            : food.servingSizes?.[unit] ??
            DEFAULT_SERVING_SIZES[unit];

    if (!gramsPerUnit) return null;

    const totalGrams = amount * gramsPerUnit;
    const multiplier = totalGrams / 100;

    return {
        calories: Number((food.calories * multiplier).toFixed(1)),
        protein_g: Number((food.protein_g * multiplier).toFixed(1)),
        carbs_g: Number((food.carbs_g * multiplier).toFixed(1)),
        fat_g: Number((food.fat_g * multiplier).toFixed(1)),
    };
}