# RecipeShare - MERN Stack Recipe Sharing Platform

A full-stack web application where users can share, discover, and save their favorite recipes with ratings and comments.

## Features

- 🔐 User Authentication (Register/Login)
- 📝 Create, Edit, Delete Recipes
- ⭐ Rate and Review Recipes
- 🔍 Search and Filter Recipes
- 💾 Save Favorite Recipes
- 👤 User Profiles
- 📱 Responsive Design

## Tech Stack

- **Frontend**: React.js, TailwindCSS, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT

## Project Structure

```
RecipeShare/
├── backend/          # Express.js API server
├── frontend/         # React.js client
└── README.md
```

## Quick Start

### Automated Setup (Recommended)
```bash
# Make the setup script executable and run it
./start.sh
```

### Manual Setup
1. **Install Dependencies:**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend  
   cd frontend && npm install
   ```

2. **Start the Application:**
   ```bash
   # Terminal 1 - Backend (port 5000)
   cd backend && npm run dev
   
   # Terminal 2 - Frontend (port 3000)
   cd frontend && npm start
   ```

3. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

📖 **For detailed setup instructions, see [SETUP.md](./SETUP.md)**

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Recipes
- `GET /api/recipes` - Get all recipes
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes/:id` - Get recipe by ID
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/favorites/:recipeId` - Add/remove favorite recipe

## Contributing

Feel free to contribute to this project by submitting pull requests or reporting issues.
