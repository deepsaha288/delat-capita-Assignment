const express = require("express");
const app = express();
const path = require("path");
const { MongoClient } = require("mongodb");

const PORT = 5050;
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const MONGO_URL = "mongodb://admin:password@mongo:27017";
const client = new MongoClient(MONGO_URL);

// GET all users
app.get("/getUsers", async (req, res) => {
    await client.connect();
    const db = client.db("apnacollege-db");
    const users = await db.collection("users").find({}).toArray();
    res.send(users);
});

// POST new user
app.post("/addUser", async (req, res) => {
    const user = req.body;
    await client.connect();
    const db = client.db("apnacollege-db");
    const result = await db.collection("users").insertOne(user);
    res.send(result);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});