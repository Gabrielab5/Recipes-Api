const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const morgan = require('morgan');
const recipesRoutes = require('./routes/recipes.routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

app.use(express.json());
app.use(morgan('tiny')); // Using morgan for logging
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/recipes', recipesRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Recipes API!',
    version: '1.0.0',
    endpoints: {
      'GET /api/recipes': 'Get all recipes (with optional query filters)',
      'GET /api/recipes/:id': 'Get recipe by ID',
      'POST /api/recipes': 'Create new recipe',
      'PUT /api/recipes/:id': 'Update recipe',
      'DELETE /api/recipes/:id': 'Delete recipe',
      'GET /api/recipes/stats': 'Get recipe statistics'
    },
    queryParameters: {
      'difficulty': 'Filter by difficulty (easy, medium, hard)',
      'maxCookingTime': 'Filter by maximum cooking time in minutes',
      'search': 'Search in recipe title and description'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});