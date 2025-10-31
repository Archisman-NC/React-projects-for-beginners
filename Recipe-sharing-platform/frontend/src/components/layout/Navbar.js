import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ChefHat, 
  Search, 
  Plus, 
  User, 
  Heart, 
  BookOpen, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, className = '', onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive(to)
          ? 'bg-orange-100 text-orange-800'
          : 'text-gray-700 hover:text-orange-600 hover:bg-gray-100'
      } ${className}`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <span className="text-xl font-bold text-gray-900">RecipeShare</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/recipes">
              <Search className="h-4 w-4 inline mr-1" />
              Discover
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/create-recipe">
                  <Plus className="h-4 w-4 inline mr-1" />
                  Create Recipe
                </NavLink>
                <NavLink to="/my-recipes">
                  <BookOpen className="h-4 w-4 inline mr-1" />
                  My Recipes
                </NavLink>
                <NavLink to="/favorites">
                  <Heart className="h-4 w-4 inline mr-1" />
                  Favorites
                </NavLink>

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-100">
                    <User className="h-4 w-4" />
                    <span>{user?.firstName}</span>
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="h-4 w-4 inline mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <NavLink to="/login" className="btn btn-outline btn-sm">
                  Login
                </NavLink>
                <NavLink to="/register" className="btn btn-primary btn-sm">
                  Sign Up
                </NavLink>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <NavLink to="/recipes" onClick={() => setIsMenuOpen(false)}>
                <Search className="h-4 w-4 inline mr-2" />
                Discover Recipes
              </NavLink>

              {isAuthenticated ? (
                <>
                  <NavLink to="/create-recipe" onClick={() => setIsMenuOpen(false)}>
                    <Plus className="h-4 w-4 inline mr-2" />
                    Create Recipe
                  </NavLink>
                  <NavLink to="/my-recipes" onClick={() => setIsMenuOpen(false)}>
                    <BookOpen className="h-4 w-4 inline mr-2" />
                    My Recipes
                  </NavLink>
                  <NavLink to="/favorites" onClick={() => setIsMenuOpen(false)}>
                    <Heart className="h-4 w-4 inline mr-2" />
                    Favorites
                  </NavLink>
                  <NavLink to="/profile" onClick={() => setIsMenuOpen(false)}>
                    <User className="h-4 w-4 inline mr-2" />
                    Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-md"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <NavLink 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="btn btn-outline btn-sm w-full"
                  >
                    Login
                  </NavLink>
                  <NavLink 
                    to="/register" 
                    onClick={() => setIsMenuOpen(false)}
                    className="btn btn-primary btn-sm w-full"
                  >
                    Sign Up
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
