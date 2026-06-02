// ===============================
// FlavorFind Details Page
// ===============================

const detailsContainer = document.getElementById("detailsContainer");
const params = new URLSearchParams(window.location.search);
const recipeId = params.get("id");

async function fetchRecipeDetails() {
  if (!recipeId) {
    detailsContainer.innerHTML = `<p class="empty-message">No recipe selected.</p>`;
    return;
  }

  try {
    const response = await fetch(`https://dummyjson.com/recipes/${recipeId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch recipe details.");
    }

    const recipe = await response.json();

    renderRecipeDetails(recipe);
  } catch (error) {
    detailsContainer.innerHTML = `
      <p class="empty-message">
        Sorry, this recipe could not be loaded.
      </p>
    `;

    console.error("Details API Error:", error);
  }
}

function renderRecipeDetails(recipe) {
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  detailsContainer.innerHTML = `
    <article class="details-card">
      <img src="${recipe.image}" alt="${recipe.name}">

      <div class="recipe-info">
        <h2>${recipe.name}</h2>

        <p><strong>Cuisine:</strong> ${recipe.cuisine}</p>
        <p><strong>Meal Type:</strong> ${formatMealType(recipe.mealType)}</p>
        <p><strong>Total Time:</strong> ${totalTime} minutes</p>
        <p><strong>Servings:</strong> ${recipe.servings}</p>
        <p><strong>Difficulty:</strong> ${recipe.difficulty}</p>
        <p><strong>Calories:</strong> ${recipe.caloriesPerServing} per serving</p>
        <p><strong>Rating:</strong> ⭐ ${recipe.rating}</p>

        <div class="ingredients-box">
          <h3>Ingredients</h3>
          <ul>
            ${recipe.ingredients.map((ingredient) => `<li>${ingredient}</li>`).join("")}
          </ul>
        </div>

        <div class="ingredients-box">
          <h3>Instructions</h3>
          <ol>
            ${recipe.instructions.map((step) => `<li>${step}</li>`).join("")}
          </ol>
        </div>

        <a class="back-link" href="index.html">← Back to Recipes</a>
      </div>
    </article>
  `;
}

function formatMealType(mealType) {
  if (Array.isArray(mealType)) {
    return mealType.join(", ");
  }

  return mealType;
}

fetchRecipeDetails();