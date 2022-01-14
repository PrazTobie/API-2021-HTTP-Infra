import express from "express";

const app = express();

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}]`, req.path);
    next();
});

app.get("/", (req, res) => {
    res.json({ random: Math.random() });
});


app.listen(3000, () => {
    console.log("API Ready");
});
