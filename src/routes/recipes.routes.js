const express = require('express');
const router = express.Router();
const { getAllRecipes, createRecipe } = require('../controllers/recipes.controller');
const { validateRecipe } = require('../middlewares/validationMiddleware');

// Retrieve all recipes
router.get('/', getAllRecipes);

// Create a new recipe
router.post('/', validateRecipe, createRecipe);

module.exports = router;