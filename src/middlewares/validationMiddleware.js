const Joi = require('joi');

const recipeSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  ingredients: Joi.array().items(Joi.string()).min(1).required(),
  instructions: Joi.array().items(Joi.string()).min(1).required(),
  cookingTime: Joi.number().positive().required(),
  servings: Joi.number().integer().positive().required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
});

const validateRecipe = (req, res, next) => {
  const { error } = recipeSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: true,
      message: error.details[0].message,
      statusCode: 400,
    });
  }
  next();
};

module.exports = {
  validateRecipe,
};