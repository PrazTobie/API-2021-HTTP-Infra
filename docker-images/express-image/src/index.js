import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.json({ random: Math.random() });
});

app.listen(80);