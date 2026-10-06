# Library Books API

This REST API manages the library's primary resource: books.

## Endpoints

- **Method:** `GET`
  - **Path:** `/books`
  - **Description:** Retrieves a complete list of all books in the library.
  - **Success Status:** 200 OK

- **Method:** `GET`
  - **Path:** `/books?author=tolkien`
  - **Description:** Retrieves a filtered list of books written by a specific author using a URL query parameter.
  - **Success Status:** 200 OK

- **Method:** `GET`
  - **Path:** `/books/42`
  - **Description:** Retrieves the detailed data for a single, specific book by its ID.
  - **Success Status:** 200 OK

- **Method:** `POST`
  - **Path:** `/books`
  - **Description:** Creates and adds a newly acquired book into the library system.
  - **Request Body:** `{"title": "The Hobbit", "author": "J.R.R. Tolkien", "year": 1937}`
  - **Success Status:** 201 Created

- **Method:** `PATCH`
  - **Path:** `/books/42`
  - **Description:** Updates specific fields of an existing book without replacing the entire record (e.g., changing its checkout status).
  - **Request Body:** `{"status": "checked_out"}`
  - **Success Status:** 200 OK

- **Method:** `DELETE`
  - **Path:** `/books/42`
  - **Description:** Permanently removes a book from the library database.
  - **Success Status:** 204 No Content

## Error Handling

- **400 Bad Request:** This occurs when the client sends an invalid or incomplete request.
  - _Example:_ The client sends a `POST /books` request to create a book but forgets to include the required `"title"` field in the JSON body, or sends improperly formatted JSON.
- **404 Not Found:** This occurs when the requested resource does not exist on the server.
  - _Example:_ The client attempts to `GET /books/999` or `DELETE /books/999`, but there is no book with the ID of 999 in the database.
