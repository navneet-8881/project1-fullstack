const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT id, title, completed FROM todos ORDER BY id DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to fetch todos' });
    }
    res.json(rows.map((row) => ({ ...row, completed: Boolean(row.completed) })));
  });
});

router.post('/', (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  db.run('INSERT INTO todos (title) VALUES (?)', [title.trim()], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Unable to add todo' });
    }
    res.status(201).json({ id: this.lastID, title: title.trim(), completed: false });
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  db.run(
    'UPDATE todos SET completed = ? WHERE id = ?',
    [completed ? 1 : 0, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Unable to update todo' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      res.json({ id: Number(id), completed: Boolean(completed) });
    }
  );
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM todos WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Unable to delete todo' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ success: true });
  });
});

module.exports = router;
