# Blogging Platform API

This project is a RESTful API for a simple blogging platform. The API allows users to perform CRUD operations (Create, Read, Update, Delete) on blog posts. The project includes token-based authentication and uses MongoDB for data storage and Cloudinary for media storage.

## API Endpoints

### Base URL
**For User:** `/api/v1/users`
**For Posts:** `/api/v1/posts`

### Blog Posts

- **Create a new blog post**
    - `POST /new-post`
    - Requires authentication

- **Retrieve a list of all blog posts**
    - `GET /retrieve-all-posts`

- **Retrieve a single blog post by its ID**
    - `GET /retrieve-post/:id`

- **Update an existing blog post**
    - `PUT /update-post/:id`
    - Requires authentication

- **Delete a blog post**
    - `DELETE /delete-post/:id`
    - Requires authentication

### Users Endpoints

- **Register User**
    - `POST /register`

- **User Login**
    - `POST /login`

- **User Logout**
    - `POST /logout`

- **Refresh Access Token**
    - `POST /refresh-token`


### Authentication

The API uses token-based authentication. You need to include a valid token in the `Authorization` header to access protected routes.

### Data Validation

The API validates input data to ensure that required fields such as title and content are present.

### Notes

- Ensure to update the `CORS_ORIGIN` variable in the `.env` file with the origin URL of your frontend application.
- The `.env` file is not included in the repository for security reasons. Please create your own `.env` file based on the provided environment variables.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/mohitagarwal99/Blog-Post-Backend.git
    cd Blog-Post-Backend
    ```

2. Install the required node modules:
    ```sh
    npm i
    ```

## Running the Server

Start the development server with the following command:
```sh
npm run dev
