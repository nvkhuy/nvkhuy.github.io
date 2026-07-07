---
tags:
  - principle
  - software-design
title: Dependency Injection vs Dependency Inversion
author: Huy Nguyen
pubDatetime: 2023-09-25T15:57:52.737Z
slug: dependency-injection-vs-dependency-inversion
featured: false
ogImage: https://toidicodedao.com/wp-content/uploads/2015/09/ioc-and-mapper-in-c-1-638.jpg
description: A practical explanation of the difference between dependency injection and the dependency inversion principle.
---

## Table of contents

Dependency Injection and Dependency Inversion are related, but they are not the same thing.

This topic is often explained badly because both start with the letters `DI`, and people blur together:

- a **design principle**
- a **wiring technique**

That leads to wrong conclusions such as:

- "Dependency injection is the same as SOLID's D"
- "Using a DI container means you applied dependency inversion"
- "Passing interfaces everywhere automatically improves design"

None of those statements are reliably true.

## The Short Version

Use this mental model:

- `Dependency Inversion Principle (DIP)` is **about who depends on whom**
- `Dependency Injection (DI)` is **about how an object gets the dependencies it needs**

One is an architectural rule.
The other is a construction technique.

Dependency injection can help you implement dependency inversion, but it does not guarantee it.

## Dependency Inversion Principle

The Dependency Inversion Principle is the `D` in SOLID.

The classic statement is:

1. High-level modules should not depend on low-level modules. Both should depend on abstractions.
2. Abstractions should not depend on details. Details should depend on abstractions.

That sounds abstract, so make it concrete.

Suppose you have business logic that sends a welcome email after a user signs up.

If your business service directly creates an SMTP client, then the policy of "send a welcome email" is tightly coupled to one delivery mechanism.

That is the wrong direction of dependency.

The business rule is the important part. The SMTP client is an implementation detail.

With dependency inversion, the business layer depends on an abstraction such as `EmailSender`, and the SMTP implementation depends on that abstraction by implementing it.

### What DIP is really trying to protect

It protects your core logic from implementation details.

That means:

- business rules should not know how infrastructure is implemented
- application policy should not be tightly bound to frameworks, databases, or external services
- changing a low-level detail should not force a rewrite of high-level logic

This is the heart of the principle.

## Dependency Injection

Dependency Injection is a way of supplying collaborators from the outside instead of constructing them internally.

Instead of this:

```go
service := UserService{
    sender: NewSMTPClient(...),
}
```

you do something like this:

```go
service := UserService{
    sender: smtpSender,
}
```

The service receives what it needs. It does not create it itself.

Common forms of dependency injection are:

- constructor injection
- function parameter injection
- method injection
- field injection

Constructor injection is usually the clearest default because it makes required dependencies explicit.

## The Core Difference

The difference is easiest to see like this:

- Dependency Inversion asks: should this service depend on a concrete implementation or an abstraction?
- Dependency Injection asks: once we decide the dependency, how do we provide it?

You can use injection without inversion.

For example, this uses dependency injection:

```go
type UserService struct {
    db *sql.DB
}

func NewUserService(db *sql.DB) UserService {
    return UserService{db: db}
}
```

The dependency is injected from the outside, so yes, this is DI.

But the service still depends directly on a concrete database type. That may be totally fine in many codebases, but it is not a strong example of dependency inversion.

Now compare that with this:

```go
type UserStore interface {
    CreateUser(ctx context.Context, user User) error
}

type UserService struct {
    store UserStore
}

func NewUserService(store UserStore) UserService {
    return UserService{store: store}
}
```

Now the service depends on an abstraction and receives that abstraction from the outside.

That uses both:

- dependency inversion
- dependency injection

## A Bad Example

Here is a design that violates dependency inversion:

```go
type SMTPClient struct{}

func (c SMTPClient) Send(to, body string) error {
    return nil
}

type UserService struct{}

func (s UserService) Register(email string) error {
    client := SMTPClient{}
    return client.Send(email, "welcome")
}
```

Problems:

- `UserService` creates its own dependency
- `UserService` is coupled to one concrete delivery mechanism
- testing requires more work because the behavior is hardwired
- infrastructure details leak into the business use case

The high-level module depends directly on the low-level module.

## A Better Example

Now invert the dependency and inject it:

```go
package main

import "context"

type EmailSender interface {
    Send(ctx context.Context, to, body string) error
}

type UserService struct {
    sender EmailSender
}

func NewUserService(sender EmailSender) UserService {
    return UserService{sender: sender}
}

func (s UserService) Register(ctx context.Context, email string) error {
    // business logic here
    return s.sender.Send(ctx, email, "welcome")
}

type SMTPSender struct{}

func (s SMTPSender) Send(ctx context.Context, to, body string) error {
    return nil
}
```

What improved:

- the business service depends on `EmailSender`, not on SMTP
- the SMTP implementation is now a replaceable detail
- tests can supply a fake sender
- wiring moves to the composition root, usually `main`

## Why This Matters in Practice

The real value is not academic purity. It is changeability.

Today you may send email through SMTP.
Tomorrow you may send through SES, SendGrid, or a background job queue.

If the business service is coupled directly to SMTP, the change spreads through the wrong layer.
If the service depends on an abstraction, the change is localized to the adapter and wiring.

That is the payoff.

## Dependency Injection Does Not Automatically Mean Good Design

A lot of teams overcorrect and inject everything.

That creates a different failure mode:

- too many interfaces with no real variation
- abstractions defined before there is a real need
- code that is harder to follow because every simple thing has three layers

Good design is not "always use interfaces."
Good design is "separate policy from detail where the boundary is meaningful."

For example, in Go it is often perfectly fine for a repository to depend directly on `*sql.DB`.
You do not need an interface around everything.
The important boundary is usually where business logic should be protected from infrastructure choices.

## A Better Rule for Go

In Go, a practical rule is:

- define interfaces close to the consumer
- keep interfaces small
- do not introduce abstractions until they help decouple a meaningful boundary

This is usually better than creating a giant "service layer interface" for every type on day one.

For example, if `UserService` only needs `CreateUser`, then this:

```go
type UserStore interface {
    CreateUser(ctx context.Context, user User) error
}
```

is better than exposing a huge storage abstraction with methods the service does not actually need.

## Constructor Injection vs DI Containers

Dependency injection does not require a framework or container.

In Go, explicit wiring in `main` is often the best choice:

```go
func main() {
    store := PostgresUserStore{db: db}
    sender := SMTPSender{}
    service := NewUserService(sender)

    _ = store
    _ = service
}
```

This keeps object construction visible and debuggable.

DI containers can help in very large systems, but they also hide wiring and can make control flow harder to trace. Use them when the complexity is justified, not by default.

## Common Interview Answer

If someone asks, "What is the difference between dependency injection and dependency inversion?", a strong short answer is:

> Dependency inversion is a design principle that says high-level modules should depend on abstractions, not concrete details. Dependency injection is a technique for providing those dependencies from the outside. Injection can help implement inversion, but they are not the same thing.

That answer is short, correct, and defensible.

## Closing View

Dependency Inversion is about architecture.
Dependency Injection is about wiring.

Use dependency inversion when you need to protect important business logic from infrastructure details.
Use dependency injection to make those dependencies explicit and replaceable.

If you remember only one line, remember this:

**DIP changes the direction of dependency. DI changes the way dependencies are supplied.**
