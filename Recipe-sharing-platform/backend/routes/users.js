const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favoriteRecipes', 'title image averageRating cookingTime prepTime')
      .select('-password');

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('username').optional().isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { firstName, lastName, bio, username } = req.body;
    const updateFields = {};

    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (bio !== undefined) updateFields.bio = bio;
    if (username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      updateFields.username = username;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// @route   POST /api/users/favorites/:recipeId
// @desc    Toggle favorite recipe
// @access  Private
router.post('/favorites/:recipeId', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const user = await User.findById(req.user._id);
    const isFavorited = user.favoriteRecipes.includes(req.params.recipeId);

    if (isFavorited) {
      // Remove from favorites
      user.favoriteRecipes = user.favoriteRecipes.filter(
        id => id.toString() !== req.params.recipeId
      );
      recipe.favorites = Math.max(0, recipe.favorites - 1);
    } else {
      // Add to favorites
      user.favoriteRecipes.push(req.params.recipeId);
      recipe.favorites += 1;
    }

    await Promise.all([user.save(), recipe.save()]);

    res.json({
      message: isFavorited ? 'Recipe removed from favorites' : 'Recipe added to favorites',
      isFavorited: !isFavorited,
      favoritesCount: recipe.favorites
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error while updating favorites' });
  }
});

// @route   GET /api/users/favorites
// @desc    Get user's favorite recipes
// @access  Private
router.get('/favorites', auth, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const user = await User.findById(req.user._id)
      .populate({
        path: 'favoriteRecipes',
        populate: {
          path: 'author',
          select: 'username firstName lastName avatar'
        },
        options: {
          limit: limit * 1,
          skip: (page - 1) * limit,
          sort: { createdAt: -1 }
        }
      });

    const totalFavorites = user.favoriteRecipes.length;

    res.json({
      recipes: user.favoriteRecipes,
      totalPages: Math.ceil(totalFavorites / limit),
      currentPage: parseInt(page),
      total: totalFavorites
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Server error while fetching favorites' });
  }
});

// @route   GET /api/users/my-recipes
// @desc    Get current user's recipes
// @access  Private
router.get('/my-recipes', auth, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const recipes = await Recipe.find({ author: req.user._id })
      .populate('author', 'username firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Recipe.countDocuments({ author: req.user._id });

    res.json({
      recipes,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get my recipes error:', error);
    res.status(500).json({ message: 'Server error while fetching your recipes' });
  }
});

// @route   GET /api/users/:userId
// @desc    Get user profile by ID (public)
// @access  Public
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -email -favoriteRecipes');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's public recipe count
    const recipeCount = await Recipe.countDocuments({ 
      author: req.params.userId, 
      isPublic: true 
    });

    res.json({
      ...user.toJSON(),
      recipesCreated: recipeCount
    });
  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// @route   GET /api/users
// @desc    Get all users (for discovery)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const filter = {};
    if (search) {
      filter.$or = [
        { username: new RegExp(search, 'i') },
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(filter)
      .select('username firstName lastName avatar bio recipesCreated joinedDate')
      .sort({ recipesCreated: -1, joinedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

module.exports = router;
