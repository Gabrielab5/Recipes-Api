const path = require('path');
const fs = require('fs/promises');

const recipesFilePath = path.join(__dirname, '..', '..', 'data', 'recipes.json');

async function readRecipesFile() {
  try {
    const data = await fs.readFile(recipesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
     if (error.code === 'ENOENT') {
      console.log('Recipes file not found, starting with an empty array.');
    } else {
      console.error('Error reading or parsing recipes file:', error);
    }
    return [];
  }
}

async function writeRecipesFile(recipes) {
  try {
    await fs.writeFile(recipesFilePath, JSON.stringify(recipes, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing recipes file:', error);
    throw error;
  }
}

module.exports = {
  readRecipesFile,
  writeRecipesFile,
};