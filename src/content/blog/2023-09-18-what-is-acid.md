---
tags:
   - interview
   - principle
title: What is ACID
author: Huy Nguyen
pubDatetime: 2023-09-18T15:57:52.737Z
slug: what-is-acid
featured: false
ogImage: https://user-images.githubusercontent.com/53733092/215771435-25408246-2309-4f8b-a781-1f3d93bdf0ec.png
description: explain what is acid and usage
---
## Table of contents

ACID is an acronym that represents a set of properties or characteristics that ensure reliable and predictable database transactions. These properties are essential for maintaining the integrity and consistency of data within a database. The ACID properties stand for:

1. **Atomicity (A):**
   - Atomicity ensures that a transaction is treated as a single, indivisible unit of work. Either all the changes made in a transaction are applied, or none of them are. If any part of the transaction fails, the entire transaction is rolled back, leaving the database in its original state.
   - Example: Consider a banking application where a user transfers money from one account to another. Atomicity ensures that if the withdrawal from one account succeeds but the deposit to the other fails (e.g., due to an error), the entire transaction is rolled back, and the user's balance remains unchanged.

2. **Consistency (C):**
   - Consistency ensures that a transaction takes the database from one consistent state to another consistent state. It enforces data integrity rules, constraints, and relationships defined in the database schema. If a transaction violates these rules, it is rolled back.
   - Example: In a database that tracks orders and inventory, consistency ensures that an order cannot be created if there is insufficient inventory for the requested items. If an order violates this constraint, the transaction is rolled back, and the database remains in a consistent state.

3. **Isolation (I):**
   - Isolation ensures that concurrent transactions do not interfere with each other. Each transaction should appear to be executed in isolation, as if it were the only transaction in the system. This prevents issues like race conditions and ensures that the final state of the database is consistent.
   - Example: In a multi-user system, two users simultaneously updating the same record should not result in one user's changes overwriting the other's. Isolation mechanisms, such as locks or transaction isolation levels, prevent such interference.

4. **Durability (D):**
   - Durability guarantees that once a transaction is committed, its changes are permanent and will survive any subsequent system failures, such as power outages or crashes. The data is stored in a non-volatile storage medium like disk or solid-state storage to ensure durability.
   - Example: If a user submits an order and receives a confirmation, the order data should not be lost even if the database server crashes immediately after the confirmation is sent. Durability ensures that the order data is not lost during such failures.

These ACID properties are crucial for ensuring the reliability and integrity of data in a database management system, especially in scenarios where transactions involve critical and sensitive data. Database systems like traditional relational databases (e.g., PostgreSQL, Oracle, SQL Server) are known for adhering to the ACID properties. However, it's important to note that strict adherence to ACID can sometimes impact system performance, which has led to the emergence of databases that offer a different set of trade-offs known as "BASE" (Basically Available, Soft state, Eventually consistent).

ACID (Atomicity, Consistency, Isolation, Durability) is a set of properties that ensure reliable and predictable database transactions. While ACID provides strong guarantees for data integrity and consistency, it also comes with its own set of advantages and disadvantages:

**Advantages of ACID:**

1. **Data Integrity:** ACID transactions ensure that data remains in a consistent and reliable state, even in the face of system failures or errors. This is crucial for applications that handle critical or sensitive data.

2. **Consistency:** ACID transactions enforce data integrity rules, constraints, and relationships defined in the database schema. This consistency ensures that the database remains in a valid state at all times.

3. **Isolation:** ACID provides isolation mechanisms that prevent concurrent transactions from interfering with each other, reducing the risk of data corruption and race conditions.

4. **Durability:** ACID guarantees that once a transaction is committed, its changes are permanent and will survive system failures. This ensures that data remains available even after unexpected crashes.

5. **Predictability:** Developers can rely on the predictability and reliability of ACID transactions when designing and implementing applications. This makes it easier to reason about how data changes and ensure the correctness of the application's logic.

**Disadvantages of ACID:**

1. **Performance Overhead:** ACID transactions often come with a performance overhead due to the need for locking, logging, and ensuring strong consistency. This overhead can impact the throughput and response times of database operations, especially in high-concurrency scenarios.

2. **Complexity:** Implementing and managing ACID transactions can be complex and require careful design and planning. Handling transactions, locking, and isolation levels can be challenging in distributed systems.

3. **Scalability Challenges:** ACID properties can make it difficult to scale horizontally because maintaining strong consistency across multiple distributed nodes can be complex and can limit scalability.

4. **Inflexibility:** ACID's strict requirements may not be suitable for all types of applications. In some cases, relaxed consistency models (e.g., BASE) may be more appropriate, especially for applications where high availability and partition tolerance are paramount.

5. **Resource Utilization:** ACID transactions can tie up system resources, such as locks and memory, for extended periods, potentially leading to resource contention and bottlenecks.

In summary, ACID transactions are well-suited for applications where data integrity, consistency, and predictability are critical, such as financial systems, healthcare applications, and other mission-critical systems. However, they may introduce performance and scalability challenges in large, high-concurrency systems. Choosing whether to use ACID or a more relaxed consistency model (e.g., BASE) depends on the specific requirements and trade-offs of your application.