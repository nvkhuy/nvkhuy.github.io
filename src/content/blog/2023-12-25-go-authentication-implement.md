---
tags:
  - go
  - example
title: Go Authentication Implementation
author: Huy Nguyen
pubDatetime: 2023-12-25T15:57:52.737Z
slug: go-authentication-implementation
featured: false
ogImage: https://preview.redd.it/q75e2phwyzs71.png?width=640&crop=smart&auto=webp&s=be75e0a64ca115aa55876b93f143fe402955da25
description: detailed example of go authentication
---

```go
package main

import (
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
	"time"
)

// User struct represents a user in the system
type User struct {
	ID       int
	Username string
	Password string
}

var users = make(map[string]User) // Simulate a simple in-memory database

// Secret key for signing JWTs (should be kept secret)
var jwtSecret = []byte("your_jwt_secret")

// JWT claims structure
type Claims struct {
	UserID int `json:"user_id"`
	jwt.StandardClaims
}

func signup(username, password string) error {
	// Check if the username already exists
	if _, exists := users[username]; exists {
		return fmt.Errorf("username already exists")
	}

	// Hash the password before saving it
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	// Create a new user
	userID := len(users) + 1
	newUser := User{
		ID:       userID,
		Username: username,
		Password: string(hashedPassword),
	}

	// Save the user in the database
	users[username] = newUser
	return nil
}

func login(username, password string) (string, string, error) {
	// Retrieve the user from the database
	user, exists := users[username]
	if !exists {
		return "", "", fmt.Errorf("user not found")
	}

	// Compare the hashed password with the provided password
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", "", fmt.Errorf("invalid password")
	}

	// Generate JWTs
	accessToken, err := generateAccessToken(user.ID)
	if err != nil {
		return "", "", err
	}

	refreshToken, err := generateRefreshToken(user.ID)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func resetPassword(username, newPassword string) error {
	// Retrieve the user from the database
	user, exists := users[username]
	if !exists {
		return fmt.Errorf("user not found")
	}

	// Hash the new password before updating
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Update the user's password
	user.Password = string(hashedPassword)
	users[username] = user

	return nil
}

func changePassword(userID int, currentPassword, newPassword string) error {
	// Retrieve the user from the database
	user, exists := getUserByID(userID)
	if !exists {
		return fmt.Errorf("user not found")
	}

	// Compare the current hashed password with the provided current password
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(currentPassword))
	if err != nil {
		return fmt.Errorf("invalid current password")
	}

	// Hash the new password before updating
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Update the user's password
	user.Password = string(hashedPassword)
	users[user.Username] = user

	return nil
}

func getUserByID(userID int) (User, bool) {
	for _, user := range users {
		if user.ID == userID {
			return user, true
		}
	}
	return User{}, false
}

func generateAccessToken(userID int) (string, error) {
	// Create the JWT claims
	claims := Claims{
		UserID: userID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * 1).Unix(), // Access token expires in 1 hour
			IssuedAt:  time.Now().Unix(),
		},
	}

	// Create the access token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	accessToken, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return accessToken, nil
}

func generateRefreshToken(userID int) (string, error) {
	// Create the JWT claims
	claims := Claims{
		UserID: userID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * 24 * 7).Unix(), // Refresh token expires in 7 days
			IssuedAt:  time.Now().Unix(),
		},
	}

	// Create the refresh token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	refreshToken, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return refreshToken, nil
}

func validateAccessToken(accessToken string) (int, error) {
	// Parse the token
	token, err := jwt.ParseWithClaims(accessToken, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return 0, err
	}

	// Verify the token
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return 0, fmt.Errorf("invalid access token")
	}

	return claims.UserID, nil
}

func refreshAccessToken(refreshToken string) (string, error) {
	// Parse the refresh token
	token, err := jwt.ParseWithClaims(refreshToken, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return "", err
	}

	// Verify the refresh token
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return "", fmt.Errorf("invalid refresh token")
	}

	// Generate a new access token
	newAccessToken, err := generateAccessToken(claims.UserID)
	if err != nil {
		return "", err
	}

	return newAccessToken, nil
}

func main() {
	// Sign up a new user
	err := signup("john_doe", "password123")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	// Login and get tokens
	accessToken, refreshToken, err := login("john_doe", "password123")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	// Simulate token validation (for demonstration purposes)
	userID, err := validateAccessToken(accessToken)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	fmt.Printf("User ID: %d\n", userID)

	// Refresh access token
	newAccessToken, err := refreshAccessToken(refreshToken)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	// Simulate token validation for the new access token (for demonstration purposes)
	userIDWithNewToken, err := validateAccessToken(newAccessToken)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	fmt.Printf("User ID with new access token: %d\n", userIDWithNewToken)

	// Reset password
	err = resetPassword("john_doe", "newpassword456")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	// Change password
	err = changePassword(userID, "newpassword456", "updatedpassword789")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	// Validate access token again after changing password
	userIDAfterChange, err := validateAccessToken(accessToken)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	fmt.Printf("User ID after password change: %d\n", userIDAfterChange)
}

```

This Go code provides a simplified implementation of user authentication and authorization using JSON Web Tokens (JWT) in Golang. Let's break down the code step by step:

User Struct and Database Setup:

```go
type User struct {
	ID       int
	Username string
	Password string
}
```

Defines a User struct to represent a user in the system with attributes such as ID, username, and password.

```go
var users = make(map[string]User)
```

Creates an in-memory map (users) to simulate a simple database where user data is stored.

```go
var jwtSecret = []byte("your_jwt_secret")
```

Defines a secret key used for signing and verifying JWTs. In a real-world scenario, this should be kept secure and not hardcoded in the code.
JWT Claims Structure:

```go
type Claims struct {
	UserID int `json:"user_id"`
	jwt.StandardClaims
}
```

Defines a Claims struct to represent the claims included in JWTs. In this case, it includes a UserID field and inherits from jwt.StandardClaims for standard JWT claims.
Signup Function:

```go
func signup(username, password string) error {
    // ...
}
```

Implements user signup by checking if the username already exists, hashing the password, creating a new user, and saving it in the simulated database.
Login Function:

```go
func login(username, password string) (string, string, error) {
    // ...
}
```

Handles user login by retrieving the user from the database, comparing the hashed password, and generating JWTs (access token and refresh token) if login is successful.
Reset Password Function:

```go
func resetPassword(username, newPassword string) error {
    // ...
}
```

Allows users to reset their password by retrieving the user from the database and updating the hashed password.
Change Password Function:

```go
func changePassword(userID int, currentPassword, newPassword string) error {
    // ...
}
```

Enables users to change their password by validating the current password, hashing the new password, and updating the user's password in the database.
GetUserByID Function:

```go
func getUserByID(userID int) (User, bool) {
    // ...
}
```

Retrieves a user from the database based on their ID.
Generate Access Token Function:

```go
func generateAccessToken(userID int) (string, error) {
    // ...
}
```

Creates a new access token with user-specific claims and an expiration time.
Generate Refresh Token Function:

```go
func generateRefreshToken(userID int) (string, error) {
    // ...
}
```

Generates a refresh token with user-specific claims and a longer expiration time.
Validate Access Token Function:

```go
func validateAccessToken(accessToken string) (int, error) {
    // ...
}
```

Parses and validates an access token, returning the user ID if successful.
Refresh Access Token Function:

```go
func refreshAccessToken(refreshToken string) (string, error) {
    // ...
}
```

Parses and validates a refresh token, then generates a new access token if successful.
Main Function:

```go
func main() {
    // ...
}
```

Demonstrates the usage of the implemented functions, including user signup, login, password reset, password change, and access token refresh.
This code provides a foundation for implementing user authentication and authorization using JWTs in a Go application. It's important to note that in a production environment, additional security measures, error handling, and database integration would be necessary. The secret key should be securely managed, and user passwords should be handled with care, potentially using more advanced hashing techniques.
