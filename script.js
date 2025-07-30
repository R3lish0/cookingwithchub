// Polyfill for crypto.randomUUID for older browsers
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
    crypto.randomUUID = function() {
        // Fallback UUID generation that works in all browsers
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
} else if (typeof crypto === 'undefined') {
    // If crypto is not available at all, create a global crypto object
    window.crypto = {
        randomUUID: function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    };
}

// API Configuration
const API_BASE_URL = 'http://192.168.68.61:3000/api/recipes';

// State management
let currentPage = 1;
let currentFilters = {};
let editingRecipeId = null;

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const recipesList = document.getElementById('recipesList');
const recipeForm = document.getElementById('recipeForm');
const editForm = document.getElementById('editForm');
const editModal = document.getElementById('editModal');
const recipeModal = document.getElementById('recipeModal');
const closeModal = document.querySelectorAll('.close');

// Filter elements
const searchFilter = document.getElementById('searchFilter');
const authorFilter = document.getElementById('authorFilter');
const ratingFilter = document.getElementById('ratingFilter');
const timeFilter = document.getElementById('timeFilter');
const clearFiltersBtn = document.getElementById('clearFilters');

// Pagination elements
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

// Statistics elements
const totalRecipesEl = document.getElementById('totalRecipes');
const topAuthorsEl = document.getElementById('topAuthors');

// Random recipe elements
const randomAuthor = document.getElementById('randomAuthor');
const randomMinRating = document.getElementById('randomMinRating');
const getRandomRecipeBtn = document.getElementById('getRandomRecipe');
const randomRecipeDisplay = document.getElementById('randomRecipeDisplay');

// Form elements
const addIngredientBtn = document.getElementById('addIngredient');
const addInstructionBtn = document.getElementById('addInstruction');
const ingredientsList = document.getElementById('ingredientsList');
const instructionsList = document.getElementById('instructionsList');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeFilters();
    initializePagination();
    initializeModals();
    initializeFormHandlers();
    loadRecipes();
    loadStats();
});

// Tab functionality
function initializeTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    // Update active tab button
    tabButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update active tab content
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    
    // Load data for the active tab
    if (tabName === 'recipes') {
        loadRecipes();
    } else if (tabName === 'stats') {
        loadStats();
    }
}

// Filter functionality
function initializeFilters() {
    searchFilter.addEventListener('input', debounce(applyFilters, 300));
    authorFilter.addEventListener('input', debounce(applyFilters, 300));
    ratingFilter.addEventListener('change', applyFilters);
    timeFilter.addEventListener('change', applyFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);
}

function applyFilters() {
    currentFilters = {};
    
    if (searchFilter.value) currentFilters.search = searchFilter.value;
    if (authorFilter.value) currentFilters.author = authorFilter.value;
    if (ratingFilter.value) currentFilters.minRating = ratingFilter.value;
    if (timeFilter.value) {
        currentFilters.maxPrepTime = timeFilter.value;
        currentFilters.maxCookTime = timeFilter.value;
    }
    
    currentPage = 1;
    loadRecipes();
}

function clearFilters() {
    searchFilter.value = '';
    authorFilter.value = '';
    ratingFilter.value = '';
    timeFilter.value = '';
    currentFilters = {};
    currentPage = 1;
    loadRecipes();
}

// Pagination functionality
function initializePagination() {
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadRecipes();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        currentPage++;
        loadRecipes();
    });
}

// Modal functionality
function initializeModals() {
    closeModal.forEach(close => {
        close.addEventListener('click', () => {
            editModal.style.display = 'none';
            recipeModal.style.display = 'none';
            editingRecipeId = null;
        });
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            editModal.style.display = 'none';
            editingRecipeId = null;
        }
        if (event.target === recipeModal) {
            recipeModal.style.display = 'none';
        }
    });
}

// Form handlers
function initializeFormHandlers() {
    addIngredientBtn.addEventListener('click', addIngredientRow);
    addInstructionBtn.addEventListener('click', addInstructionRow);
    
    // Handle ingredient removal
    ingredientsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-ingredient-btn')) {
            e.target.closest('.ingredient-row').remove();
            updateIngredientNumbers();
        }
    });
    
    // Handle instruction removal
    instructionsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-instruction-btn')) {
            e.target.closest('.instruction-row').remove();
            updateInstructionNumbers();
        }
    });
}

function addIngredientRow() {
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.innerHTML = `
        <input type="text" placeholder="Ingredient name" class="ingredient-name" required>
        <input type="text" placeholder="Amount (e.g., 1/2, 2, 1.5)" class="ingredient-amount">
        <input type="text" placeholder="Unit" class="ingredient-unit" required>
        <input type="text" placeholder="Notes (optional)" class="ingredient-notes">
        <button type="button" class="remove-ingredient-btn">×</button>
    `;
    ingredientsList.appendChild(row);
}

function addInstructionRow() {
    const rows = instructionsList.querySelectorAll('.instruction-row');
    const stepNumber = rows.length + 1;
    
    const row = document.createElement('div');
    row.className = 'instruction-row';
    row.innerHTML = `
        <span class="step-number">${stepNumber}</span>
        <textarea placeholder="Instruction step..." class="instruction-text" required></textarea>
        <input type="number" placeholder="Time (min)" class="instruction-time" min="0">
        <button type="button" class="remove-instruction-btn">×</button>
    `;
    instructionsList.appendChild(row);
}

function updateIngredientNumbers() {
    const rows = ingredientsList.querySelectorAll('.ingredient-row');
    rows.forEach((row, index) => {
        // Update any numbered elements if needed
    });
}

function updateInstructionNumbers() {
    const rows = instructionsList.querySelectorAll('.instruction-row');
    rows.forEach((row, index) => {
        const stepNumber = row.querySelector('.step-number');
        if (stepNumber) {
            stepNumber.textContent = index + 1;
        }
    });
}

// API Functions
async function loadRecipes() {
    try {
        showLoading(recipesList);
        
        const params = new URLSearchParams({
            page: currentPage,
            limit: 12,
            ...currentFilters
        });
        
        const response = await fetch(`${API_BASE_URL}?${params}`);
        const data = await response.json();
        
        if (response.ok) {
            displayRecipes(data.recipes, data.pagination);
        } else {
            showError(recipesList, 'Failed to load recipes');
        }
    } catch (error) {
        console.error('Error loading recipes:', error);
        showError(recipesList, 'Failed to load recipes');
    }
}

async function loadStats() {
    try {
        console.log('Loading stats...');
        const response = await fetch(`${API_BASE_URL}/stats/summary`);
        const data = await response.json();
        
        console.log('Stats response:', data);
        
        if (response.ok) {
            displayStats(data);
        } else {
            console.error('Failed to load stats');
            // Show error state in the UI
            topAuthorsEl.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error loading stats</h3>
                    <p>Failed to load statistics data</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        // Show error state in the UI
        topAuthorsEl.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading stats</h3>
                <p>Failed to load statistics data</p>
            </div>
        `;
    }
}

async function createRecipe(formData) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showSuccess('Recipe created successfully!');
            recipeForm.reset();
            resetForm();
            switchTab('recipes');
        } else {
            const errorData = await response.json();
            showError(null, `Failed to create recipe: ${errorData.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error creating recipe:', error);
        showError(null, 'Failed to create recipe');
    }
}

async function updateRecipe(id, formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showSuccess('Recipe updated successfully!');
            editModal.style.display = 'none';
            editingRecipeId = null;
            loadRecipes();
        } else {
            const errorData = await response.json();
            showError(null, `Failed to update recipe: ${errorData.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error updating recipe:', error);
        showError(null, 'Failed to update recipe');
    }
}

async function deleteRecipe(id) {
    if (!confirm('Are you sure you want to delete this recipe?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Recipe deleted successfully!');
            loadRecipes();
        } else {
            showError(null, 'Failed to delete recipe');
        }
    } catch (error) {
        console.error('Error deleting recipe:', error);
        showError(null, 'Failed to delete recipe');
    }
}

async function getRandomRecipe() {
    try {
        const params = new URLSearchParams();
        if (randomAuthor.value) params.append('author', randomAuthor.value);
        if (randomMinRating.value) params.append('minRating', randomMinRating.value);
        
        const response = await fetch(`${API_BASE_URL}/random/recipe?${params}`);
        const recipe = await response.json();
        
        if (response.ok) {
            displayRandomRecipe(recipe);
        } else {
            showError(randomRecipeDisplay, 'No recipe found with specified criteria');
        }
    } catch (error) {
        console.error('Error getting random recipe:', error);
        showError(randomRecipeDisplay, 'Failed to get random recipe');
    }
}

// Display Functions
function displayRecipes(recipes, pagination) {
    if (recipes.length === 0) {
        recipesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <h3>No recipes found</h3>
                <p>Start by adding your first recipe!</p>
            </div>
        `;
        return;
    }
    
    recipesList.innerHTML = recipes.map(recipe => `
        <div class="recipe-card">
            <div class="recipe-header">
                <div>
                    <div class="recipe-title">${recipe.title}</div>
                    <div class="recipe-rating">
                        <i class="fas fa-star"></i>
                        ${recipe.rating ? recipe.rating.toFixed(1) : 'No rating'}/5
                    </div>
                </div>
            </div>
            
            <div class="recipe-meta">
                <span>Author: <strong>${recipe.author || 'Unknown'}</strong></span>
                <span>Servings: <strong>${recipe.servings}</strong></span>
                ${recipe.prepTime ? `<span>Prep: <strong>${recipe.prepTime}min</strong></span>` : ''}
                ${recipe.cookTime ? `<span>Cook: <strong>${recipe.cookTime}min</strong></span>` : ''}
                <span>Ingredients: <strong>${recipe.ingredients.length}</strong></span>
                <span>Steps: <strong>${recipe.instructions.length}</strong></span>
            </div>
            
            ${recipe.description ? `<div style="margin-bottom: 15px; font-size: 0.9rem; color: #8b7355; font-style: italic;">
                "${recipe.description}"
            </div>` : ''}
            
            <div class="recipe-actions">
                <button class="view-btn" onclick="viewRecipe('${recipe._id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="edit-btn" onclick="openEditModal(${JSON.stringify(recipe).replace(/"/g, '&quot;')})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" onclick="deleteRecipe('${recipe._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
    
    updatePagination(pagination);
}

function displayStats(data) {
    console.log('Displaying stats with data:', data);
    const summary = data.summary;
    
    console.log('Summary:', summary);
    console.log('Total recipes:', summary.totalRecipes);
    
    // Update total recipes
    totalRecipesEl.textContent = summary.totalRecipes || 0;
    
    // If no recipes exist, show empty state for source breakdown
    if (!summary.totalRecipes || summary.totalRecipes === 0) {
        console.log('No recipes found, showing empty state');
        topAuthorsEl.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <h3>No recipes found</h3>
                <p>Add some recipes to see source breakdown</p>
            </div>
        `;
        return;
    }
    
    console.log('Recipes exist, fetching source breakdown');
    // Get source breakdown by fetching all recipes and grouping by source
    fetchSourceBreakdown();
}

async function fetchSourceBreakdown() {
    try {
        // Show loading state
        topAuthorsEl.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner"></i>
                <p>Loading source breakdown...</p>
            </div>
        `;
        
        const response = await fetch(`${API_BASE_URL}`); // Get all recipes
        const data = await response.json();
        
        if (response.ok) {
            displaySourceBreakdown(data.recipes);
        } else {
            console.error('Failed to load recipes for source breakdown');
            topAuthorsEl.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error loading data</h3>
                    <p>Failed to load recipe data</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading source breakdown:', error);
        topAuthorsEl.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading data</h3>
                <p>Failed to load recipe data</p>
            </div>
        `;
    }
}

function displaySourceBreakdown(recipes) {
    // Check if there are any recipes at all
    if (!recipes || recipes.length === 0) {
        topAuthorsEl.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <h3>No recipes found</h3>
                <p>Add some recipes to see source breakdown</p>
            </div>
        `;
        return;
    }
    
    // Group recipes by source
    const sourceGroups = {};
    
    recipes.forEach(recipe => {
        const source = recipe.source || 'No Source';
        if (!sourceGroups[source]) {
            sourceGroups[source] = 0;
        }
        sourceGroups[source]++;
    });
    
    // Convert to array and sort by count
    const sourceBreakdown = Object.entries(sourceGroups)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);
    
    // Update the top authors section to show source breakdown
    topAuthorsEl.innerHTML = sourceBreakdown.length > 0 ? 
        sourceBreakdown.map(item => `
            <div class="stat-item">
                <span class="stat-item-name">${item.source}</span>
                <span class="stat-item-value">${item.count} recipes</span>
            </div>
        `).join('') : 
        `<div class="empty-state">
            <i class="fas fa-book-open"></i>
            <h3>No sources found</h3>
            <p>Add source information to your recipes to see breakdown</p>
        </div>`;
    
    // Update the section title
    const topAuthorsSection = document.querySelector('.stats-section h3');
    if (topAuthorsSection) {
        topAuthorsSection.textContent = 'Recipes by Source';
    }
    
    // Hide the rating breakdown section since we don't need it
    const ratingBreakdownSection = document.querySelector('.stats-section:last-child');
    if (ratingBreakdownSection) {
        ratingBreakdownSection.style.display = 'none';
    }
}

function displayRandomRecipe(recipe) {
    randomRecipeDisplay.innerHTML = `
        <div class="recipe-card">
            <div class="recipe-header">
                <div>
                    <div class="recipe-title">${recipe.title}</div>
                    <div class="recipe-rating">
                        <i class="fas fa-star"></i>
                        ${recipe.rating ? recipe.rating.toFixed(1) : 'No rating'}/5
                    </div>
                </div>
            </div>
            
            <div class="recipe-meta">
                <span>Author: <strong>${recipe.author || 'Unknown'}</strong></span>
                <span>Servings: <strong>${recipe.servings}</strong></span>
                ${recipe.prepTime ? `<span>Prep: <strong>${recipe.prepTime}min</strong></span>` : ''}
                ${recipe.cookTime ? `<span>Cook: <strong>${recipe.cookTime}min</strong></span>` : ''}
            </div>
            
            ${recipe.description ? `<div style="margin-bottom: 15px; font-size: 0.9rem; color: #8b7355; font-style: italic;">
                "${recipe.description}"
            </div>` : ''}
            
            <div class="recipe-actions">
                <button class="view-btn" onclick="viewRecipe('${recipe._id}')">
                    <i class="fas fa-eye"></i> View Full Recipe
                </button>
            </div>
        </div>
    `;
}

function updatePagination(pagination) {
    pageInfo.textContent = `Page ${pagination.page} of ${pagination.pages}`;
    prevPageBtn.disabled = pagination.page <= 1;
    nextPageBtn.disabled = pagination.page >= pagination.pages;
}

// Recipe viewing and editing
function viewRecipe(id) {
    fetch(`${API_BASE_URL}/${id}`)
        .then(response => response.json())
        .then(recipe => {
            displayRecipeDetail(recipe);
            recipeModal.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching recipe:', error);
            showError(null, 'Failed to load recipe details');
        });
}

function displayRecipeDetail(recipe) {
    const content = document.getElementById('recipeDetailContent');
    content.innerHTML = `
        <div class="recipe-detail">
            <h2>${recipe.title}</h2>
            
            <div class="recipe-meta">
                <p><strong>Author:</strong> ${recipe.author || 'Unknown'}</p>
                <p><strong>Servings:</strong> ${recipe.servings}</p>
                ${recipe.prepTime ? `<p><strong>Prep Time:</strong> ${recipe.prepTime} minutes</p>` : ''}
                ${recipe.cookTime ? `<p><strong>Cook Time:</strong> ${recipe.cookTime} minutes</p>` : ''}
                ${recipe.rating ? `<p><strong>Rating:</strong> ${recipe.rating.toFixed(1)}/5</p>` : ''}
                ${recipe.source ? `<p><strong>Source:</strong> ${recipe.source}</p>` : ''}
            </div>
            
            ${recipe.description ? `<p><strong>Description:</strong> ${recipe.description}</p>` : ''}
            
            <div class="ingredients-list">
                <h3>Ingredients</h3>
                <ul>
                    ${recipe.ingredients.map(ingredient => 
                        `<li><strong>${ingredient.amount} ${ingredient.unit}</strong> ${ingredient.name}${ingredient.notes ? ` - ${ingredient.notes}` : ''}</li>`
                    ).join('')}
                </ul>
            </div>
            
            <div class="instructions-list">
                <h3>Instructions</h3>
                ${recipe.instructions.map(instruction => 
                    `<div class="instruction-step">
                        <span class="step-number">${instruction.step}</span>
                        <div>${instruction.instruction}${instruction.time ? ` (${instruction.time} min)` : ''}</div>
                    </div>`
                ).join('')}
            </div>
            
            ${recipe.nutrition ? `
                <div class="nutrition-info">
                    <h3>Nutrition (per serving)</h3>
                    <p><strong>Calories:</strong> ${recipe.nutrition.calories || 'N/A'}</p>
                    <p><strong>Protein:</strong> ${recipe.nutrition.protein || 'N/A'}g</p>
                    <p><strong>Carbs:</strong> ${recipe.nutrition.carbs || 'N/A'}g</p>
                    <p><strong>Fat:</strong> ${recipe.nutrition.fat || 'N/A'}g</p>
                    <p><strong>Fiber:</strong> ${recipe.nutrition.fiber || 'N/A'}g</p>
                    <p><strong>Sugar:</strong> ${recipe.nutrition.sugar || 'N/A'}g</p>
                </div>
            ` : ''}
            
            ${recipe.notes ? `<p><strong>Notes:</strong> ${recipe.notes}</p>` : ''}
            
            ${recipe.reviews && recipe.reviews.length > 0 ? `
                <div class="reviews-section">
                    <h3>Reviews</h3>
                    ${recipe.reviews.map(review => 
                        `<div class="review-item">
                            <p><strong>${review.user}</strong> - ${review.rating}/5 stars</p>
                            ${review.comment ? `<p>${review.comment}</p>` : ''}
                            <small>${new Date(review.date).toLocaleDateString()}</small>
                        </div>`
                    ).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

function openEditModal(recipe) {
    editingRecipeId = recipe._id;
    populateEditForm(recipe);
    editModal.style.display = 'block';
}

function populateEditForm(recipe) {
    editForm.innerHTML = `
        <div class="form-grid">
            <div class="form-group">
                <label for="editTitle">Recipe Title *</label>
                <input type="text" id="editTitle" name="title" value="${recipe.title}" required>
            </div>
            
            <div class="form-group">
                <label for="editAuthor">Author</label>
                <input type="text" id="editAuthor" name="author" value="${recipe.author || ''}">
            </div>
            
            <div class="form-group">
                <label for="editPrepTime">Prep Time (minutes)</label>
                <input type="number" id="editPrepTime" name="prepTime" value="${recipe.prepTime || ''}" min="0">
            </div>
            
            <div class="form-group">
                <label for="editCookTime">Cook Time (minutes)</label>
                <input type="number" id="editCookTime" name="cookTime" value="${recipe.cookTime || ''}" min="0">
            </div>
            
            <div class="form-group">
                <label for="editServings">Servings *</label>
                <input type="number" id="editServings" name="servings" value="${recipe.servings}" min="1" required>
            </div>
            
            <div class="form-group">
                <label for="editImageUrl">Image URL</label>
                <input type="url" id="editImageUrl" name="imageUrl" value="${recipe.imageUrl || ''}" placeholder="https://...">
            </div>
        </div>
        
        <div class="form-group full-width">
            <label for="editDescription">Description</label>
            <textarea id="editDescription" name="description" rows="3" placeholder="Describe your recipe...">${recipe.description || ''}</textarea>
        </div>
        
        <div class="form-group full-width">
            <label for="editSource">Source</label>
            <input type="text" id="editSource" name="source" value="${recipe.source || ''}" placeholder="Where did this recipe come from?">
        </div>
        
        <div class="form-group full-width">
            <label for="editNotes">Notes</label>
            <textarea id="editNotes" name="notes" rows="3" placeholder="Additional notes, tips, or variations...">${recipe.notes || ''}</textarea>
        </div>
        
        <div class="form-group full-width">
            <label for="editTags">Tags (comma separated)</label>
            <input type="text" id="editTags" name="tags" value="${recipe.tags ? recipe.tags.join(', ') : ''}" placeholder="italian, pasta, vegetarian, quick">
        </div>
        
        <div class="ingredients-section">
            <h3>Ingredients</h3>
            <div id="editIngredientsList">
                ${recipe.ingredients.map((ingredient, index) => `
                    <div class="ingredient-row">
                        <input type="text" placeholder="Ingredient name" class="ingredient-name" value="${ingredient.name}" required>
                        <input type="text" placeholder="Amount (e.g., 1/2, 2, 1.5)" class="ingredient-amount" value="${ingredient.amount}" required>
                        <input type="text" placeholder="Unit" class="ingredient-unit" value="${ingredient.unit}">
                        <input type="text" placeholder="Notes (optional)" class="ingredient-notes" value="${ingredient.notes || ''}">
                        <button type="button" class="remove-ingredient-btn">×</button>
                    </div>
                `).join('')}
            </div>
            <button type="button" class="btn-secondary add-ingredient-btn">+ Add Ingredient</button>
        </div>
        
        <div class="instructions-section">
            <h3>Instructions</h3>
            <div id="editInstructionsList">
                ${recipe.instructions.map((instruction, index) => `
                    <div class="instruction-row">
                        <span class="step-number">${index + 1}</span>
                        <textarea placeholder="Instruction step..." class="instruction-text" required>${instruction.instruction}</textarea>
                        <input type="number" placeholder="Time (min)" class="instruction-time" value="${instruction.time || ''}" min="0">
                        <button type="button" class="remove-instruction-btn">×</button>
                    </div>
                `).join('')}
            </div>
            <button type="button" class="btn-secondary add-instruction-btn">+ Add Step</button>
        </div>
        
        <div class="nutrition-section">
            <h3>Nutrition (per serving)</h3>
            <div class="nutrition-grid">
                <div class="form-group">
                    <label for="editCalories">Calories</label>
                    <input type="number" id="editCalories" name="calories" value="${recipe.nutrition?.calories || ''}" min="0">
                </div>
                <div class="form-group">
                    <label for="editProtein">Protein (g)</label>
                    <input type="number" id="editProtein" name="protein" value="${recipe.nutrition?.protein || ''}" min="0">
                </div>
                <div class="form-group">
                    <label for="editCarbs">Carbs (g)</label>
                    <input type="number" id="editCarbs" name="carbs" value="${recipe.nutrition?.carbs || ''}" min="0">
                </div>
                <div class="form-group">
                    <label for="editFat">Fat (g)</label>
                    <input type="number" id="editFat" name="fat" value="${recipe.nutrition?.fat || ''}" min="0">
                </div>
                <div class="form-group">
                    <label for="editFiber">Fiber (g)</label>
                    <input type="number" id="editFiber" name="fiber" value="${recipe.nutrition?.fiber || ''}" min="0">
                </div>
                <div class="form-group">
                    <label for="editSugar">Sugar (g)</label>
                    <input type="number" id="editSugar" name="sugar" value="${recipe.nutrition?.sugar || ''}" min="0">
                </div>
            </div>
        </div>
        
        <div class="form-actions">
            <button type="submit" class="btn-primary">Update Recipe</button>
            <button type="button" class="btn-secondary" onclick="editModal.style.display='none'">Cancel</button>
        </div>
    `;
    
    // Add event listeners for the edit form
    editForm.addEventListener('submit', handleEditSubmit);
    
    // Add event listeners for ingredient/instruction buttons
    const addIngredientBtn = editForm.querySelector('.add-ingredient-btn');
    const addInstructionBtn = editForm.querySelector('.add-instruction-btn');
    
    if (addIngredientBtn) {
        addIngredientBtn.addEventListener('click', () => {
            const ingredientsList = editForm.querySelector('#editIngredientsList');
            const row = document.createElement('div');
            row.className = 'ingredient-row';
            row.innerHTML = `
                <input type="text" placeholder="Ingredient name" class="ingredient-name" required>
                <input type="text" placeholder="Amount (e.g., 1/2, 2, 1.5)" class="ingredient-amount" required>
                <input type="text" placeholder="Unit" class="ingredient-unit">
                <input type="text" placeholder="Notes (optional)" class="ingredient-notes">
                <button type="button" class="remove-ingredient-btn">×</button>
            `;
            ingredientsList.appendChild(row);
        });
    }
    
    if (addInstructionBtn) {
        addInstructionBtn.addEventListener('click', () => {
            const instructionsList = editForm.querySelector('#editInstructionsList');
            const rows = instructionsList.querySelectorAll('.instruction-row');
            const stepNumber = rows.length + 1;
            
            const row = document.createElement('div');
            row.className = 'instruction-row';
            row.innerHTML = `
                <span class="step-number">${stepNumber}</span>
                <textarea placeholder="Instruction step..." class="instruction-text" required></textarea>
                <input type="number" placeholder="Time (min)" class="instruction-time" min="0">
                <button type="button" class="remove-instruction-btn">×</button>
            `;
            instructionsList.appendChild(row);
        });
    }
}

// AI Tag Generation
let currentRecipeData = null;
let selectedTags = [];

// Form Handlers
recipeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = collectFormData(recipeForm);
    currentRecipeData = formData;
    
    // Show AI tag generation modal
    showAITagModal();
    
    // Generate AI tags
    await generateAITags(formData);
});

async function generateAITags(recipeData) {
    try {
        // Prepare recipe data for AI
        const aiPrompt = `
Recipe Title: ${recipeData.title}
Description: ${recipeData.description || 'No description'}
Author: ${recipeData.author || 'Unknown'}
Servings: ${recipeData.servings}
Prep Time: ${recipeData.prepTime || 0} minutes
Cook Time: ${recipeData.cookTime || 0} minutes
Source: ${recipeData.source || 'Unknown'}

Ingredients:
${recipeData.ingredients.map(ing => `- ${ing.amount} ${ing.unit} ${ing.name}${ing.notes ? ` (${ing.notes})` : ''}`).join('\n')}

Instructions:
${recipeData.instructions.map((inst, i) => `${i + 1}. ${inst.instruction}${inst.time ? ` (${inst.time} min)` : ''}`).join('\n')}

Notes: ${recipeData.notes || 'None'}

Based on this recipe, generate relevant tags that would help categorize and find this recipe. Tags should be single words or short phrases, separated by commas. Focus on cuisine type, cooking method, dietary restrictions, difficulty level, and key ingredients (main protein). A good example for
a italian sheet pan dish would be (quick and easy, chicken, dinner, italian) Return only the tags, no explanation.
        `;
        
        const response = await fetch(`${API_BASE_URL}/ai/generate-tags`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: aiPrompt
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            const suggestedTags = data.response.split(',').map(tag => tag.trim()).filter(tag => tag);
            showAITagResults(suggestedTags);
        } else {
            console.error('Failed to generate AI tags');
            showAITagResults(['italian', 'homemade', 'traditional']);
        }
    } catch (error) {
        console.error('Error generating AI tags:', error);
        showAITagResults(['italian', 'homemade', 'traditional']);
    }
}

function showAITagModal() {
    const modal = document.getElementById('aiTagModal');
    const loadingState = document.getElementById('aiLoadingState');
    const resultsState = document.getElementById('aiTagResults');
    
    modal.style.display = 'block';
    loadingState.style.display = 'block';
    resultsState.style.display = 'none';
    
    // Add event listener for close button
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        modal.style.display = 'none';
        currentRecipeData = null;
        selectedTags = [];
    };
}

function showAITagResults(suggestedTags) {
    const loadingState = document.getElementById('aiLoadingState');
    const resultsState = document.getElementById('aiTagResults');
    const suggestedTagsContainer = document.getElementById('suggestedTags');
    
    // Hide loading, show results
    loadingState.style.display = 'none';
    resultsState.style.display = 'block';
    
    // Display suggested tags
    suggestedTagsContainer.innerHTML = suggestedTags.map(tag => `
        <span class="tag-item" data-tag="${tag}">${tag}</span>
    `).join('');
    
    // Add click handlers for tag selection
    suggestedTagsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag-item')) {
            e.target.classList.toggle('selected');
            updateFinalTags();
        }
    });
    
    // Add custom tags input handler
    const customTagsInput = document.getElementById('customTags');
    customTagsInput.addEventListener('input', updateFinalTags);
    
    // Add confirm and cancel handlers
    document.getElementById('confirmTags').onclick = () => confirmAndSaveRecipe();
    document.getElementById('cancelTags').onclick = () => {
        document.getElementById('aiTagModal').style.display = 'none';
        currentRecipeData = null;
        selectedTags = [];
    };
}

function updateFinalTags() {
    const selectedSuggestedTags = Array.from(document.querySelectorAll('.tag-item.selected'))
        .map(el => el.dataset.tag);
    
    const customTags = document.getElementById('customTags').value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
    
    selectedTags = [...selectedSuggestedTags, ...customTags];
    
    const finalTagsContainer = document.getElementById('finalTags');
    finalTagsContainer.innerHTML = selectedTags.map(tag => `
        <span class="final-tag">
            ${tag}
            <button class="remove-tag" onclick="removeTag('${tag}')">×</button>
        </span>
    `).join('');
}

function removeTag(tagToRemove) {
    selectedTags = selectedTags.filter(tag => tag !== tagToRemove);
    
    // Update selected suggested tags
    document.querySelectorAll('.tag-item.selected').forEach(el => {
        if (el.dataset.tag === tagToRemove) {
            el.classList.remove('selected');
        }
    });
    
    // Update custom tags input
    const customTags = selectedTags.filter(tag => 
        !Array.from(document.querySelectorAll('.tag-item')).some(el => el.dataset.tag === tag)
    );
    document.getElementById('customTags').value = customTags.join(', ');
    
    updateFinalTags();
}

async function confirmAndSaveRecipe() {
    if (!currentRecipeData) return;
    
    // Add tags to recipe data
    currentRecipeData.tags = selectedTags;
    
    // Save the recipe
    await createRecipe(currentRecipeData);
    
    // Close modal and reset
    document.getElementById('aiTagModal').style.display = 'none';
    currentRecipeData = null;
    selectedTags = [];
}

async function handleEditSubmit(e) {
    e.preventDefault();
    
    const formData = collectFormData(editForm);
    await updateRecipe(editingRecipeId, formData);
}

function collectFormData(form) {
    const formData = new FormData(form);
    const recipeData = {};
    
    // Basic fields
    for (let [key, value] of formData.entries()) {
        if (value !== '') {
            if (['prepTime', 'cookTime', 'servings'].includes(key)) {
                recipeData[key] = parseInt(value);
            } else if (['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar'].includes(key)) {
                recipeData[key] = parseFloat(value);
            } else {
                recipeData[key] = value;
            }
        }
    }
    
    // Collect ingredients
    const ingredients = [];
    const ingredientRows = form.querySelectorAll('.ingredient-row');
    ingredientRows.forEach(row => {
        const name = row.querySelector('.ingredient-name').value;
        const amount = row.querySelector('.ingredient-amount').value;
        const unit = row.querySelector('.ingredient-unit').value;
        const notes = row.querySelector('.ingredient-notes').value;
        
        if (name && amount) {
            ingredients.push({
                name,
                amount,
                unit: unit || undefined,
                notes: notes || undefined
            });
        }
    });
    recipeData.ingredients = ingredients;
    
    // Collect instructions
    const instructions = [];
    const instructionRows = form.querySelectorAll('.instruction-row');
    instructionRows.forEach((row, index) => {
        const instruction = row.querySelector('.instruction-text').value;
        const time = parseInt(row.querySelector('.instruction-time').value);
        
        if (instruction) {
            instructions.push({
                step: index + 1,
                instruction,
                time: time || undefined
            });
        }
    });
    recipeData.instructions = instructions;
    
    // Handle nutrition data
    if (recipeData.calories || recipeData.protein || recipeData.carbs || recipeData.fat || recipeData.fiber || recipeData.sugar) {
        recipeData.nutrition = {
            calories: recipeData.calories,
            protein: recipeData.protein,
            carbs: recipeData.carbs,
            fat: recipeData.fat,
            fiber: recipeData.fiber,
            sugar: recipeData.sugar
        };
        delete recipeData.calories;
        delete recipeData.protein;
        delete recipeData.carbs;
        delete recipeData.fat;
        delete recipeData.fiber;
        delete recipeData.sugar;
    }
    
    // Handle tags
    if (recipeData.tags) {
        recipeData.tags = recipeData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    return recipeData;
}

function resetForm() {
    // Clear ingredients and instructions
    ingredientsList.innerHTML = `
        <div class="ingredient-row">
            <input type="text" placeholder="Ingredient name" class="ingredient-name" required>
            <input type="text" placeholder="Amount (e.g., 1/2, 2, 1.5)" class="ingredient-amount" required>
            <input type="text" placeholder="Unit" class="ingredient-unit">
            <input type="text" placeholder="Notes (optional)" class="ingredient-notes">
            <button type="button" class="remove-ingredient-btn">×</button>
        </div>
    `;
    
    instructionsList.innerHTML = `
        <div class="instruction-row">
            <span class="step-number">1</span>
            <textarea placeholder="Instruction step..." class="instruction-text" required></textarea>
            <input type="number" placeholder="Time (min)" class="instruction-time" min="0">
            <button type="button" class="remove-instruction-btn">×</button>
        </div>
    `;
}

// Random recipe handler
getRandomRecipeBtn.addEventListener('click', getRandomRecipe);

// Utility Functions
function showLoading(container) {
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner"></i>
                <p>Loading...</p>
            </div>
        `;
    }
}

function showError(container, message) {
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    } else {
        alert(message);
    }
}

function showSuccess(message) {
    // Create a temporary success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #228b22;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        font-weight: 500;
        font-family: 'Georgia', serif;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions globally available for onclick handlers
window.openEditModal = openEditModal;
window.deleteRecipe = deleteRecipe;
window.viewRecipe = viewRecipe; 