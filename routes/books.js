// Create a new router
const express = require("express")
const router = express.Router()
const { check, validationResult, query } = require('express-validator');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('../users/login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

router.get('/search',function(req, res, next){
    res.render("search.ejs", { errors: [] })
});

// Search result route
router.get(
  '/search-result',
  [
    query('keyword')
      .trim()
      .escape()
      .isLength({ min: 1, max: 50 })
      .withMessage('Search keyword must be between 1 and 50 characters')
  ],
  (req, res, next) => {
    const errors = validationResult(req);

   
    if (!errors.isEmpty()) {
      return res.render('search.ejs', { errors: errors.array() });
    }
    
    const rawKeyword = req.query.keyword || '';
    const keyword = req.sanitize(rawKeyword).trim();

    if (!keyword) {
      return res.render('search-result.ejs', { availableBooks: [] });
    }

    const sqlquery = 'SELECT name, price FROM books WHERE name LIKE ?';
    const params = ['%' + keyword + '%'];

    db.query(sqlquery, params, (err, result) => {
      if (err) return next(err);
      res.render('search-result.ejs', { availableBooks: result });
    });
  }
);

// List books route
router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT * FROM books"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("list.ejs", {availableBooks:result})
     });
});

// Add book route
router.get('/addbook', redirectLogin, function (req, res, next) {
  res.render('addbook.ejs', { errors: [] });
});

router.post('/bookadded', redirectLogin, 
  [
    check('name')
      .trim()
      .escape()
      .isLength({ min: 1, max: 100 })
      .withMessage('Book name must be between 1 and 100 characters'),
    check('price')
      .trim()
      .isFloat({ min: 0.01, max: 999 })
      .withMessage('Price must be a valid number between £0.1 and £999 ')
  ],
  (req, res, next) => {
    req.body.name = req.sanitize(req.body.name) 
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.render('addbook.ejs', { errors: errors.array() })
    }

    // saving data in database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)"
    // execute sql query
    let newrecord = [req.body.name, req.body.price]
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err)
        }
        else {
            res.send('This book is added to database, name: ' + req.body.name + ' price £' + req.body.price + ' <a href="./list">Go to List</a> Or <a href="../">Home</a>') 
        }
    })
});

// list bargain books route (< £20)
router.get('/bargainbooks',function (req, res, next) {       
    let sqlquery = 'SELECT name, price FROM books WHERE price < 20 ORDER BY price ASC';
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("bargainbooks.ejs", {availableBooks:result})
     });
});

// Export the router object so index.js can access it
module.exports = router
