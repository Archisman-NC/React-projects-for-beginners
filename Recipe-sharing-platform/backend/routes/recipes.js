const express = require('express');
const { body, validationResult } = require('express-validator');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/recipes
// @desc    Get all recipes with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      difficulty,
      cuisine,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minRating
    } = req.query;

    // Build filter object
    const filter = { isPublic: true };
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (cuisine) filter.cuisine = new RegExp(cuisine, 'i');
    if (minRating) filter.averageRating = { $gte: parseFloat(minRating) };
    
    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const recipes = await Recipe.find(filter)
      .populate('author', 'username firstName lastName avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Recipe.countDocuments(filter);

    res.json({
      recipes,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ message: 'Server error while fetching recipes' });
  }
});

// @route   GET /api/recipes/:id
// @desc    Get single recipe by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'username firstName lastName avatar bio')
      .populate('ratings.user', 'username firstName lastName avatar');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Increment view count
    recipe.views += 1;
    await recipe.save();

    res.json(recipe);
  } catch (error) {
    console.error('Get recipe error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error while fetching recipe' });
  }
});

// @route   POST /api/recipes
// @desc    Create a new recipe
// @access  Private
router.post('/', [
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required'),
  body('instructions').isArray({ min: 1 }).withMessage('At least one instruction is required'),
  body('cookingTime').isInt({ min: 1 }).withMessage('Cooking time must be at least 1 minute'),
  body('prepTime').isInt({ min: 1 }).withMessage('Prep time must be at least 1 minute'),
  body('servings').isInt({ min: 1 }).withMessage('Must serve at least 1 person'),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty level'),
  body('category').isIn(['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Appetizer', 'Beverage', 'Other']).withMessage('Invalid category'),
  body('cuisine').notEmpty().withMessage('Cuisine is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const recipeData = {
      ...req.body,
      author: req.user._id
    };

    const recipe = new Recipe(recipeData);
    await recipe.save();

    // Update user's recipe count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { recipesCreated: 1 }
    });

    await recipe.populate('author', 'username firstName lastName avatar');

    res.status(201).json({
      message: 'Recipe created successfully',
      recipe
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ message: 'Server error while creating recipe' });
  }
});

// @route   PUT /api/recipes/:id
// @desc    Update a recipe
// @access  Private (author only)
router.put('/:id', [
  auth,
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user is the author
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this recipe' });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('author', 'username firstName lastName avatar');

    res.json({
      message: 'Recipe updated successfully',
      recipe: updatedRecipe
    });
  } catch (error) {
    console.error('Update recipe error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error while updating recipe' });
  }
});

// @route   DELETE /api/recipes/:id
// @desc    Delete a recipe
// @access  Private (author only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user is the author
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this recipe' });
    }

    await Recipe.findByIdAndDelete(req.params.id);

    // Update user's recipe count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { recipesCreated: -1 }
    });

    // Remove from all users' favorites
    await User.updateMany(
      { favoriteRecipes: req.params.id },
      { $pull: { favoriteRecipes: req.params.id } }
    );

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error while deleting recipe' });
  }
});

// @route   POST /api/recipes/:id/rate
// @desc    Rate a recipe
// @access  Private
router.post('/:id/rate', [
  auth,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { rating, comment } = req.body;
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user already rated this recipe
    const existingRatingIndex = recipe.ratings.findIndex(
      r => r.user.toString() === req.user._id.toString()
    );

    if (existingRatingIndex > -1) {
      // Update existing rating
      recipe.ratings[existingRatingIndex].rating = rating;
      recipe.ratings[existingRatingIndex].comment = comment || '';
    } else {
      // Add new rating
      recipe.ratings.push({
        user: req.user._id,
        rating,
        comment: comment || ''
      });
    }

    await recipe.save();
    await recipe.populate('ratings.user', 'username firstName lastName avatar');

    res.json({
      message: 'Rating added successfully',
      recipe
    });
  } catch (error) {
    console.error('Rate recipe error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error while rating recipe' });
  }
});

// @route   GET /api/recipes/user/:userId
// @desc    Get recipes by user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const recipes = await Recipe.find({ 
      author: req.params.userId, 
      isPublic: true 
    })
      .populate('author', 'username firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Recipe.countDocuments({ 
      author: req.params.userId, 
      isPublic: true 
    });

    res.json({
      recipes,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get user recipes error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error while fetching user recipes' });
  }
});

module.exports = router;
