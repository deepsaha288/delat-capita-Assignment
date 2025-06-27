const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
// Connect to MongoDB
mongoose.connect('mongodb://root:admin@mongo:27017/mern-crud?authSource=admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

    const Item = mongoose.model('Item', { name: String });

    app.get('/items', async (req, res) => {
    const items = await Item.find();
    res.json(items);
    });

    app.post('/items', async (req, res) => {
    const newItem = new Item({ name: req.body.name });
    await newItem.save();
    res.json(newItem);
    });

    app.put('/items/:id', async (req, res) => {
    const item = await Item.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    res.json(item);
    });

    app.delete('/items/:id', async (req, res) => {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

app.listen(5000, () => console.log('Backend running on port 5000'));
