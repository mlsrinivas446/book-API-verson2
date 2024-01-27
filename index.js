const express = require('express')

const path = require('path')

const {open} = require('sqlite') //open is a sqlite method
const sqlite3 = require('sqlite3') // used to write sql query manually

const app = express()
app.use(express.json()) //recognize request obj as json and parse it

const dbPath = path.join(__dirname, 'goodreads.db') // __dirname return path of folder of current js file

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      //open return promise obj
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

// Get Books API
app.get('/books/', async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`
  const booksArray = await db.all(getBooksQuery) //all is a sqlite query method
  response.send(booksArray)
})

//Get Book API
app.get('/books/:bookId/', async (request, response) => {
  const {bookId} = request.params //provide path parameter throught request
  const getBookQuery = `SELECT 
                            *
                        FROM
                          book 
                        WHERE 
                          book_id=${bookId};`
  const book = await db.get(getBookQuery) //get is a sqlite query method
  response.send(book)
})

app.post('/books/', async (request, response) => {
  const bookDetails = request.body //while requesting must write app.use(express.json())
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`
  const dbResponse = await db.run(addBookQuery) //run is a sqlite query method
  const bookId = dbResponse.lastID //lastID give last id of book
  response.send({book_id: bookId})
})

app.put('/books/:bookId/', async (request, response) => {
  const {bookId} = request.params
  const bookDetails = request.body
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails

  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`

  const updateBook = await db.run(updateBookQuery)
  response.send('Book successfully updated')
})

app.delete('/books/:bookId/', async (request, response) => {
  const {bookId} = request.params
  const deleteBookQuery = `
    DELETE FROM
        book
    WHERE
        book_id = ${bookId};`
  const bookDeleted = await db.get(deleteBookQuery)
  response.send('Book successfully deleted')
})

app.get('/authors/:authorId/books/', async (request, response) => {
  const {authorId} = request.params
  const getAuthorBooksQuery = `SELECT * FROM book WHERE author_id=${authorId};`
  const getAuthorBooks = await db.all(getAuthorBooksQuery)
  response.send(getAuthorBooks)
})
