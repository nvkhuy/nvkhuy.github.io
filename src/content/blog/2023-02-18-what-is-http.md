---
tags:
  - network
title: What is HTTP
author: Huy Nguyen
pubDatetime: 2023-02-18T15:57:52.737Z
slug: what-is-http
featured: false
ogImage: https://user-images.githubusercontent.com/53733092/215771435-25408246-2309-4f8b-a781-1f3d93bdf0ec.png
description: explain what is http and usage
---
HTTP, or Hypertext Transfer Protocol, is an application-layer protocol used for transmitting hypermedia documents (such as HTML) over the World Wide Web. It's the foundation of data communication on the internet, enabling web browsers to request and retrieve web pages from web servers. HTTP operates on top of the TCP (Transmission Control Protocol) or sometimes on top of the TLS/SSL for secure communication (HTTPS). Here are some details about HTTP and its methods:

**HTTP Methods (HTTP Verbs):**
HTTP defines several methods or verbs, which are used to specify the desired action to be performed on a resource identified by a URL (Uniform Resource Locator). Each method has a specific purpose:

1. **GET:** The GET method is used to request data from a specified resource. It retrieves data without causing any change in the server's state. It's used for fetching web pages, images, and other resources.

2. **POST:** The POST method is used to submit data to be processed to a specified resource. It can be used for form submissions, file uploads, and other actions that may modify server data.

3. **PUT:** The PUT method is used to update a resource or create a new resource if it doesn't exist. It replaces the entire resource with the data provided in the request.

4. **PATCH:** The PATCH method is used to apply partial modifications to a resource. It's typically used when you want to update only specific parts of a resource, rather than replacing the entire resource as in PUT.

5. **DELETE:** The DELETE method is used to request the removal of a resource from the server. It deletes the specified resource.

6. **HEAD:** The HEAD method is similar to GET but requests only the headers of the response, not the actual content. It's often used to check if a resource has been modified since a certain date or to gather metadata about the resource.

7. **OPTIONS:** The OPTIONS method is used to retrieve information about the communication options for the target resource. It can be used to inquire which HTTP methods are supported by the server for a particular resource.

8. **CONNECT:** The CONNECT method is used to establish a network connection to a resource, usually for use with a proxy server. It's primarily used in the context of HTTPS tunneling.

9. **TRACE:** The TRACE method is used to retrieve diagnostic information from the server. It's primarily used for debugging and testing purposes.

**Differences Between HTTP Methods:**

The primary differences between these methods lie in their purpose and the effect they have on the server and its resources:

- **GET:** Retrieves data from a resource without altering it.
- **POST:** Submits data to the server, potentially leading to changes in server data.
- **PUT:** Replaces an entire resource or creates a new one if it doesn't exist.
- **PATCH:** Applies partial modifications to a resource.
- **DELETE:** Removes a resource from the server.
- **HEAD:** Retrieves only the headers of a response, not the content.
- **OPTIONS:** Retrieves information about the communication options for a resource.
- **CONNECT:** Establishes a network connection to a resource.
- **TRACE:** Retrieves diagnostic information from the server.

Here's a comparison of common HTTP methods in a table format:

| HTTP Method | Purpose                        | Idempotent | Request Body | Safe |
|-------------|--------------------------------|------------|--------------|------|
| GET         | Retrieve data from a resource  | Yes        | No           | Yes  |
| POST        | Submit data to a resource      | No         | Yes          | No   |
| PUT         | Replace a resource             | Yes        | Yes          | No   |
| DELETE      | Remove a resource              | Yes        | Optional     | No   |
| HEAD        | Retrieve headers only          | Yes        | No           | Yes  |
| OPTIONS     | Retrieve communication options | Yes        | No           | Yes  |
| PATCH       | Apply partial modifications    | No         | Yes          | No   |
| CONNECT     | Establish network connection   | No         | Yes          | No   |
| TRACE       | Retrieve diagnostic info       | Yes        | No           | Yes  |


- **Idempotent:** An idempotent method means that making the same request multiple times has the same effect as making it once. For example, multiple GET or DELETE requests with the same parameters should have the same outcome each time. PUT and HEAD are also idempotent if the request body is the same.

- **Request Body:** Indicates whether the HTTP method can include data in the request body. Methods like POST, PUT, DELETE, and PATCH can include a request body, while methods like GET, HEAD, OPTIONS, and TRACE typically do not.

- **Safe:** A safe method is one that should not have any side effects on the server or its resources. Safe methods are generally cacheable, and they don't change the server state. GET, HEAD, and OPTIONS are considered safe methods.

Please note that while these are general characteristics of these HTTP methods, the specific behavior can vary depending on how they are implemented by a server and the application's design. Additionally, the use of these methods should adhere to the HTTP specification and best practices for web development.

**Why Sending Login Request Using POST:**

Sending login requests using the HTTP POST method, as opposed to the GET method, is a common practice for several important reasons:

1. **Security:** When you submit login credentials (such as a username and password), you want to keep this information confidential. Using a POST request sends the data in the request body, which is not visible in the URL or browser history. In contrast, GET requests append data to the URL as query parameters, making it visible in the browser's address bar and potentially exposing sensitive information.

2. **Data Length:** POST requests can handle larger amounts of data in the request body compared to GET requests, which are limited in the amount of data they can carry in the URL. Login credentials are usually sensitive and may include lengthy encrypted or hashed data, making them unsuitable for inclusion in a URL.

3. **Caching:** GET requests are often cached by web browsers, proxies, and other intermediaries. This means that if login credentials were sent via a GET request, they might be stored in browser history, cached on the user's device, or logged on intermediary servers, posing a security risk.

4. **Idempotence:** HTTP GET requests are considered idempotent, meaning they have no side effects on the server and can be safely repeated multiple times without changing the server's state. Login operations are not idempotent; they typically involve creating a new session or changing the user's state on the server. Using POST, which is not idempotent, reflects the non-idempotent nature of login requests more accurately.

5. **CSRF Protection:** POST requests can include anti-CSRF (Cross-Site Request Forgery) tokens in the request body to protect against CSRF attacks, which involve unauthorized actions being performed on behalf of an authenticated user.

Using the POST method for login requests is a security best practice because it helps protect sensitive data, prevents data from being exposed in URLs, accommodates larger data payloads, and aligns with the non-idempotent and state-changing nature of login operations. It's essential to follow secure coding practices when implementing authentication mechanisms to ensure the protection of user credentials and sensitive data.

**HTTP Methods Categorized Into Two Groups Regarding Caching:**

1. **Safe Methods:** Safe methods are HTTP methods that are considered to be safe, meaning they should not have any side effects on the server or its resources. These methods are generally cacheable by intermediaries like web browsers and proxies. Safe methods include:

    - GET: Retrieves data from a resource.
    - HEAD: Retrieves only the headers of a response (similar to GET but without the body).
    - OPTIONS: Retrieves information about the communication options for a resource.

2. **Unsafe Methods:** Unsafe methods are HTTP methods that can have side effects on the server or its resources, and they are generally not cacheable. Unsafe methods include:

    - POST: Submits data to the server to create or modify a resource.
    - PUT: Replaces a resource at a specific URL with new data.
    - DELETE: Requests the removal of a resource from the server.
    - PATCH: Applies partial modifications to a resource.

The HTTP specification defines that safe methods are generally cacheable because they don't change server state. Therefore, GET, HEAD, and OPTIONS requests are often cached by intermediaries to improve performance and reduce server load. However, caching behavior can be influenced by various factors, including HTTP headers such as "Cache-Control" and "Expires."

**Does Body Data Encrypted When Send POST Request?**

When you send data over HTTPS using a POST request, the data in the request body is encrypted. HTTPS (Hypertext Transfer Protocol Secure) is designed to provide a secure and encrypted communication channel between your web browser (or any other client) and the web server. Here's how the encryption process works:

1. **SSL/TLS Encryption:** HTTPS uses SSL (Secure Sockets Layer) or its successor, TLS (Transport Layer Security), to encrypt the data transmitted between the client (your computer) and the server. This encryption ensures that the data is protected from eavesdropping and tampering while in transit over the internet.

2. **Secure Handshake:** When you establish a connection to a website over HTTPS, your browser and the server go through a handshake process. During this process, they exchange encryption keys and negotiate the encryption parameters to establish a secure session.

3. **Request and Response Encryption:** Once the secure session is established, all data exchanged between your client and the server, including the contents of the POST request body, is encrypted before transmission. This means that the data is protected from interception by third parties during its journey from your device to the server.

4. **Decryption on the Server:** When the server receives the encrypted data, it has the decryption key to decode the data and process it. This happens on the server side, ensuring that the server can access and understand the contents of the POST request.

HTTPS ensures end-to-end encryption for data sent via POST requests. This encryption is a fundamental aspect of HTTPS, making it a secure way to transmit sensitive information such as login credentials, credit card details, or any other private data over the internet. It provides confidentiality, integrity, and authenticity for the data in transit, helping to protect users' privacy and security.