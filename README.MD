# Bertie's Books

Small Express + MySQL demo app for managing and searching a book catalog and basic user registration/login.

## Features
- List all books, bargain books (under £20), and search by title.
- Add books via a simple form.
- Register users with bcrypt-hashed passwords and basic login auditing.
- Simple EJS views and static CSS in [public/main.css](public/main.css).
- App-wide shop data exposed through [`app.locals.shopData`](index.js).

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
  - **Restricted route** - requires login  

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

- `/users/audit` - login attempts audit  
  - **Restricted route** - requires login  

