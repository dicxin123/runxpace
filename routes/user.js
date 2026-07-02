const express = require('express');
const path = require('path');
const router = express.Router();
const scheduleStore = require('../config/scheduleStore');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user.html'));
});

router.get('/api/schedules', async (req, res) => {
  try {
    const schedules = await scheduleStore.listByUserId(req.session.user.id);
    res.json({ schedules });
  } catch (err) {
    console.error('List schedules error:', err.message);
    res.status(500).json({ error: 'Failed to load schedules.' });
  }
});

router.post('/api/schedules', async (req, res) => {
  try {
    const name = (req.body.name || '').trim() || 'Untitled schedule';
    const schedule = await scheduleStore.create(req.session.user.id, name);
    res.status(201).json({ schedule });
  } catch (err) {
    console.error('Create schedule error:', err.message, err.details || '');
    res.status(500).json({ error: err.message || 'Failed to create schedule.' });
  }
});

router.patch('/api/schedules/:id', async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Schedule name is required.' });

    const existing = await scheduleStore.findById(req.session.user.id, req.params.id);
    if (!existing) return res.status(404).json({ error: 'Schedule not found.' });

    const schedule = await scheduleStore.rename(req.session.user.id, req.params.id, name);
    res.json({ schedule });
  } catch (err) {
    console.error('Rename schedule error:', err.message);
    res.status(500).json({ error: 'Failed to rename schedule.' });
  }
});

module.exports = router;
