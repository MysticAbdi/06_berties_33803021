// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')
const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('../users/login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

//  User registration routes
router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

router.post('/registered', function (req, res, next) {
        const saltRounds = 10;
        const plainPassword = req.body.password;
        let sqlquery = "INSERT INTO userData (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)"

        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            // Store hashed password in the database.
            let newrecord =[req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword];
            // Execute SQL query
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                    return next(err);
                }
                else {
                    const message = `
                    <h1>Registration Successful</h1>
                    <p>Hello ${req.body.first} ${req.body.last}, you are now registered!</p>
                    <p>We will send an email to you at ${req.body.email}.</p>
                    <p>Your password is: ${req.body.password}</p>
                    <p>Your hashed password is: ${hashedPassword}</p>
                    <p><a href="/">Back home</a></p>`;
                    res.send(message);                                                                              
                }
            });
        });

    });

router.get('/list', function(req, res, next) {
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
    res.render('login.ejs');
})
router.post('/loggedin', function(req, res, next) {
    const {username, password} = req.body;
    let sqlquery = "SELECT username, hashedPassword FROM userData WHERE username = ?";
    const cleanUsername = username.trim();

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
            const match = await bcrypt.compare(password, user.hashedPassword);

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
    });

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
