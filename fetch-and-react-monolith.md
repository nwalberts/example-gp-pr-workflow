In this article, we'll discuss how to use Fetch in a React component to make GET and POST requests to the back-end server. We'll make special note of how `useEffect` can help us better trigger our Fetch function as well.

## Learning Goals

* Review `useEffect` basics
* Review ES6 Promises and the Fetch API
* Use the Fetch API in a React component to GET data from the server
* Use the Fetch API in a React component to POST data to the server

## Getting Started

```no-highlight
et get fetch-and-react-monolith
cd fetch-and-react-monolith
yarn install
yarn run dev
``` 

*Before beginning, make sure that your application is rendering `App.js` as the top-level component. Your `main.js` file should contain the following before beginning:*

```js
import React from "react"
import { render } from "react-dom"

import App from "./components/App"
import config from "./config"
import RedBox from "redbox-react"

document.addEventListener("DOMContentLoaded", () => {
  let reactElement = document.getElementById("app")

  if (reactElement) {
    if (config.env === "development") {
      try {
        render(<App />, reactElement)
      } catch (e) {
        render(<RedBox error={e} />, reactElement)
      }
    } else {
      render(<App />, reactElement)
    }
  }
})

```
Now you should be ready to go, as long as the `h1` books is being displayed above a book form on the page.

To review, we can use the [Fetch API][fetch-api-article] to fetch data from a back-end server to use in a front-end app. In this article, we will be using that functionality in the context of React.

## Fetch in a React Component

When using React components for our front-end, we will frequently need to reach out to a server to retrieve or manipulate data which we want to display or change in our app. This server might be something internal within our app, which we create, or an external data source which we reach out to.

Let's walk through two examples of Fetch in a React component: a `GET` request and a `POST` request. In these examples, we will Fetch to an internal API; external APIs are discussed at the end of the article.

### `GET` Fetch Requests

Let's start by implementing a `GET` Fetch request to pull data from our server and display it on the front-end.

If you navigate to <http://localhost:3000>, you should see a page with a "Books" heading and a small form for adding new books.

Looking through the React code files, we see that this page is being rendered in `client/src/components/App.js`, which includes an unordered list of the titles of any books in state. Because `books` is currently an empty array (being stored `in state`), this list isn't visible on our page.

```JavaScript
// client/src/components/App.js
...

const App = (props) => {
  const [books, setBooks] = useState([])
  ...
  const bookListItems = books.map(book => {
    return <li key={book.id}>{book.name}</li>;
  });

  return (
    <div>
      <h1>Books</h1>
      <ul>
        {bookListItems}
      </ul>
      <BookForm addBook={addBook} />
    </div>
  );
}

export default hot(App);
```

We'd like to modify our code to retrieve data from our back-end server via the Fetch API, and then update our component's state with this book data. Moreover, we'd like this to happen right after the component mounts, rather than requiring some kind of interaction from the user.

Modify `App.js` so that you've added the below `fetchData` function, and invoked it within the `useEffect` function as shown below:

```JavaScript
const fetchData = async () => {
  try {
    const response = await fetch('/api/v1/books')
    if (!response.ok) {
      const errorMessage = `${response.status} (${response.statusText})`
      const error = new Error(errorMessage)
      throw(error)
    }
    const bookData = await response.json()
    setBooks(bookData.books)
  } catch(err) {
    console.error(`Error in fetch: ${err.message}`)
  }
}

useEffect(() => {
  fetchData()
},[])
```

On the React end, there's something tricky going on here. Our gut reaction may be to put our Fetch directly inside of our `useEffect` call and make our entire function passed into `useEffect` an async function, as so:

```javascript
useEffect(async () => {
  // all logic here
})
```

However, we know that the `async` keyword makes a function return a _Promise_, and the way React sets `useEffect` up, it isn't able to return a Promise! If we tried this approach, we would get an error that tells us: 

```no-highlight
react-dom.development.js:88 Warning: An effect function must not return anything besides a function, which is used for clean-up.

It looks like you wrote useEffect(async () => ...) or returned a Promise. Instead, write the async function inside your effect and call it immediately
```

Because of this, we want to follow their guidance! _Inside_ of our `useEffect` callback function, we will define an `async` function called `fetchData`, which fetches our data and updates our state appropriately. We then invoke that method inside of our `useEffect` method. 

> If you're curious, you can find more information on best practices fetching data with hooks in the [docs here][data-fetching-with-hooks-docs]!

Now that we've got the funky `async` structure out of the way, let's talk about what's happening inside of that function. When the component mounts, the Fetch will make a call to `/api/v1/books`. Looking at our `booksRouter` file, we see that the server will return a [status of 200](https://http.cat/200) and the parsed JSON data from our `books.json` file. (Check out the `findAll()` method defined in our `Book` model to see exactly how this data is being prepared.)

```JavaScript
// server/src/routes/api/v1/booksRouter.js

booksRouter.get('/', (req, res) => {
  res.set({ 'Content-Type': 'application/json' }).status(200).json({ books: Book.findAll() })
})
```

Once a response is received, the Fetch digs in to the `books` property in the body of the response, and updates the `books` property of the component's state with the array of book objects from the response body. This state change automatically triggers the `render` method to run again, displaying the page updated with the list of books retrieved from the server:

![Image of unordered list with two bullet points of book data][fetched-books-list-image]

Voilà!

### `POST` Fetch Requests

Now let's set up another Fetch to let us add books to our system. This Fetch will take data collected in the form and make a `POST` request to our server.

Taking a closer look at `App.js`, you'll see that it renders `BookForm.js`, which in turn renders `TextField.js`. There's also an `addBook` function defined in `App.js`, passed down to `BookForm.js` as a prop, and used there in the `handleSubmit` function. This is where we want our new Fetch to go!

> _Which component should I put my Fetch in?_ Your Fetch is ultimately going to update your state, so you'll want the Fetch to be in the same component as the state it's updating. If we put this Fetch in `BookForm`, it wouldn't be able to update our list of books with our new title!

Let's modify our `addBook` function as follows:

```JavaScript
const addBook = async (formPayload) => {
  try {
    const response = await fetch('/api/v1/books', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(formPayload)
    })
    if (!response.ok) {
      if(response.status === 422) {
        const body = await response.json()
        return setErrors(body.errors)
      } else {
        const errorMessage = `${response.status} (${response.statusText})`
        const error = new Error(errorMessage)
        throw(error)
      }
    }
    const body = await response.json()
    const currentBooks = books
    setErrors({})
    setBooks(currentBooks.concat(body.book))
  } catch(err) {
    console.error(`Error in fetch: ${err.message}`)
  }
}
```

This Fetch will make a `POST` request to our server. Looking at our `booksRouter` and `Book` model files, we see:

```javascript
// server/src/routes/api/v1/booksRouter.js

booksRouter.post('/', (req, res) => {
  const book = new Book(req.body.book)
  if(book.save()) {
    res.status(201).json({ book })
  } else {
    res.status(422).json({ errors: book.errors })
  }
})
```

```javascript
// server/src/models/Book.js

...

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

...

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

...
```

Here, the server is reading the data from the HTTP request made by our Fetch and creating a new `Book` object with the book data from the request body. It then calls `save()` to persist the book. `save()` first checks whether the book title is just an empty string using the instance method `isValid()`, and if it is valid, writes the new book to the JSON file, and returns `true` so that our controller can send the front-end a [status 201](https://http.cat/201) and the JSON data for the new book. If it is not valid, `save()` returns `false` so that the server sends the front-end a [status 422](https://http.cat/422) and some JSON containing an error message about missing a title.

Once the Fetch receives the response, it checks whether `response.ok` is true. If it received an error status code from our server, `response.ok` is false. We then check if that error was a `422 Unprocessable Entity` status. If so, we know that we have errors provided in our response body (check out our `booksRouter` again if you want to review how!), so we parse the body, grab the errors, and add them to our component's state, so that they will be handed to the _exact same ErrorList_ component that we've worked with for client-side errors! If any other error code occurred, it throws the error and logs it.

If our Fetch received a status code of `201 Created` in the response (meaning that `response.ok` is true), it clears out any old errors, and adds the new book to the list of books currently in state. This is the benefit of our back-end server returning the book data as a part of the response to the front-end: because we get the new book's information, we have everything we need, including its newly created `id`, to add that book to our existing list of books and update the list on our page! Finally, this change of state triggers the component to render again, displaying the new list of books.

### Summary

In this article, we have demonstrated how to utilize a back-end server to persist the data in your React application through the use of the Fetch API, as well as briefly reviewed how this would work when reaching out to an external API endpoint.

You will note that we used a `.json` file to store the data. While this serves our purposes for this particular app, this is not always ideal! Most of the time, our apps will have multiple users who are possibly using the app at the same time, and we will want the data from all users to be stored with our app. In the upcoming weeks, we will be discussing more scalable and reliable ways to store data, such as databases, which will allow us to have the extended functionality needed for a variety of apps.

### External Resources

* [Fetch API][mdn-fetch-api]
* [Using Fetch][mdn-using-fetch]
* [Data Fetching with Hooks][data-fetching-with-hooks-docs]
* [HTTP Access Control (CORS)][mdn-cors]

[data-fetching-with-hooks-docs]: https://reactjs.org/docs/hooks-faq.html#how-can-i-do-data-fetching-with-hooks
[fetch-api-article]: https://learn.launchacademy.com/lessons/fetch-and-express-with-async-await
[fetched-books-list-image]: https://s3.amazonaws.com/horizon-production/images/Books-with-fetched-titles.png
[mdn-fetch-api]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[mdn-using-fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
[mdn-cors]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS