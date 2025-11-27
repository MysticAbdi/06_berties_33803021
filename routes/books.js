// Create a new router
const express = require("express")
const router = express.Router()
const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('../users/login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

router.get('/search',function(req, res, next){
    res.render("search.ejs")
});

// Search result route
router.get('/search-result',  function (req, res, next) {
    const keyword = (req.query.keyword || '').trim();

    if (!keyword) {
        return res.render("search-result.ejs", { availableBooks: [] });
    }

    const sqlquery = 'SELECT name, price FROM books WHERE name LIKE ?';
    const params = ['%' + keyword + '%'];

    db.query(sqlquery, params, (err, result) => {
        if (err) return next(err);
        res.render("search-result.ejs", { availableBooks: result });
    });
});

// List books route
router.get('/list', redirectLogin, function(req, res, next) {
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
  res.render('addbook.ejs');
});

router.post('/bookadded', redirectLogin, function (req, res, next) {
    // saving data in database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)"
    // execute sql query
    let newrecord = [req.body.name, req.body.price]
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err)
        }
        else
            res.send(' This book is added to database, name: '+ req.body.name + ' price '+ req.body.price)
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
