import express from "express"

import Book from "../../../models/Book.js"

const booksRouter = new express.Router()

booksRouter.get('/', (req, res) => {
  res.set({ 'Content-Type': 'application/json' }).status(200).json({ bookz: Book.findAll() })
})                                                        

booksRouter.post('/', (req, res) => {
  const book = new Book(req.body.book)
  if(book.save()) {
    res.status(201).json({ book })
  } else {
    res.status(422).json({ errors: book.errors })
  }
})

export default booksRouter                                                    