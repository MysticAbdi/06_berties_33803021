# Bertie's Books

Small Express + MySQL demo app for managing and searching a book catalog and basic user registration/login.

## Features
- List all books, bargain books (under £20), and search by title.
- Add books via a simple form.
- Register users with bcrypt-hashed passwords and basic login auditing.
- Simple EJS views and static CSS in [public/main.css](public/main.css).
- App-wide shop data exposed through [`app.locals.shopData`](index.js).

## Validation and sanitisation

This app uses `express-validator` and `req.sanitize` to clean user input before it is used.

### Where sanitisation is used

- **Registration form** (`/users/registered`)  
  First name, last name, email, username and password are all validated and sanitised before being stored in the database.

- **Login form** (`/users/loggedin`)  
  Username and password are validated and sanitised before checking them against the database and before writing to the login log.

- **Add book form** (`/books/bookadded`)  
  Book name and price are validated and sanitised before being inserted.

- **Book search** (`/search-result`)  
  The search keyword is validated and sanitised before being used in the SQL `LIKE` query.

In all of these routes we also use parameterised queries (`db.query(sql, params)`) instead of building SQL strings, which helps prevent SQL injection.

### Where sanitisation is not used

Some routes (for example the home page, about page, book list, bargain books, user list, etc.) only read data from the database or show static content and do not take free-text input from the user. For these routes, extra sanitisation on the request is not needed.
::contentReference[oaicite:0]{index=0}

## Tech Stack
- Node.js
- Express
- EJS 
- HTML5 forms & basic CSS
- MySQL server

## Prerequisites
- Node.js
- MySQL server

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```

2. Create the database (run in MySQL):
   - Execute [create_db.sql](create_db.sql)
   - Optionally insert seed data with [insert_test_data.sql](insert_test_data.sql)

3. Configure environment variables:
   - Copy or edit `.env` to match your MySQL credentials (the app reads DB settings from [.env](.env)):
     ```
     BB_HOST='localhost'
     DB_USER=berties_books_app
     DB_PASSWORD=qwertyuiop
     DB_NAME=berties_books
     ```

4. Start the app:
   ```sh
   node index.js
   ```
   The server listens on port 8000 by default.

## Usage

- Open http://localhost:8000/

### Book Routes (`/books`) - see [routes/books.js](routes/books.js)

- `/books/list` - list all books  
  - **Public route** - no login required  

- `/books/bargainbooks` - view books under £20  
  - **Public route** - no login required  

- `/books/search` - book search page  
  - **Public route** - no login required  

- `/books/addbook` - submit new book  
  - **Restricted route** - requires login  

### User Routes (`/users`) - see [routes/users.js](routes/users.js)

- `/users/register` - registration form  
  - **Public route** - no login required  

- `/users/login` - login form  
  - **Public route** - no login required  

- `/user/list` - list all users 
  - **Restricted route** - requires login  

- `/users/audit` - login attempts audit  
  - **Restricted route** - requires login  

