import fs from 'fs'
import _ from "lodash"

const booksPath = "books.json"

class Book {
  constructor({ id, title }) {
    this.id = id
    this.title = title
  }

  static findAll() {
    const bookData = JSON.parse(fs.readFileSync(booksPath)).books
    let books = []
    bookData.forEach(book => {
      const newBook = new Book(book)
      books.push(newBook)
    })
    return books
  }

  isValid() {
    this.errors = {}
    const requiredFields = ["title"]
    let isValid = true

    for(const requiredField of requiredFields) {
      this.errors[requiredField] = []
      if(!this[requiredField]) {
        isValid = false
        this.errors[requiredField].push("can't be blank")
      }
    }
    return isValid
  }

  static getNextBookId() {
    const maxBook = _.maxBy(this.findAll(), book => book.id)
    return maxBook.id + 1
  }

  save() {
    if(this.isValid()) {
      delete this.errors
      this.id = this.constructor.getNextBookId()
      const books = this.constructor.findAll()
      books.push(this)
      const data = { books: books }
      fs.writeFileSync(booksPath, JSON.stringify(data))
      return true
    } else {
      return false
    }
  }
}

export default Book