const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/dataUtils');

// GET all greetings
router.get('/', (req, res) => {
  try {
    const greetings = readData();
    res.json({
      success: true,
      count: greetings.length,
      data: greetings
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve greetings' });
  }
});

// GET all greetings with optional filtering
router.get('/', (req, res) => {
  try {
    let greetings = readData();

    // Filter by language if specified
    if (req.query.language) {
      greetings = greetings.filter(g =>
        g.language.toLowerCase().includes(req.query.language.toLowerCase())
      );
    }

    // Filter by formal if specified
    if (req.query.formal !== undefined) {
      const formal = req.query.formal === 'true';
      greetings = greetings.filter(g => g.formal === formal);
    }

    res.json({
      success: true,
      count: greetings.length,
      data: greetings
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve greetings' });
  }
});

// GET greeting by ID
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const greetings = readData();
    const greeting = greetings.find(g => g.id === id);

    if (!greeting) {
      return res.status(404).json({ error: 'Greeting not found' });
    }

    res.json({
      success: true,
      data: greeting
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve greeting' });
  }
});

// POST new greeting
router.post('/', (req, res) => {
  try {
    const greetings = readData();
    const { language, greeting, formal } = req.body;

    if (!language || !greeting) {
      return res.status(400).json({
        error: 'Language and greeting are required fields'
      });
    }

    const existingGreeting = greetings.find(g =>
      g.language.toLowerCase() === language.toLowerCase()
    );

    if (existingGreeting) {
      return res.status(409).json({
        error: 'Greeting for this language already exists'
      });
    }

    const newId = greetings.length > 0
      ? Math.max(...greetings.map(g => g.id)) + 1
      : 1;

    const newGreeting = {
      id: newId,
      language: language.trim(),
      greeting: greeting.trim(),
      formal: formal !== undefined ? Boolean(formal) : false
    };

    greetings.push(newGreeting);
    writeData(greetings);

    res.status(201).json({
      success: true,
      message: 'Greeting created successfully',
      data: newGreeting
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create greeting' });
  }
});

// PUT (update) greeting
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const greetings = readData();
    const index = greetings.findIndex(g => g.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Greeting not found' });
    }

    const { language, greeting, formal } = req.body;
    if (!language || !greeting) {
      return res.status(400).json({
        error: 'Language and greeting are required fields'
      });
    }

    const existingGreeting = greetings.find(g =>
      g.language.toLowerCase() === language.toLowerCase() && g.id !== id
    );

    if (existingGreeting) {
      return res.status(409).json({
        error: 'Greeting for this language already exists'
      });
    }

    greetings[index] = {
      id,
      language: language.trim(),
      greeting: greeting.trim(),
      formal: formal !== undefined ? Boolean(formal) : greetings[index].formal
    };

    writeData(greetings);
    res.json({
      success: true,
      message: 'Greeting updated successfully',
      data: greetings[index]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update greeting' });
  }
});

// DELETE greeting
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const greetings = readData();
    const index = greetings.findIndex(g => g.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Greeting not found' });
    }

    const deletedGreeting = greetings.splice(index, 1)[0];
    writeData(greetings);

    res.json({
      success: true,
      message: 'Greeting deleted successfully',
      data: deletedGreeting
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete greeting' });
  }
});

module.exports = router;
