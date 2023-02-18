## What is http

The Hypertext Transfer Protocol (HTTP) is designed to enable communications between clients and servers.

---

### HTTP Methods

- GET
- POST
- PUT
- HEAD
- DELETE
- PATCH
- OPTIONS
- CONNECT
- TRACE

The two most commons HTTP methods are: GET and POST

---

### The GET method

GET is used to request data from a specified resource

- GET requests can be cached
- GET requests remain in the browser history
- GET requests can be boomarked
- GET requests should never be used when dealing with senstitive data
- GET requests have length restrictions
- GET requests are only used to request data (not modify)
- Application/x-www-form-urlencoded
- Maximum URL length is 2048 characters
- Only ASCII characters allowed
  
--- 

### The POST method

POST is used to send data to a server to create/update a resource

The data sent to the server with POST is stored in the request body of the HTTP request

- POST requests never cached
- POST requests remain in the browser history
- POST requests cannot be bookmarked
- POST request have no retrictions on data length
- Application/x-www-form-urlencoded or multipart/form-data. Use multipart encoding for binary data

