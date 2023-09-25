---
layout: post
tags: principle
title: Dependency Injection vs Dependency Inversion
permalink: /dependency-injection-vs-dependency-inversion
---

Dependency Injection (DI) and Dependency Inversion (DI) are two related but distinct concepts in software design and architecture, often used together to achieve loose coupling and improve the maintainability and flexibility of software systems. Let's explore each concept individually:

1. Dependency Injection (DI):
   - Dependency Injection is a design pattern and technique used in object-oriented programming to manage dependencies between classes and components.
   - In DI, dependencies are "injected" into a class rather than the class creating its own dependencies. This injection can occur through constructor injection, method injection, or property injection.
   - The main goal of DI is to decouple the high-level modules (e.g., classes or components) from their low-level dependencies (e.g., other classes or services). This makes the code more modular, testable, and flexible.
   - DI promotes the use of interfaces or abstract classes to define contracts between components, allowing for easy substitution of implementations, which is essential for achieving flexibility and maintainability.

2. Dependency Inversion (DI):
   - Dependency Inversion is one of the SOLID principles of object-oriented design, specifically the "D" in SOLID, which stands for the Dependency Inversion Principle (DIP).
   - The Dependency Inversion Principle states that high-level modules (e.g., classes or components) should not depend on low-level modules. Both should depend on abstractions (interfaces or abstract classes).
   - In other words, it encourages the inversion of the traditional dependency hierarchy. Instead of concrete classes depending on abstractions, it encourages abstractions (interfaces) to depend on other abstractions.
   - By adhering to the Dependency Inversion Principle, you create a level of indirection that allows for greater flexibility and extensibility in your codebase. It also promotes the use of DI as a means to achieve this inversion.

Dependency Injection is a technique used to implement the Dependency Inversion Principle. While Dependency Injection focuses on how to inject dependencies into classes or components, Dependency Inversion focuses on the high-level design principle that encourages the use of abstractions and the inversion of dependencies. When used together, these concepts help create more modular, maintainable, and flexible software systems.

## Dependency Injection in Go:

Implement Dependency Injection by passing dependencies (usually as interfaces) as parameters to functions or constructors. Here's a simple example of Dependency Injection:

```go
package main

import (
    "fmt"
)

type Database interface {
    Query(query string) string
}

type MySQLDatabase struct{}

func (db MySQLDatabase) Query(query string) string {
    return "Result from MySQL: " + query
}

type PostgreSQLDatabase struct{}

func (db PostgreSQLDatabase) Query(query string) string {
    return "Result from PostgreSQL: " + query
}

func ReportGenerator(db Database, reportName string) string {
    query := "SELECT * FROM " + reportName
    result := db.Query(query)
    return "Generating report with: " + result
}

func main() {
    mysqlDB := MySQLDatabase{}
    postgresDB := PostgreSQLDatabase{}

    report1 := ReportGenerator(mysqlDB, "sales_report")
    report2 := ReportGenerator(postgresDB, "financial_report")

    fmt.Println(report1)
    fmt.Println(report2)
}
```

In this example:

1. We define a `Database` interface representing a database connection with a `Query` method.
2. We create two concrete implementations of the `Database` interface: `MySQLDatabase` and `PostgreSQLDatabase`.
3. The `ReportGenerator` function takes a `Database` interface as a parameter and generates a report using the provided database.
4. In the `main` function, we create instances of the concrete database implementations (MySQL and PostgreSQL) and pass them as dependencies to the `ReportGenerator` function.

This demonstrates the concept of Dependency Injection, as the `ReportGenerator` function does not create its own database instance but relies on the caller to provide the appropriate database implementation. This allows for flexibility and easy testing since you can easily swap out different database implementations without modifying the `ReportGenerator` function.

## Dependency Inversion in Go:

Dependency Inversion in Go can be implemented by defining interfaces (abstractions) that high-level modules depend on, and then providing concrete implementations for these interfaces in low-level modules. Here's an example to illustrate Dependency Inversion in Go:

```go
package main

import (
	"fmt"
)

type DataStore interface {
	Save(data string)
}

type FileStorage struct{}

func (fs FileStorage) Save(data string) {
	fmt.Println("Saving to file:", data)
}

type DatabaseStorage struct{}

func (ds DatabaseStorage) Save(data string) {
	fmt.Println("Saving to database:", data)
}

type DataProcessor struct {
	Storage DataStore
}

func (dp DataProcessor) ProcessAndSave(data string) {
	fmt.Println("Processing data...")
	dp.Storage.Save(data)
}

func main() {
	fileStorage := FileStorage{}
	dbStorage := DatabaseStorage{}

	fileDataProcessor := DataProcessor{Storage: fileStorage}
	dbDataProcessor := DataProcessor{Storage: dbStorage}

	dataToSave := "Some important data"

	fileDataProcessor.ProcessAndSave(dataToSave)
	dbDataProcessor.ProcessAndSave(dataToSave)
}
```

In this example:

1. We define the `DataStore` interface representing a data storage mechanism with a `Save` method.
2. We provide two concrete implementations: `FileStorage` and `DatabaseStorage`, each implementing the `DataStore` interface.
3. The `DataProcessor` struct is a high-level module that depends on the `DataStore` interface. It has a `ProcessAndSave` method that uses the `DataStore` to save data.
4. In the `main` function, we create instances of the concrete implementations (`FileStorage` and `DatabaseStorage`) and inject them into `DataProcessor` instances. This is where Dependency Inversion is demonstrated: high-level `DataProcessor` depends on the abstract `DataStore` interface, not on concrete implementations.

This structure allows you to easily switch between different storage implementations (e.g., file storage or database storage) without modifying the `DataProcessor` code, adhering to the Dependency Inversion Principle.