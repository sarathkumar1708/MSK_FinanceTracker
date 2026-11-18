
const API_URL = "https://world.openfoodfacts.org/cgi/search.pl";

export const foodNutritionService = {
    async searchFoods(searchTerm) {
        const term = searchTerm.trim();

        if (term.length < 3) {
            return [];
        }

        const params = new URLSearchParams({
            search_terms: term,
            search_simple: "1",
            action: "process",
            json: "1",
            page: "1",
            page_size: "10",
            fields: [
                "product_name",
                "brands",
                "nutriments",
                "quantity",
                "code",
            ].join(","),
        });

        const response = await fetch(`${API_URL}?${params}`);

        if (!response.ok) {
            throw new Error("Unable to search food nutrition.");
        }

        const result = await response.json();

        return (result.products || [])
            .filter((product) => product.product_name)
            .map((product) => {
                const nutrition = product.nutriments || {};

                return {
                    name: product.product_name,
                    brand: product.brands || "",
                    quantity: product.quantity || "",
                    code: product.code,

                    // Nutrition values are per 100 g where available.
                    calories:
                        nutrition["energy-kcal_100g"] ??
                        (Number(nutrition["energy_100g"] || 0) / 4.184),

                    protein_g: nutrition.proteins_100g ?? 0,
                    carbs_g: nutrition.carbohydrates_100g ?? 0,
                    fat_g: nutrition.fat_100g ?? 0,

                    source: "Open Food Facts",
                };
            });
    },
};
