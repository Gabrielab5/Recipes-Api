const { readRecipesFile, writeRecipesFile } = require('../models/recipes.model');
const { v4: uuidv4 } = require('uuid');

async function getAllRecipes(req, res) {
  try {
    const recipes = await readRecipesFile();
    let filteredRecipes = recipes;

    // Filter by difficulty
    if (req.query.difficulty) {
      filteredRecipes = filteredRecipes.filter(
        recipe => recipe.difficulty === req.query.difficulty
      );
    }

    // Filter by max cooking time
    if (req.query.maxCookingTime) {
      const maxTime = parseInt(req.query.maxCookingTime);
      filteredRecipes = filteredRecipes.filter(
        recipe => recipe.cookingTime <= maxTime
      );
    }

    // Search in title and description
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      filteredRecipes = filteredRecipes.filter(
        recipe => 
          recipe.title.toLowerCase().includes(searchTerm) ||
          recipe.description.toLowerCase().includes(searchTerm)
      );
    }

    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error retrieving recipes', statusCode: 500 });
  }
}

async function getRecipeById(req, res) {
  try {
    const { id } = req.params;
    const recipes = await readRecipesFile();
    const recipe = recipes.find(r => r.id === id);

    if (!recipe) {
      return res.status(404).json({
        error: true,
        message: 'Recipe not found',
        statusCode: 404
      });
    }

    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error retrieving recipe',
      statusCode: 500
    });
  }
}

async function createRecipe(req, res) {
  try {
    const newRecipe = {
      id: uuidv4(),
      ...req.body,
      rating: 0, 
      createdAt: new Date().toISOString(),
    };
    const recipes = await readRecipesFile();
    recipes.push(newRecipe);
    await writeRecipesFile(recipes);
    res.status(201).json(newRecipe);

  } catch (error) {
    res.status(500).json({ error: true, message: 'Error creating recipe',statusCode:500 });
  }
}

async function updateRecipe(req, res) {
    try {
        const { id } = req.params;
        const recipes = await readRecipesFile();
        const recipeIndex = recipes.findIndex(r => r,id ===id);

        if(recipeIndex === -1) {
            return res.status(404).json({error: true, message: 'Recipe not found', statusCode: 404})
        }

        const updatedRecipe = { 
            ...recipes[recipeIndex], 
            ...req.body, 
            id : recipes[recipeIndex].id,
            createdAt: recipes[recipes].createdAt,
            updatedAt: new Date().toISOString()
        };

        recipes[recipeIndex] = updatedRecipe;
        await writeRecipesFile(recipes)
        res.status(200).json(updatedRecipe);
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error updating recipe',
            statusCode: 500
        });
    }       
}

async function deleteRecipe(req, res) {
  try {
    const { id } = req.params;
    const recipes = await readRecipesFile();
    const recipeIndex = recipes.findIndex(r => r.id === id);

    if (recipeIndex === -1) {
      return res.status(404).json({
        error: true,
        message: 'Recipe not found',
        statusCode: 404
      });
    }

    recipes.splice(recipeIndex, 1);
    await writeRecipesFile(recipes);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error deleting recipe',
      statusCode: 500
    });
  }
}

async function getRecipeStats(req, res) {
  try {
    const recipes = await readRecipesFile();

    if (recipes.length === 0) {
      return res.status(200).json({
        totalRecipes: 0,
        averageCookingTime: 0,
        recipesByDifficulty: {
          easy: 0,
          medium: 0,
          hard: 0
        },
        mostCommonIngredients: []
      });
    }

    // Calculate average cooking time
    const averageCookingTime = recipes.reduce((sum, recipe) => sum + recipe.cookingTime, 0) / recipes.length;

    // Count recipes by difficulty
    const recipesByDifficulty = recipes.reduce((counts, recipe) => {
      counts[recipe.difficulty] = (counts[recipe.difficulty] || 0) + 1;
      return counts;
    }, { easy: 0, medium: 0, hard: 0 });

    // Find most common ingredients
    const ingredientCounts = {};
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const normalizedIngredient = ingredient.toLowerCase().trim();
        ingredientCounts[normalizedIngredient] = (ingredientCounts[normalizedIngredient] || 0) + 1;
      });
    });

    const mostCommonIngredients = Object.entries(ingredientCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ingredient, count]) => ({ ingredient, count }));

    const stats = {
      totalRecipes: recipes.length,
      averageCookingTime: Math.round(averageCookingTime * 100) / 100,
      recipesByDifficulty,
      mostCommonIngredients
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error retrieving recipe statistics',
      statusCode: 500
    });
  }
}

module.exports = {
  getAllRecipes,
  createRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getRecipeStats
};