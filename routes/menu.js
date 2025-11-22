const express = require('express');
const db = require('../db');
const auth = require('./authMiddleware');
const router = express.Router();

router.get('/', (req, res) => {
  const { page, pageSize } = req.query;
  if (!page && !pageSize) {
    db.all('SELECT * FROM menus ORDER BY "order"', [], (err, menus) => {
      if (err) return res.status(500).json({error: err.message});
      
      const getSubMenus = (menu) => {
        return new Promise((resolve, reject) => {
          db.all('SELECT * FROM sub_menus WHERE parent_id = ? ORDER BY "order"', [menu.id], (err, subMenus) => {
            if (err) reject(err);
            else resolve(subMenus);
          });
        });
      };
      
      Promise.all(menus.map(async (menu) => {
        try {
          const subMenus = await getSubMenus(menu);
          return { ...menu, subMenus };
        } catch (err) {
          return { ...menu, subMenus: [] };
        }
      })).then(menusWithSubMenus => {
        res.json(menusWithSubMenus);
      }).catch(err => {
        res.status(500).json({error: err.message});
      });
    });
  } else {
    const pageNum = parseInt(page) || 1;
    const size = parseInt(pageSize) || 10;
    const offset = (pageNum - 1) * size;
    db.get('SELECT COUNT(*) as total FROM menus', [], (err, countRow) => {
      if (err) return res.status(500).json({error: err.message});
      db.all('SELECT * FROM menus ORDER BY "order" LIMIT ? OFFSET ?', [size, offset], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json({
          total: countRow.total,
          page: pageNum,
          pageSize: size,
          data: rows
        });
      });
    });
  }
});

router.get('/:id/submenus', (req, res) => {
  db.all('SELECT * FROM sub_menus WHERE parent_id = ? ORDER BY "order"', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

router.post('/', auth, (req, res) => {
  const { name, order } = req.body;
  db.run('INSERT INTO menus (name, "order") VALUES (?, ?)', [name, order || 0], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ id: this.lastID });
  });
});

router.put('/:id', auth, (req, res) => {
  const { name, order } = req.body;
  db.run('UPDATE menus SET name=?, "order"=? WHERE id=?', [name, order || 0, req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ changed: this.changes });
  });
});

router.delete('/:id', auth, (req, res) => {
  db.run('DELETE FROM menus WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ deleted: this.changes });
  });
});

router.post('/:id/submenus', auth, (req, res) => {
  const { name, order } = req.body;
  db.run('INSERT INTO sub_menus (parent_id, name, "order") VALUES (?, ?, ?)', 
    [req.params.id, name, order || 0], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ id: this.lastID });
  });
});

router.put('/submenus/:id', auth, (req, res) => {
  const { name, order } = req.body;
  db.run('UPDATE sub_menus SET name=?, "order"=? WHERE id=?', [name, order || 0, req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ changed: this.changes });
  });
});

router.delete('/submenus/:id', auth, (req, res) => {
  db.run('DELETE FROM sub_menus WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
