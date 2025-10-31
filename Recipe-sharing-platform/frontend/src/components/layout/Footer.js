import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <ChefHat className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">RecipeShare</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Discover, share, and save your favorite recipes. Join our community of food lovers 
              and culinary enthusiasts from around the world.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/recipes" className="text-gray-300 hover:text-white transition-colors">
                  Discover Recipes
                </Link>
              </li>
              <li>
                <Link to="/create-recipe" className="text-gray-300 hover:text-white transition-colors">
                  Share Recipe
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/recipes?category=Breakfast" className="text-gray-300 hover:text-white transition-colors">
                  Breakfast
                </Link>
              </li>
              <li>
                <Link to="/recipes?category=Lunch" className="text-gray-300 hover:text-white transition-colors">
                  Lunch
                </Link>
              </li>
              <li>
                <Link to="/recipes?category=Dinner" className="text-gray-300 hover:text-white transition-colors">
                  Dinner
                </Link>
              </li>
              <li>
                <Link to="/recipes?category=Dessert" className="text-gray-300 hover:text-white transition-colors">
                  Desserts
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 RecipeShare. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
