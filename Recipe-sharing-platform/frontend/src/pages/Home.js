import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { recipeAPI } from '../utils/api';
import { 
  ChefHat, 
  Search, 
  Star, 
  Clock, 
  Users, 
  ArrowRight,
  Heart
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedRecipes = async () => {
      try {
        const response = await recipeAPI.getAll({
          limit: 6,
          sortBy: 'averageRating',
          sortOrder: 'desc'
        });
        setFeaturedRecipes(response.data.recipes);
      } catch (error) {
        console.error('Error fetching featured recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedRecipes();
  }, []);

  const RecipeCard = ({ recipe }) => (
    <Link 
      to={`/recipes/${recipe._id}`}
      className="card hover:shadow-lg transition-shadow duration-300 group"
    >
      <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-t-lg overflow-hidden">
        {recipe.image ? (
          <img 
            src={recipe.image} 
            alt={recipe.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <ChefHat className="h-12 w-12 text-primary-400" />
          </div>
        )}
      </div>
      <div className="card-content">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-600 transition-colors">
          {recipe.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {recipe.description}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {recipe.totalTime || recipe.cookingTime + recipe.prepTime}min
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-400" />
              {recipe.averageRating?.toFixed(1) || '0.0'}
            </div>
          </div>
          <div className="flex items-center">
            <Heart className="h-4 w-4 mr-1" />
            {recipe.favorites || 0}
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Share Your
              <span className="text-primary-600 block">Culinary Creations</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover amazing recipes, share your own creations, and connect with food lovers 
              from around the world. Join our community of passionate cooks and food enthusiasts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/recipes" 
                className="btn btn-primary btn-lg flex items-center"
              >
                <Search className="h-5 w-5 mr-2" />
                Discover Recipes
              </Link>
              {isAuthenticated ? (
                <Link 
                  to="/create-recipe" 
                  className="btn btn-outline btn-lg flex items-center"
                >
                  <ChefHat className="h-5 w-5 mr-2" />
                  Share Your Recipe
                </Link>
              ) : (
                <Link 
                  to="/register" 
                  className="btn btn-outline btn-lg flex items-center"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Join Community
                </Link>
              )}
            </div>

            {isAuthenticated && (
              <p className="mt-4 text-gray-600">
                Welcome back, <span className="font-semibold">{user?.firstName}</span>! 
                Ready to cook something amazing?
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <ChefHat className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">10,000+</h3>
              <p className="text-gray-600">Delicious Recipes</p>
            </div>
            <div className="p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">5,000+</h3>
              <p className="text-gray-600">Active Cooks</p>
            </div>
            <div className="p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">50,000+</h3>
              <p className="text-gray-600">Recipe Reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Featured Recipes
              </h2>
              <p className="text-gray-600">
                Discover the most loved recipes from our community
              </p>
            </div>
            <Link 
              to="/recipes" 
              className="btn btn-outline flex items-center"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="card-content">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRecipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Cooking?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of home cooks sharing their favorite recipes. 
            Create your account today and start your culinary journey!
          </p>
          {!isAuthenticated && (
            <Link 
              to="/register" 
              className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg"
            >
              Get Started Free
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
