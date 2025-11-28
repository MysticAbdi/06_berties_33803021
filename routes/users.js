// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator');
const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('../users/login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
};

//  User registration routes
router.get('/register', (req, res) => {
  res.render('register.ejs', { errors: [] })
})

// Registration with validation + sanitisation
router.post(
  '/registered',
  [
    check('first')
      .isLength({ min: 2, max: 1000 })
      .withMessage('First name must be between 2 and 30 characters'),
    check('last')
      .isLength({ min: 2, max: 30 })
      .withMessage('Last name must be between 2 and 30 characters'),
    check('email')
      .isEmail()
      .withMessage('Email must be valid'),
    check('username')
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be between 3 and 20 characters'),
    check('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
  ],
  (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.render('register.ejs', { errors: errors.array() })
    } else {
      const plainPassword = req.sanitize(req.body.password)
      const username = req.sanitize(req.body.username)
      const first = req.sanitize(req.body.first)
      const last = req.sanitize(req.body.last)
      const email = req.sanitize(req.body.email)

      if (!username || !plainPassword) {
        return res.send("Username and password required.")
      }

      const saltRounds = 10;
      let sqlquery = "INSERT INTO userData (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)"
      
      // Check if username or email already exists
      let checkQuery = "SELECT * FROM userData WHERE username = ? OR email = ?";
      db.query(checkQuery, [username, email], (err, result) => {
        if (err) return next(err);

        if (result.length > 0) {
          // User already exists
          return res.send(`
            <h1>Registration Failed</h1>
            <p>The username or email is already registered. Please choose another.</p>
            <p><a href="./register">Return to registration</a></p>
          `);
        }

        // Proceed to hash password and insert new user
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
          if (err) return next(err);

          let newrecord = [username, first, last, email, hashedPassword];
          db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
              return next(err);
            } else {
              const message = `
                <h1>Registration Successful</h1>
                <p>Hello ${first} ${last}, you are now registered!</p>
                <p>We will send an email to you at ${email}.</p>
                <p>Your password is: ${plainPassword}</p>
                <p>Your hashed password is: ${hashedPassword}</p>
                <p><a href="/">Back home</a></p>`;
              res.send(message);
            }
          });
        });
      });
    }
  }
);


router.get('/list', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT * FROM userData"; // query database to get all the users
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("userList.ejs", {users:result})
     });
});

//  User login routes
router.get('/login', function(req, res, next) {
    res.render('login.ejs', { errors: [] });
})
router.post(
  '/loggedin',
  [
    check('username')
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be between 3 and 20 characters'),
    check('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  
  (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.render('login.ejs', { errors: errors.array() })
    } 

    const {username, password} = req.body;
    const cleanUsername = req.sanitize(username.trim());
    const cleanPassword = req.sanitize(password);
    let sqlquery = "SELECT username, hashedPassword FROM userData WHERE username = ?";
    

    //  execute sql query
    db.query(sqlquery, cleanUsername, async (err, result) => {
        if (err) {
            return next(err);
        }
            
        if (result.length === 0) {
            //Invalid username
            db.query("INSERT INTO loginAttempts (username, success, reason) VALUES (?, ?, ?)",
                [cleanUsername, false, "Invalid username"]);
            return res.send(`
                <h1>Login Failed</h1>
                <p>Invalid username</p>
                <p><a href="/">Back home</a></p>
                `);
        }

        const user = result[0];

        try {
            const match = await bcrypt.compare(cleanPassword, user.hashedPassword);

            if (match) {
                // Save user session here, when login is successful
                req.session.userId = req.body.username;

                //Successful attempt
                db.query("INSERT INTO loginAttempts (username, success, reason) VALUES (?, ?, ?)",
                [cleanUsername, true, "Login successful"]);
                res.send(`
                    <h1>Login Successful</h1>
                    <p>Welcome back, ${cleanUsername}!</p>
                    <p><a href="/">Return to home</a></p>
                    `);
            }
            else {
                //Invalid password
                db.query("INSERT INTO loginAttempts (username, success, reason) VALUES (?, ?, ?)",
                [cleanUsername, false, "Invalid password"]);
                res.send(`
                    <h1>Login Failed</h1>
                    <p>Invalid password</p>
                    <p><a href="/">Back home</a></p>
                    `);
                }
            } catch (compareErr) {
                next(compareErr);
            }
        });
      }      
);   
     
    // User logout route
    router.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
        if (err) {
          return res.redirect('../')
        }
        res.send('you are now logged out. <a href='+'../'+'>Home</a>');
        });
    });


// Audit log route
router.get('/audit', redirectLogin, function (req, res, next) {
    let sqlquery = "SELECT * FROM loginAttempts ORDER BY attemptTime DESC";

    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err);
        }
        res.render('audit.ejs', { attempts: result });
    });
});


// Export the router object so index.js can access it
module.exports = router
