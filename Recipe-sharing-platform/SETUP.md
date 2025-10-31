# RecipeShare Setup Guide

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - You can use either:
  - Local MongoDB installation - [Download here](https://www.mongodb.com/try/download/community)
  - MongoDB Atlas (cloud) - [Sign up here](https://www.mongodb.com/atlas)
- **npm** or **yarn** (comes with Node.js)

## Quick Start

### 1. Install Dependencies

**Backend Dependencies:**
```bash
cd backend
npm install
```

**Frontend Dependencies:**
```bash
cd frontend
npm install
```

### 2. Environment Setup

The `.env` files are already created with default values. For production, make sure to:

**Backend (.env):**
- Change `JWT_SECRET` to a secure random string
- Update `MONGODB_URI` if using MongoDB Atlas or different local setup

**Frontend (.env):**
- Update `REACT_APP_API_URL` if deploying to different domains

### 3. Database Setup

**Option A: Local MongoDB**
1. Start MongoDB service on your system
2. The app will automatically create the `recipeshare` database

**Option B: MongoDB Atlas**
1. Create a free cluster on MongoDB Atlas
2. Get your connection string
3. Replace `MONGODB_URI` in `backend/.env` with your Atlas connection string

### 4. Start the Application

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```
The backend will start on http://localhost:5000

**Terminal 2 - Frontend Development Server:**
```bash
cd frontend
npm start
```
The frontend will start on http://localhost:3000

## Available Scripts

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (placeholder)

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Recipes
- `GET /api/recipes` - Get all recipes (with filtering)
- `POST /api/recipes` - Create new recipe (auth required)
- `GET /api/recipes/:id` - Get recipe by ID
- `PUT /api/recipes/:id` - Update recipe (auth required)
- `DELETE /api/recipes/:id` - Delete recipe (auth required)
- `POST /api/recipes/:id/rate` - Rate a recipe (auth required)

### Users
- `GET /api/users/profile` - Get user profile (auth required)
- `PUT /api/users/profile` - Update profile (auth required)
- `POST /api/users/favorites/:recipeId` - Toggle favorite (auth required)
- `GET /api/users/favorites` - Get user favorites (auth required)
- `GET /api/users/my-recipes` - Get user's recipes (auth required)

## Project Structure

```
RecipeShare/
├── backend/                 # Express.js API server
│   ├── middleware/         # Authentication middleware
│   ├── models/            # MongoDB models (User, Recipe)
│   ├── routes/            # API routes (auth, recipes, users)
│   ├── .env               # Environment variables
│   ├── .env.example       # Environment template
│   ├── package.json       # Backend dependencies
│   └── server.js          # Main server file
├── frontend/               # React.js client
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions (API)
│   │   ├── App.js         # Main App component
│   │   └── index.js       # Entry point
│   ├── .env               # Frontend environment variables
│   ├── package.json       # Frontend dependencies
│   └── tailwind.config.js # TailwindCSS configuration
└── README.md              # Project documentation
```

## Features Implemented

✅ **Authentication System**
- User registration and login
- JWT token-based authentication
- Protected routes

✅ **Recipe Management**
- Create, read, update, delete recipes
- Recipe ingredients and instructions
- Recipe categories and difficulty levels
- Cooking time and servings

✅ **Rating & Review System**
- 5-star rating system
- User comments on recipes
- Average rating calculation

✅ **User Features**
- User profiles
- Favorite recipes
- Personal recipe collections

✅ **Modern UI/UX**
- Responsive design with TailwindCSS
- Modern component library
- Smooth animations and transitions
- Mobile-friendly interface

## Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running locally, or
- Check your Atlas connection string and whitelist your IP

**Port Already in Use:**
- Change ports in `.env` files if 3000 or 5000 are occupied

**Module Not Found:**
- Run `npm install` in both backend and frontend directories

**CORS Errors:**
- The backend is configured to accept requests from the frontend
- Check that both servers are running on correct ports

## Next Steps

The application is ready for development! You can:

1. **Add More Features:**
   - Image upload for recipes
   - Advanced search and filtering
   - Recipe collections/cookbooks
   - Social features (follow users)

2. **Enhance UI:**
   - Add more animations
   - Implement dark mode
   - Add recipe print functionality

3. **Deploy:**
   - Backend: Heroku, Railway, or DigitalOcean
   - Frontend: Netlify, Vercel, or GitHub Pages
   - Database: MongoDB Atlas

## Support

If you encounter any issues:
1. Check this setup guide
2. Verify all dependencies are installed
3. Ensure environment variables are set correctly
4. Check console logs for error messages
