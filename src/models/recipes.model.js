const path = require('path');
const fs = require('fs/promises');

const recipesFilePath = path.join(__dirname, '..', '..', 'data', 'recipes.json');

async function readRecipesFile() {
  try {
    const data = await fs.readFile(recipesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeRecipesFile(recipes) {
  await fs.writeFile(recipesFilePath, JSON.stringify(recipes, null, 2), 'utf8');
}

module.exports = {
  readRecipesFile,
  writeRecipesFile,
};