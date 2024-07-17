const express = require('express');  // Import the express module
const Sequelize = require('sequelize');  // Import Sequelize ORM
const path = require('path');  // Import path module to handle file paths
const cors = require('cors');  // Import cors middleware
const app = express();  // Create an instance of express
const PORT = process.env.PORT || 3000;  // Define the port to use, default to 3000

// Enable CORS
app.use(cors());  // Use the CORS middleware to enable cross-origin resource sharing

// Database setup
const sequelize = new Sequelize({
    dialect: 'sqlite',  // Use SQLite as the database dialect
    storage: './database.sqlite'  // Define the storage file for SQLite
});

// Define the FavoritePair model
const FavoritePair = sequelize.define('FavoritePair', {
    baseCurrency: {
        type: Sequelize.STRING,  // Define baseCurrency as a string
        allowNull: false  // Make baseCurrency a required field
    },
    targetCurrency: {
        type: Sequelize.STRING,  // Define targetCurrency as a string
        allowNull: false  // Make targetCurrency a required field
    }
});

// Sync the model with the database
sequelize.sync();  // Create the table if it doesn't exist

app.use(express.json());  // Use middleware to parse JSON bodies

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../')));  // Serve files from the parent directory

// API endpoints
app.get('/api/favorites', async (req, res) => {
    const favorites = await FavoritePair.findAll();  // Fetch all favorite pairs from the database
    res.json(favorites);  // Send the favorite pairs as JSON
});

app.post('/api/favorites', async (req, res) => {
    const { baseCurrency, targetCurrency } = req.body;  // Extract baseCurrency and targetCurrency from the request body
    const favorite = await FavoritePair.create({ baseCurrency, targetCurrency });  // Create a new favorite pair in the database
    res.json(favorite);  // Send the newly created favorite pair as JSON
});

app.delete('/api/favorites', async (req, res) => {  // Endpoint to clear all favorite pairs
    await FavoritePair.destroy({ where: {}, truncate: true });  // Delete all records from the FavoritePair table
    res.status(204).send();  // Send a 204 No Content response
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);  // Log that the server is running
});
