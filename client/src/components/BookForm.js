import React, { useState } from "react"

const BookForm = (props) => {
  const [title, setTitle] = useState("")

  const handleSubmit = (event) => {
    event.preventDefault()
    let formPayload = {
      book: {
        title: title
      }
    };
    props.addBook(formPayload)
    setTitle("")
  }

  const handleChange = (event) => {
    setTitle(event.target.value)
  }

  return (
    <form className="callout" onSubmit={handleSubmit}>
      <label>Book Title
        <input
          name="title"
          type="text"
          value={title}
          onChange={handleChange}
        />
      </label>
      <input className="button" type="submit" value="Submit" />
    </form>
  )
}


export default BookForm
