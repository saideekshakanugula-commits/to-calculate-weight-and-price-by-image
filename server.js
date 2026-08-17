const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Calculate weight and price
app.post("/calculate", (req, res) => {
    const items = req.body.items;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            error: "Invalid items"
        });
    }

    let total = 0;
    const results = [];

    for (let i = 0; i < items.length; i++) {
        const weight = Number(items[i].weight);
        const price = Number(items[i].price);

        if (isNaN(weight) || isNaN(price)) {
            return res.status(400).json({
                error: `Invalid weight or price at item ${i + 1}`
            });
        }

        const amount = weight * price;
        total += amount;

        results.push({
            item: i + 1,
            weight: weight,
            price: price,
            amount: amount
        });
    }

    res.json({
        results: results,
        total: total
    });
});

// Test route
app.get("/", (req, res) => {
    res.send("Weight and Price Calculation API is running smoothly!");
});

// Export app for Vercel
module.exports = app;