const express = require('express');
const Sequelize = require('sequelize');
const path = require('path');
const cors = require('cors');  // Import cors middleware
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Database setup
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

const FavoritePair = sequelize.define('FavoritePair', {
    baseCurrency: {
        type: Sequelize.STRING,
        allowNull: false
    },
    targetCurrency: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

sequelize.sync();

app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../')));

// API endpoints
app.get('/api/favorites', async (req, res) => {
    const favorites = await FavoritePair.findAll();
    res.json(favorites);
});

app.post('/api/favorites', async (req, res) => {
    const { baseCurrency, targetCurrency } = req.body;
    const favorite = await FavoritePair.create({ baseCurrency, targetCurrency });
    res.json(favorite);
});

app.delete('/api/favorites', async (req, res) => {  // New endpoint to clear favorites
    await FavoritePair.destroy({ where: {}, truncate: true });
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
