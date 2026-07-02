const express = require('express');
const path = require('path');
const router = express.Router();
const scheduleStore = require('../config/scheduleStore');

router.get('/api/me', (req, res) => {
  const { name } = req.session.user;
  res.json({ name });
});

router.get('/:id', async (req, res) => {
  try {
    const schedule = await scheduleStore.findById(req.session.user.id, req.params.id);
    if (!schedule) {
      return res.redirect('/user');
    }
    res.sendFile(path.join(__dirname, '../views/schedule.html'));
  } catch (err) {
    console.error('Schedule page error:', err.message);
    res.redirect('/user');
  }
});

router.get('/api/:id', async (req, res) => {
  try {
    const schedule = await scheduleStore.findById(req.session.user.id, req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found.' });

    res.json({
      id: schedule.id,
      name: schedule.name,
      schedule: schedule.data,
      updatedAt: schedule.updatedAt
    });
  } catch (err) {
    console.error('Load schedule error:', err.message);
    res.status(500).json({ error: 'Failed to load schedule.' });
  }
});

router.post('/api/:id', async (req, res) => {
  try {
    const { schedule: scheduleData } = req.body;
    if (!scheduleData || typeof scheduleData !== 'object') {
      return res.status(400).json({ error: 'Invalid schedule data.' });
    }

    const existing = await scheduleStore.findById(req.session.user.id, req.params.id);
    if (!existing) return res.status(404).json({ error: 'Schedule not found.' });

    const record = await scheduleStore.updateData(
      req.session.user.id,
      req.params.id,
      scheduleData
    );
    res.json({ ok: true, updatedAt: record.updatedAt });
  } catch (err) {
    console.error('Save schedule error:', err.message, err.cause?.message || '');
    res.status(500).json({ error: 'Failed to save schedule.' });
  }
});

module.exports = router;
