// ===============================
// FlavorFind Recipe App
// API Search + Details Navigation
// ===============================

const BASE_URL = "https://dummyjson.com/recipes";
const ALL_RECIPES_URL = `${BASE_URL}?limit=50`;

// Grab HTML elements
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const mealTypeFilter = document.getElementById("mealTypeFilter");
const cuisineFilter = document.getElementById("cuisineFilter");
const sortFilter = document.getElementById("sortFilter");
const recipeContainer = document.getElementById("recipeContainer");
const favoritesContainer = document.getElementById("favoritesContainer");
const groceryList = document.getElementById("groceryList");
const clearGroceryBtn = document.getElementById("clearGroceryBtn");

// App state
let recipes = [];
let favorites = [];
let groceryItems = [];

// Fetch all recipes when page loads
async function fetchAllRecipes() {
  try {
    recipeContainer.innerHTML = `<p class="empty-message">Loading recipes...</p>`;

    const response = await fetch(ALL_RECIPES_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch recipes.");
    }

    const data = await response.json();

    recipes = data.recipes;

    populateFilters(recipes);
    applyFiltersAndSort();
    renderFavorites();
    renderGroceryList();
  } catch (error) {
    recipeContainer.innerHTML = `
      <p class="empty-message">
        Sorry, recipes could not be loaded. Please try again later.
      </p>
    `;

    console.error("API Error:", error);
  }
}

// Search recipes from API
async function searchRecipesFromAPI() {
  const searchText = searchInput.value.trim();

  if (searchText === "") {
    fetchAllRecipes();
    return;
  }

  try {
    recipeContainer.innerHTML = `<p class="empty-message">Searching recipes...</p>`;

    const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(searchText)}`);

    if (!response.ok) {
      throw new Error("Search request failed.");
    }

    const data = await response.json();

    recipes = data.recipes;

    populateFilters(recipes);
    applyFiltersAndSort();
  } catch (error) {
    recipeContainer.innerHTML = `
      <p class="empty-message">
        Sorry, search results could not be loaded.
      </p>
    `;

    console.error("Search API Error:", error);
  }
}

// Build filter dropdowns from current API results
function populateFilters(recipeList) {
  const cuisines = [...new Set(recipeList.map((recipe) => recipe.cuisine))].sort();

  const mealTypes = [
    ...new Set(
      recipeList.flatMap((recipe) => {
        return Array.isArray(recipe.mealType)
          ? recipe.mealType
          : [recipe.mealType];
      })
    )
  ].sort();

  cuisineFilter.innerHTML = `<option value="">Cuisine</option>`;
  mealTypeFilter.innerHTML = `<option value="">Meal Type</option>`;

  cuisines.forEach((cuisine) => {
    const option = document.createElement("option");
    option.value = cuisine.toLowerCase();
    option.textContent = cuisine;
    cuisineFilter.appendChild(option);
  });

  mealTypes.forEach((mealType) => {
    const option = document.createElement("option");
    option.value = mealType.toLowerCase();
    option.textContent = mealType;
    mealTypeFilter.appendChild(option);
  });
}

// Render recipe cards
function renderRecipes(recipeList) {
  recipeContainer.innerHTML = "";

  if (recipeList.length === 0) {
    recipeContainer.innerHTML = `<p class="empty-message">No recipes found.</p>`;
    return;
  }

  recipeList.forEach((recipe) => {
    const recipeCard = document.createElement("article");
    recipeCard.className = "recipe-card";
    recipeCard.dataset.id = recipe.id;

    const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.name}">

      <div class="recipe-info">
        <h3>${recipe.name}</h3>
        <p><strong>Cuisine:</strong> ${recipe.cuisine}</p>
        <p><strong>Meal Type:</strong> ${formatMealType(recipe.mealType)}</p>
        <p><strong>Time:</strong> ${totalTime} minutes</p>
        <p><strong>Difficulty:</strong> ${recipe.difficulty}</p>
        <p><strong>Rating:</strong> ⭐ ${recipe.rating}</p>

        <div class="ingredients-box">
          <h4>Ingredients:</h4>
          <ul>
            ${recipe.ingredients
              .slice(0, 5)
              .map((ingredient) => `<li>${ingredient}</li>`)
              .join("")}
          </ul>
        </div>

        <div class="card-buttons">
          <button class="details-btn" data-id="${recipe.id}">
            View Details
          </button>

          <button class="add-ingredients-btn" data-id="${recipe.id}">
            Add Ingredients
          </button>

          <button class="favorite-btn" data-id="${recipe.id}">
            ♡ Save
          </button>
        </div>
      </div>
    `;

    recipeContainer.appendChild(recipeCard);
  });
}

function formatMealType(mealType) {
  if (Array.isArray(mealType)) {
    return mealType.join(", ");
  }

  return mealType;
}

// Filter/sort current API search results
function applyFiltersAndSort() {
  const selectedMealType = mealTypeFilter.value;
  const selectedCuisine = cuisineFilter.value;
  const selectedSort = sortFilter.value;

  let filteredRecipes = recipes.filter((recipe) => {
    const recipeCuisine = recipe.cuisine.toLowerCase();

    const recipeMealTypes = Array.isArray(recipe.mealType)
      ? recipe.mealType.map((type) => type.toLowerCase())
      : [recipe.mealType.toLowerCase()];

    const matchesMealType =
      selectedMealType === "" || recipeMealTypes.includes(selectedMealType);

    const matchesCuisine =
      selectedCuisine === "" || recipeCuisine === selectedCuisine;

    return matchesMealType && matchesCuisine;
  });

  if (selectedSort === "az") {
    filteredRecipes.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (selectedSort === "za") {
    filteredRecipes.sort((a, b) => b.name.localeCompare(a.name));
  }

  if (selectedSort === "quickest") {
    filteredRecipes.sort((a, b) => {
      const timeA = a.prepTimeMinutes + a.cookTimeMinutes;
      const timeB = b.prepTimeMinutes + b.cookTimeMinutes;

      return timeA - timeB;
    });
  }

  if (selectedSort === "highest-rated") {
    filteredRecipes.sort((a, b) => b.rating - a.rating);
  }

  renderRecipes(filteredRecipes);
}

// Favorites
function addToFavorites(recipeId) {
  const recipe = recipes.find((item) => item.id === recipeId);

  if (!recipe) return;

  const alreadySaved = favorites.some((item) => item.id === recipeId);

  if (alreadySaved) {
    alert("This recipe is already saved.");
    return;
  }

  favorites.push(recipe);
  renderFavorites();
}

function renderFavorites() {
  favoritesContainer.innerHTML = "";

  if (favorites.length === 0) {
    favoritesContainer.innerHTML = `<p>No favorite recipes saved yet.</p>`;
    return;
  }

  favorites.forEach((recipe) => {
    const favoriteCard = document.createElement("article");
    favoriteCard.className = "recipe-card";
    favoriteCard.dataset.id = recipe.id;

    const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

    favoriteCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.name}">

      <div class="recipe-info">
        <h3>${recipe.name}</h3>
        <p><strong>Cuisine:</strong> ${recipe.cuisine}</p>
        <p><strong>Meal Type:</strong> ${formatMealType(recipe.mealType)}</p>
        <p><strong>Time:</strong> ${totalTime} minutes</p>

        <div class="card-buttons">
          <button class="details-btn" data-id="${recipe.id}">
            View Details
          </button>

          <button class="add-ingredients-btn" data-id="${recipe.id}">
            Add Ingredients
          </button>

          <button class="remove-favorite-btn" data-id="${recipe.id}">
            Remove
          </button>
        </div>
      </div>
    `;

    favoritesContainer.appendChild(favoriteCard);
  });
}

function removeFromFavorites(recipeId) {
  favorites = favorites.filter((recipe) => recipe.id !== recipeId);
  renderFavorites();
}

// Grocery list
function addIngredientsToGroceryList(recipeId) {
  const recipe = recipes.find((item) => item.id === recipeId);

  if (!recipe) return;

  recipe.ingredients.forEach((ingredient) => {
    if (!groceryItems.includes(ingredient)) {
      groceryItems.push(ingredient);
    }
  });

  renderGroceryList();
}

function renderGroceryList() {
  groceryList.innerHTML = "";

  if (groceryItems.length === 0) {
    groceryList.innerHTML = `<li>No ingredients added yet.</li>`;
    return;
  }

  groceryItems.forEach((item) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>${item}</span>

      <button class="remove-ingredient-btn" data-item="${item}">
        Remove
      </button>
    `;

    groceryList.appendChild(li);
  });
}

function removeGroceryItem(itemName) {
  groceryItems = groceryItems.filter((item) => item !== itemName);
  renderGroceryList();
}

function clearGroceryList() {
  groceryItems = [];
  renderGroceryList();
}

// Event listeners
searchBtn.addEventListener("click", searchRecipesFromAPI);

searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchRecipesFromAPI();
  }
});

mealTypeFilter.addEventListener("change", applyFiltersAndSort);
cuisineFilter.addEventListener("change", applyFiltersAndSort);
sortFilter.addEventListener("change", applyFiltersAndSort);

clearGroceryBtn.addEventListener("click", clearGroceryList);

// Recipe card clicks
recipeContainer.addEventListener("click", function (event) {
  const recipeId = Number(event.target.dataset.id);

  if (event.target.classList.contains("favorite-btn")) {
    addToFavorites(recipeId);
    return;
  }

  if (event.target.classList.contains("add-ingredients-btn")) {
    addIngredientsToGroceryList(recipeId);
    return;
  }

  if (event.target.classList.contains("details-btn")) {
    window.location.href = `details.html?id=${recipeId}`;
    return;
  }

  const card = event.target.closest(".recipe-card");

  if (card) {
    window.location.href = `details.html?id=${card.dataset.id}`;
  }
});

favoritesContainer.addEventListener("click", function (event) {
  const recipeId = Number(event.target.dataset.id);

  if (event.target.classList.contains("remove-favorite-btn")) {
    removeFromFavorites(recipeId);
    return;
  }

  if (event.target.classList.contains("add-ingredients-btn")) {
    addIngredientsToGroceryList(recipeId);
    return;
  }

  if (event.target.classList.contains("details-btn")) {
    window.location.href = `details.html?id=${recipeId}`;
    return;
  }

  const card = event.target.closest(".recipe-card");

  if (card) {
    window.location.href = `details.html?id=${card.dataset.id}`;
  }
});

groceryList.addEventListener("click", function (event) {
  if (event.target.classList.contains("remove-ingredient-btn")) {
    const itemName = event.target.dataset.item;
    removeGroceryItem(itemName);
  }
});

// Load page
fetchAllRecipes();