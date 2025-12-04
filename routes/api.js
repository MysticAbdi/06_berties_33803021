const express = require('express');
const router = express.Router();

// book api route
router.get('/books', (req, res, next) => {
  const { search, minprice, max_price, sort } = req.query;

  // Base query
  let sql = 'SELECT * FROM books';
  const params = [];
  const whereClauses = [];

  // search functionality
  if (search) {
    whereClauses.push('name LIKE ?');
    params.push(`%${search}%`);
  }

  // price range
  if (minprice) {
    whereClauses.push('price >= ?');
    params.push(Number(minprice));
  }

  if (max_price) {
    whereClauses.push('price <= ?');
    params.push(Number(max_price));
  }

  if (whereClauses.length > 0) {
    sql += ' WHERE ' + whereClauses.join(' AND ');
  }

  // sort option
  if (sort === 'name') {
    sql += ' ORDER BY name ASC';
  } else if (sort === 'price') {
    sql += ' ORDER BY price ASC';
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      // Return error as JSON
      res.status(500).json({ error: 'Database error', detail: err });
      return next(err);
    }
    res.json(result);   
  });
});

module.exports = router;
