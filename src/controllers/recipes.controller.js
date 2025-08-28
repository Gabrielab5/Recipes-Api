const { readRecipesFile, writeRecipesFile } = require('../models/recipes.model');
const { v4: uuidv4 } = require('uuid');

async function getAllRecipes(req, res) {
  try {
    const recipes = await readRecipesFile();
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving recipes', error });
  }
}

async function createRecipe(req, res) {
  try {
    const newRecipe = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    const recipes = await readRecipesFile();
    recipes.push(newRecipe);
    await writeRecipesFile(recipes);
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(500).json({ message: 'Error creating recipe', error });
  }
}

module.exports = {
  getAllRecipes,
  createRecipe,
};