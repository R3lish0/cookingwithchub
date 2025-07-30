# Cooking With Chub - Italian Recipe Collection

A beautiful, warm Italian pizzeria-themed web application for managing your recipe collection. Built with vanilla HTML, CSS, and JavaScript, this frontend connects to the recipe API to provide a complete recipe management experience with an authentic Italian feel.

## Features

### 🍕 **Recipe Management**
- View all your recipes in a beautiful card layout with Italian styling
- Filter recipes by search term, author, rating, and cooking time
- Pagination for easy navigation through large recipe collections
- Real-time search and filtering

### ➕ **Add New Recipes**
- Comprehensive form for adding new recipes with Italian flair
- Dynamic ingredient and instruction management
- Nutrition information tracking
- Tags and categorization
- Automatic form reset after successful submission

### ✏️ **Edit & Delete**
- Edit existing recipes through a modal interface
- Delete recipes with confirmation
- Real-time updates after modifications

### 📊 **Statistics Dashboard**
- Overview of your recipe collection
- Total recipes count
- Average ratings, prep times, and cook times
- Top authors by recipe count and average rating
- Rating breakdown analysis

### 🎲 **Random Recipe Feature**
- Get random recipe suggestions
- Filter random recipes by author and minimum rating
- Perfect for discovering new recipes

## Design Features

- **Italian Pizzeria Theme**: Warm reds, creams, and earthy tones
- **Traditional Typography**: Georgia serif font for authentic feel
- **Responsive Design**: Works perfectly on all devices
- **Smooth Animations**: Hover effects and transitions
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Success Notifications**: Toast notifications for successful actions

## Getting Started

### Prerequisites

1. Make sure the recipe API server is running on `http://192.168.68.61:3000`
2. Ensure the API has CORS enabled (already configured in the server)

### Running the Frontend

1. **Simple Method**: Open `index.html` directly in your browser
   - Double-click the `index.html` file
   - Or drag it into your browser window

2. **Local Server Method** (Recommended):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
   
   Then open `http://localhost:8000` in your browser

### API Configuration

The frontend is configured to connect to the recipe API at `http://192.168.68.61:3000/api/recipes`. If your API is running on a different port or URL, update the `API_BASE_URL` constant in `script.js`:

```javascript
const API_BASE_URL = 'http://your-api-url:port/api/recipes';
```

## Usage Guide

### Adding a New Recipe

1. Click the "Add Recipe" tab
2. Fill in the basic information:
   - **Recipe Title**: The name of your recipe
   - **Author**: Who created this recipe
   - **Prep Time**: Preparation time in minutes
   - **Cook Time**: Cooking time in minutes
   - **Servings**: Number of servings
   - **Description**: Brief description of the recipe
   - **Source**: Where the recipe came from
   - **Notes**: Additional tips or variations
   - **Tags**: Comma-separated tags (e.g., "italian, pasta, vegetarian")
   - **Image URL**: Optional image link

3. **Add Ingredients**:
   - Click "+ Add Ingredient" to add more ingredients
   - Fill in name, amount, unit, and optional notes
   - Remove ingredients with the "×" button

4. **Add Instructions**:
   - Click "+ Add Step" to add more instruction steps
   - Each step can have optional timing information
   - Remove steps with the "×" button

5. **Nutrition Information** (optional):
   - Fill in calories, protein, carbs, fat, fiber, and sugar per serving

6. Click "Save Recipe"

### Viewing and Filtering Recipes

1. The "Recipes" tab shows all your recipes
2. Use the filters at the top:
   - **Search**: Search by recipe title or description
   - **Author**: Filter by specific author
   - **Rating**: Filter by minimum rating
   - **Time**: Filter by maximum prep/cook time
3. Use pagination controls to navigate through pages
4. Click "Clear Filters" to reset all filters

### Viewing Recipe Details

1. Click the "View" button on any recipe card
2. A modal will open showing:
   - Complete recipe information
   - Full ingredient list with amounts
   - Step-by-step instructions
   - Nutrition information (if available)
   - Reviews (if any)

### Editing a Recipe

1. Find the recipe you want to edit
2. Click the "Edit" button
3. Modify the values in the modal form
4. Click "Update Recipe" to save changes

### Deleting a Recipe

1. Find the recipe you want to delete
2. Click the "Delete" button
3. Confirm the deletion in the popup dialog

### Getting Random Recipes

1. Click the "Random Recipe" tab
2. Optionally set filters:
   - **Author**: Filter by specific author
   - **Minimum Rating**: Only recipes with this rating or higher
3. Click "Get Random Recipe"
4. View the random recipe and click "View Full Recipe" for details

### Viewing Statistics

1. Click the "Statistics" tab
2. View your overall recipe statistics:
   - Total number of recipes
   - Average rating across all recipes
   - Average prep and cook times
3. See your most active authors and their average ratings
4. View rating distribution across your recipe collection

## File Structure

```
CookingWithChub/
├── index.html          # Main HTML file
├── styles.css          # Italian-themed CSS styles
├── script.js           # JavaScript functionality and API integration
└── README.md           # This file
```

## API Endpoints Used

The frontend uses the following API endpoints:

- `GET /api/recipes` - List all recipes with filtering and pagination
- `POST /api/recipes` - Create a new recipe
- `PUT /api/recipes/:id` - Update an existing recipe
- `DELETE /api/recipes/:id` - Delete a recipe
- `GET /api/recipes/:id` - Get a specific recipe
- `GET /api/recipes/stats/summary` - Get recipe statistics
- `GET /api/recipes/random/recipe` - Get a random recipe

## Recipe Data Structure

Each recipe includes:
- **Basic Info**: Title, author, description, servings
- **Timing**: Prep time and cook time
- **Ingredients**: List with name, amount, unit, and notes
- **Instructions**: Step-by-step instructions with optional timing
- **Nutrition**: Calories, protein, carbs, fat, fiber, sugar per serving
- **Metadata**: Tags, source, notes, image URL
- **Reviews**: User reviews with ratings and comments

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Common Issues

1. **"Failed to load recipes" error**
   - Make sure the API server is running
   - Check that the API URL in `script.js` is correct
   - Verify CORS is enabled on the server

2. **Form validation errors**
   - Ensure all required fields are filled
   - Check that numeric fields contain valid numbers
   - Verify ingredient and instruction data is complete

3. **Modal not opening**
   - Check browser console for JavaScript errors
   - Ensure all required DOM elements exist

### Debug Mode

Open the browser's Developer Tools (F12) and check the Console tab for any error messages or API response details.

## Contributing

Feel free to enhance this frontend by:
- Adding new features
- Improving the Italian theme
- Adding more filtering options
- Implementing recipe sharing functionality
- Adding recipe import/export features
- Creating recipe collections or meal plans

## License

This project is open source and available under the MIT License.

---

*Buon appetito! 🍝🇮🇹* 