---
layout: post
tags: go
title: Go Design Patterns
permalink: /go-design-patterns
---

# **Iterator Pattern**

The iterator pattern is a behavioral design pattern that provides a way to access the elements of a collection sequentially without exposing its underlying representation. In Go, you can implement the iterator pattern using a combination of interfaces and custom types. Here's an example of how to implement the iterator pattern in Go:

```go
package main

import "fmt"

type Iterator interface {
	HasNext() bool
	Next() interface{}
}

type Aggregate interface {
	CreateIterator() Iterator
}

type ConcreteAggregate struct {
	data []interface{}
}

func (ca *ConcreteAggregate) CreateIterator() Iterator {
	return &ConcreteIterator{aggregate: ca}
}

type ConcreteIterator struct {
	aggregate *ConcreteAggregate
	index     int
}

func (ci *ConcreteIterator) HasNext() bool {
	return ci.index < len(ci.aggregate.data)
}

func (ci *ConcreteIterator) Next() interface{} {
	if ci.HasNext() {
		item := ci.aggregate.data[ci.index]
		ci.index++
		return item
	}
	return nil
}

func main() {
	aggregate := &ConcreteAggregate{
		data: []interface{}{"Item 1", "Item 2", "Item 3", "Item 4"},
	}

	iterator := aggregate.CreateIterator()

	for iterator.HasNext() {
		item := iterator.Next()
		fmt.Println(item)
	}
}
```

In this example:

- We define an `Iterator` interface with two methods: `HasNext` to check if there are more elements to iterate and `Next` to retrieve the next element.

- We define an `Aggregate` interface with one method: `CreateIterator`, which creates and returns an iterator.

- We create a `ConcreteAggregate` struct that holds the actual collection data and implements the `Aggregate` interface by providing a method to create an iterator.

- We create a `ConcreteIterator` struct that implements the `Iterator` interface and keeps track of the current position within the collection.

- In the `main` function, we create a `ConcreteAggregate` instance, add some elements to it, and then create an iterator for it. We iterate through the elements using the iterator, demonstrating how the iterator pattern allows you to access elements sequentially without exposing the underlying representation of the collection.

# **Strategy Pattern**

The strategy pattern is a behavioral design pattern that defines a family of algorithms, encapsulates each one, and makes them interchangeable. It allows you to select an algorithm from a family of algorithms at runtime. In Go, you can implement the strategy pattern using interfaces and different concrete implementations. Here's an example of the strategy pattern in Go:

```go
package main

import "fmt"

type PaymentStrategy interface {
	Pay(amount float64)
}

type CreditCardPayment struct{}

func (c *CreditCardPayment) Pay(amount float64) {
	fmt.Printf("Paid %.2f via credit card\n", amount)
}

type PayPalPayment struct{}

func (p *PayPalPayment) Pay(amount float64) {
	fmt.Printf("Paid %.2f via PayPal\n", amount)
}

type ShoppingCart struct {
	paymentStrategy PaymentStrategy
}

func NewShoppingCart(paymentStrategy PaymentStrategy) *ShoppingCart {
	return &ShoppingCart{
		paymentStrategy: paymentStrategy,
	}
}

func (cart *ShoppingCart) Checkout(amount float64) {
	cart.paymentStrategy.Pay(amount)
}

func main() {
	creditCardCart := NewShoppingCart(&CreditCardPayment{})
	creditCardCart.Checkout(100.00)

	payPalCart := NewShoppingCart(&PayPalPayment{})
	payPalCart.Checkout(50.00)
}
```

In this example:

- We define a `PaymentStrategy` interface with a `Pay` method that represents the common method for all payment strategies.

- We create two concrete payment strategy implementations: `CreditCardPayment` and `PayPalPayment`, each implementing the `Pay` method differently.

- The `ShoppingCart` struct represents a shopping cart that uses a payment strategy. It has a `Checkout` method that takes an amount and processes the payment using the selected payment strategy.

- In the `main` function, we create two shopping carts, one with a credit card payment strategy and another with a PayPal payment strategy. We then call the `Checkout` method on each shopping cart, demonstrating how you can switch between different payment strategies at runtime.

This example shows how to implement the strategy pattern in Go to encapsulate payment algorithms and make them interchangeable without changing the client code.

## **Factory Pattern**

The factory pattern is a creational design pattern that provides an interface for creating objects in a super class, but allows subclasses to alter the type of objects that will be created. In Go, you can implement the factory pattern using functions and interfaces. Here's an example of the factory pattern in Go:

```go
package main

import "fmt"

type Shape interface {
	Area() float64
}

type Circle struct {
	Radius float64
}

func (c *Circle) Area() float64 {
	return 3.14 * c.Radius * c.Radius
}

type Rectangle struct {
	Width  float64
	Height float64
}

func (r *Rectangle) Area() float64 {
	return r.Width * r.Height
}

type ShapeFactory interface {
	CreateShape() Shape
}

type CircleFactory struct{}

func (cf *CircleFactory) CreateShape() Shape {
	return &Circle{Radius: 1.0}
}

type RectangleFactory struct{}

func (rf *RectangleFactory) CreateShape() Shape {
	return &Rectangle{Width: 2.0, Height: 3.0}
}

func main() {
	circleFactory := &CircleFactory{}
	circle := circleFactory.CreateShape()
	fmt.Printf("Circle Area: %.2f\n", circle.Area())

	rectangleFactory := &RectangleFactory{}
	rectangle := rectangleFactory.CreateShape()
	fmt.Printf("Rectangle Area: %.2f\n", rectangle.Area())
}
```

In this example:

- We define a `Shape` interface that represents common methods for all shapes, and two concrete shapes, `Circle` and `Rectangle`, each implementing the `Area` method differently.

- We define a `ShapeFactory` interface that declares a method for creating shapes, and two concrete factories, `CircleFactory` and `RectangleFactory`, each implementing the `CreateShape` method to create specific shapes.

- In the `main` function, we create instances of `Circle` and `Rectangle` using their respective factories. This demonstrates how the factory pattern allows you to create objects without specifying their concrete types, making it easier to change or extend the types of objects created by the factory without modifying the client code.

The factory pattern is particularly useful when you need to create objects with complex initialization logic or when you want to decouple the client code from the concrete types being created.