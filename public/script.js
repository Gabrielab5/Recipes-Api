document.addEventListener('DOMContentLoaded', () => {
    const recipesContainer = document.getElementById('recipesContainer');
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const difficultyFilter = document.getElementById('difficultyFilter');
    const maxTimeInput = document.getElementById('maxTimeInput');
    const addRecipeForm = document.getElementById('addRecipeForm');

    // Function to fetch and display recipes
    const fetchRecipes = async (query = {}) => {
        // Construct query string
        const queryString = new URLSearchParams(query).toString();
        const url = `/api/recipes?${queryString}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const recipes = await response.json();
            displayRecipes(recipes);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            recipesContainer.innerHTML = `<p class="text-center text-red-500">Failed to load recipes. Please try again.</p>`;
        }
    };

    // Function to dynamically render recipes on the page
    const displayRecipes = (recipes) => {
        recipesContainer.innerHTML = '';
        if (recipes.length === 0) {
            recipesContainer.innerHTML = `<p class="text-center text-gray-500">No recipes found matching your criteria.</p>`;
            return;
        }

        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'bg-blue-50 rounded-lg p-6 flex flex-col justify-between';
            recipeCard.innerHTML = `
                <div>
                    <h3 class="text-xl font-semibold text-gray-800">${recipe.title}</h3>
                    <p class="text-sm text-gray-500 mb-2">Difficulty: <span class="capitalize">${recipe.difficulty}</span> | Time: ${recipe.cookingTime} min</p>
                    <p class="text-gray-600 mb-4">${recipe.description}</p>
                    <div class="mt-2">
                        <h4 class="font-medium text-gray-700">Ingredients:</h4>
                        <ul class="list-disc list-inside text-gray-600 text-sm">
                            ${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="mt-2">
                        <h4 class="font-medium text-gray-700">Instructions:</h4>
                        <ul class="list-disc list-inside text-gray-600 text-sm">
                            ${recipe.instructions.map(i => `<li>${i}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            recipesContainer.appendChild(recipeCard);
        });
    };

    // Handle search and filter button click
    searchButton.addEventListener('click', () => {
        const query = {};
        if (searchInput.value) {
            query.search = searchInput.value;
        }
        if (difficultyFilter.value) {
            query.difficulty = difficultyFilter.value;
        }
        if (maxTimeInput.value) {
            query.maxCookingTime = maxTimeInput.value;
        }
        fetchRecipes(query);
    });

    // Handle form submission for new recipe
    addRecipeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newRecipe = {
            title: document.getElementById('recipeTitle').value,
            description: document.getElementById('recipeDescription').value,
            ingredients: document.getElementById('recipeIngredients').value.split(',').map(item => item.trim()),
            instructions: document.getElementById('recipeInstructions').value.split(',').map(item => item.trim()),
            cookingTime: parseInt(document.getElementById('recipeCookingTime').value),
            servings: parseInt(document.getElementById('recipeServings').value),
            difficulty: document.getElementById('recipeDifficulty').value,
        };

        try {
            const response = await fetch('/api/recipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecipe),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add recipe.');
            }

            // Clear the form and refresh the recipes list
            addRecipeForm.reset();
            fetchRecipes();
            alert('Recipe added successfully!');
        } catch (error) {
            console.error('Error adding recipe:', error);
            alert(`Error adding recipe: ${error.message}`);
        }
    });

    // Initial fetch of recipes when the page loads
    fetchRecipes();
});
