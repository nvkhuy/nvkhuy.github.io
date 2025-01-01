---
tags:
  - interview
  - principle
title: Solid Principle
author: Huy Nguyen
pubDatetime: 2023-09-18T15:57:52.737Z
slug: solid-principle
featured: false
ogImage: https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAqWCvRB4t3cAM3LhmhIs2vXTrDa05hstKaA&s
description: solid principle
---

The SOLID principles are a set of five design principles that help developers create more maintainable, flexible, and understandable software. Each principle addresses a specific aspect of software design and encourages the development of clean and modular code. Let's go through each of the SOLID principles and provide an example in Go (Golang) for each:

**1. Single Responsibility Principle (SRP):**

- A class should have only one reason to change, meaning it should have only one responsibility.
- This principle encourages separation of concerns.

Example in Go:

```go
package main

import "fmt"

type Order struct {
    ID     int
    Status string
}

// OrderRepository handles database operations for orders
type OrderRepository struct{}

func (o *OrderRepository) SaveOrder(order *Order) {
    // Save the order to the database
    fmt.Printf("Order %d saved with status %s\n", order.ID, order.Status)
}

// OrderService handles business logic related to orders
type OrderService struct {
    repo *OrderRepository
}

func (os *OrderService) ProcessOrder(order *Order) {
    // Business logic for processing orders
    order.Status = "Processed"
    os.repo.SaveOrder(order)
}

func main() {
    orderRepo := &OrderRepository{}
    orderService := &OrderService{repo: orderRepo}

    order := &Order{ID: 1, Status: "Pending"}
    orderService.ProcessOrder(order)
}
```

In this example, we have separate components (`OrderRepository` and `OrderService`) responsible for handling database operations and business logic, respectively, adhering to the Single Responsibility Principle.

**2. Open-Closed Principle (OCP):**

- Software entities (classes, modules, functions) should be open for extension but closed for modification.
- This principle encourages adding new functionality by extending existing code, rather than changing it.

Example in Go:

```go
package main

import "fmt"

type Shape interface {
    Area() float64
}

type Rectangle struct {
    Width  float64
    Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return 3.14 * c.Radius * c.Radius
}

func CalculateArea(shape Shape) {
    fmt.Printf("Area of shape is: %.2f\n", shape.Area())
}

func main() {
    rect := Rectangle{Width: 5, Height: 3}
    circle := Circle{Radius: 2}

    CalculateArea(rect)
    CalculateArea(circle)
}
```

The Open-Closed Principle is demonstrated here by defining a `Shape` interface that can be extended with new shapes (e.g., adding a `Triangle`) without modifying the existing code that calculates the area.

**3. Liskov Substitution Principle (LSP):**

- Objects of a derived class must be able to replace objects of the base class without affecting the correctness of the program.
- This principle ensures that derived classes adhere to the contract established by their base classes.

Example in Go:

```go
package main

import "fmt"

type Bird interface {
    Fly() string
}

type Sparrow struct{}

func (s Sparrow) Fly() string {
    return "Sparrow flies"
}

type Ostrich struct{}

func (o Ostrich) Fly() string {
    return "Ostrich cannot fly"
}

func MakeBirdFly(bird Bird) {
    fmt.Println(bird.Fly())
}

func main() {
    sparrow := Sparrow{}
    ostrich := Ostrich{}

    MakeBirdFly(sparrow)
    MakeBirdFly(ostrich)
}
```

Here, both `Sparrow` and `Ostrich` implement the `Bird` interface, but while `Sparrow` can fly, `Ostrich` cannot. Still, both can be used interchangeably with the `MakeBirdFly` function, adhering to the Liskov Substitution Principle.

**4. Interface Segregation Principle (ISP):**

- Clients should not be forced to depend on interfaces they do not use.
- This principle encourages creating smaller, more focused interfaces.

Example in Go:

```go
package main

import "fmt"

type Worker interface {
    Work()
}

type Eater interface {
    Eat()
}

type Robot struct{}

func (r Robot) Work() {
    fmt.Println("Robot is working")
}

func (r Robot) Eat() {
    fmt.Println("Robot does not eat")
}

type Human struct{}

func (h Human) Work() {
    fmt.Println("Human is working")
}

func (h Human) Eat() {
    fmt.Println("Human is eating")
}

func main() {
    robot := Robot{}
    human := Human{}

    var worker Worker
    var eater Eater

    worker = robot
    eater = human

    worker.Work()
    eater.Eat()
}
```

In this example, we have two interfaces, `Worker` and `Eater`, and two types, `Robot` and `Human`. Each type only implements the methods it needs, adhering to the Interface Segregation Principle.

**5. Dependency Inversion Principle (DIP):**

- High-level modules should not depend on low-level modules. Both should depend on abstractions.
- Abstractions should not depend on details. Details should depend on abstractions.
- This principle encourages the use of interfaces and abstractions to decouple high-level and low-level modules.

Example in Go:

```go
package main

import "fmt"

type Switchable interface {
    TurnOn()
    TurnOff()
}

type LightBulb struct {
    IsOn bool
}

func (lb *LightBulb) TurnOn() {
    lb.IsOn = true
    fmt.Println("Light bulb is on")
}

func (lb *LightBulb) TurnOff() {
    lb.IsOn = false
    fmt.Println("Light bulb is off")
}

type RemoteControl struct {
    Device Switchable
}

func (rc *RemoteControl) PressOnButton() {
    rc.Device.TurnOn()
}

func (rc *RemoteControl) PressOffButton() {
    rc.Device.TurnOff()
}

func main() {
    bulb := &LightBulb{}
    remote := &RemoteControl{Device: bulb}

    remote.PressOnButton()
    remote.PressOffButton()
}
```

The Dependency Inversion Principle is demonstrated here by creating an abstraction `Switchable` that allows the `RemoteControl` to work with different devices without depending on their concrete implementations. This decouples high-level and low-level modules.
