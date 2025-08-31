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

    // Sorting by rating
    if (req.query.sort) {
        const sortField = req.query.sort;
        const sortOrder = req.query.order === 'desc' ? -1 : 1;

        filteredRecipes.sort((a, b) => {
            if (sortField === 'rating') {
                const aRating = a.ratings && a.ratings.length > 0 ? a.ratings.reduce((sum, r) => sum + r, 0) / a.ratings.length : 0;
                const bRating = b.ratings && b.ratings.length > 0 ? b.ratings.reduce((sum, r) => sum + r, 0) / b.ratings.length : 0;
                return (aRating - bRating) * sortOrder;
            }
            if (sortField === 'cookingTime' || sortField === 'servings') {
                return (a[sortField] - b[sortField]) * sortOrder;
            }
            if (sortField === 'createdAt') {
                return (new Date(a.createdAt) - new Date(b.createdAt)) * sortOrder;
            }
            return 0;
        });
    }

    res.status(200).json(filteredRecipes);
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
      ratings: [],
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
        const recipeIndex = recipes.findIndex(r => r.id ===id);

        if(recipeIndex === -1) {
            return res.status(404).json({error: true, message: 'Recipe not found', statusCode: 404})
        }

        const updatedRecipe = { 
            ...recipes[recipeIndex], 
            ...req.body, 
            id : recipes[recipeIndex].id,
            ratings: existingRatings,
            createdAt: recipes[recipeIndex].createdAt,
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

// Adds a new rating to a recipe and updates the average rating.
async function updateRating(req, res) {
    try {
        const { id } = req.params;
        const { rating } = req.body;
        const recipes = await readRecipesFile();
        const recipeIndex = recipes.findIndex(r => r.id ===id);

        if(recipeIndex === -1) {
            return res.status(404).json({error: true, message: 'Recipe not found', statusCode: 404})
        }

        const recipe = recipes[recipeIndex];
        if (!recipe.ratings) recipe.ratings = [];
        recipe.ratings.push(rating);

        // Recalculating the average rating
        const averageRating = recipe.ratings.reduce((sum, r) => sum + r, 0) / recipe.ratings.length;
        recipe.rating = Math.round(averageRating * 10) / 10; 

        await writeRecipesFile(recipes);
        res.status(200).json({
          message: 'Rating updated successfully',
          newRating: recipe.rating
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error updating rating',
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
        averageRating: 0,
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

    // Calculate average rating across all recipes
    const totalRatingSum = recipes.reduce((sum, recipe) => {
        const averageRecipeRating = recipe.ratings && recipe.ratings.length > 0
          ? recipe.ratings.reduce((s, r) => s + r, 0) / recipe.ratings.length
          : 0;
        return sum + averageRecipeRating;
    }, 0);
    const averageRating = totalRatingSum / recipes.length;

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
      averageRating: Math.round(averageRating * 100) / 100,
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
  getRecipeStats,
  updateRating,
};