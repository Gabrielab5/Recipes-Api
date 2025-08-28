const express = require('express');
const router = express.Router();
const { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, getRecipeStats } = require('../controllers/recipes.controller');
const { validateRecipe } = require('../middlewares/validationMiddleware');

// Retrieve all recipes
router.get('/', getAllRecipes);

// Get recipe statistics (should come before /:id to avoid conflicts)
router.get('/stats', getRecipeStats);

// Retrieve a single recipe by ID
router.get('/:id', getRecipeById);

// Create a new recipe
router.post('/', validateRecipe, createRecipe);

// Update an existing recipe
router.put('/:id', validateRecipe, updateRecipe);

// Delete a recipe
router.delete('/:id', deleteRecipe);


module.exports = router;