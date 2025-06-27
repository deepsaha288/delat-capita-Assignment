import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [items, setItems] = useState([]);
    const [name, setName] = useState('');
    const [editId, setEditId] = useState(null);

    const fetchItems = async () => {
        const res = await axios.get('/api/items');
        setItems(res.data);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editId) {
        await axios.put(`/api/items/${editId}`, { name });
        setEditId(null);
        } else {
        await axios.post('/api/items', { name });
        }
        setName('');
        fetchItems();
    };

    const handleEdit = (item) => {
        setName(item.name);
        setEditId(item._id);
    };

    const handleDelete = async (id) => {
        await axios.delete(`/api/items/${id}`);
        fetchItems();
    };

    return (
        <div>
        <h1>MERN CRUD</h1>
        <form onSubmit={handleSubmit}>
            <input value={name} onChange={e => setName(e.target.value)} />
            <button type="submit">{editId ? 'Update' : 'Add'}</button>
        </form>
        <ul>
            {items.map(item => (
            <li key={item._id}>
                {item.name}
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item._id)}>Delete</button>
            </li>
            ))}
        </ul>
        </div>
    );
}

export default App;
