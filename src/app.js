const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const morgan = require('morgan');
const recipesRoutes = require('./routes/recipes.routes');
app.use(express.json());
app.use(morgan('tiny')); // Using morgan for logging
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/recipes', recipesRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Recipes API!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});