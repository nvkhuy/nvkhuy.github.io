---
tags:
  - software engineer
  - interview
title: Software Engineer Interview Questions
author: Huy Nguyen
pubDatetime: 2024-01-09T15:57:52.737Z
slug: software-engineer-interview-questions
featured: false
ogImage: https://user-images.githubusercontent.com/53733092/215771435-25408246-2309-4f8b-a781-1f3d93bdf0ec.png
description: software engineer questions got asked a lot
---

## Table of contents

Here the top questions software engineer used to be asked in the interview

## 1. What is SCRUM?

### Scrum

**Scrum** is an agile framework for project management and product development that emphasizes collaboration, flexibility, and iterative progress. Originally designed for software development, it has found widespread adoption in various industries. Scrum provides a structured yet adaptable approach to delivering valuable products and managing complex tasks. The core components of Scrum include roles, events, and artifacts.

#### Roles

- **Product Owner:** Represents the stakeholders and is responsible for prioritizing the product backlog (a list of features, enhancements, and fixes).
- **Scrum Master:** Ensures the Scrum team follows the Scrum framework and removes any impediments or obstacles that may hinder their progress.
- **Development Team:** A self-organizing, cross-functional group responsible for delivering the product increment during each sprint.

#### Events

- **Sprint:** A time-boxed iteration, usually 2-4 weeks long, where the development team works to deliver a potentially shippable product increment.
- **Sprint Planning:** At the beginning of each sprint, the team plans the work to be done during the sprint, breaking down backlog items into tasks.
- **Daily Scrum (Standup):** A short daily meeting where team members discuss progress, plan for the day, and identify any impediments.
- **Sprint Review:** At the end of the sprint, the team demonstrates the work completed and gets feedback from stakeholders.
- **Sprint Retrospective:** A reflective meeting where the team discusses what went well, what could be improved, and plans for adjustments in the next sprint.

#### Artifacts

- **Product Backlog:** An ordered list of all desired work on the project, maintained by the Product Owner.
- **Sprint Backlog:** The subset of the Product Backlog that the team commits to completing during a sprint.
- **Increment:** The sum of all completed product backlog items at the end of a sprint, representing a potentially shippable product.

#### Flow in Scrum

1. **Product Backlog Refinement:** The Product Owner continuously refines the product backlog by adding, removing, or reprioritizing items. This is an ongoing process to ensure the backlog is ready for sprint planning.

2. **Sprint Planning:** At the start of each sprint, the team and Product Owner collaborate to select items from the product backlog to include in the sprint. The team then breaks these items into tasks and creates a sprint backlog.

3. **Daily Scrum:** The team meets daily to discuss progress, address any issues, and plan for the day. The Scrum Master facilitates the meeting but doesn't control it.

4. **Sprint Execution:** The development team works on the tasks in the sprint backlog, aiming to deliver a potentially shippable product increment by the end of the sprint.

5. **Sprint Review:** At the end of the sprint, the team showcases the completed work to stakeholders, gathers feedback, and discusses any adjustments needed for future sprints.

6. **Sprint Retrospective:** The team reflects on the sprint, identifying what went well, what could be improved, and formulating a plan for implementing those improvements in the next sprint.

This iterative and incremental approach allows for regular inspection and adaptation, enabling the team to respond quickly to changing requirements and deliver high-value products.

## 2. Optimistic Locking vs Pessimistic Locking

Overview of optimistic and pessimistic locking implementations.
There are two models for `locking` data in a database:

- `Optimistic` locking, where a record is locked only when changes are committed to the database
- `Pessimistic` locking, where a record is locked while it is edited
  In both data-locking models, the lock is released after the changes are committed to the database.

#### Optimistic Locking

The optimistic locking model, also known as optimistic concurrency control, is a concurrency control method used in relational databases. It avoids record locking during updates and allows multiple users to attempt updates on the same record without informing them about concurrent updates. Validation of record changes occurs only when the record is `committed`. If one user successfully updates the record, others attempting concurrent updates are informed of a conflict.

Advantages of optimistic locking:

- Avoids the overhead of locking a record for the duration of the action.
- Provides fast updates when there are no simultaneous updates.

Useful in scenarios where:

- Useful when concurrent updates are expected to be infrequent or locking overhead is high.
- When multiple users edit a record concurrently, after one user's changes are committed, the other users' changes are rejected, and conflicts must be saved and manually merged.

#### Pessimistic Locking

The pessimistic locking model prevents simultaneous updates to records. When one user starts to update a record, a lock is placed on it, informing other users of an update in progress. Other users must wait until the first user finishes committing their changes and releases the record lock before making changes.

Advantages of pessimistic locking:

- Prevents conflicts by serializing updates.
- Updates are based on the committed record changes from the previous user.

Useful in scenarios where:

- Subsequent updates can be delayed until a previous update is completed.
- Updates occur in a short time interval.

## 3. Git and Git Flow

#### Git

**Definition:**
Git is a distributed version control system (DVCS) that allows multiple developers to collaborate on a project. It tracks changes in the source code over time and enables users to work on their own copies of a project while maintaining version history and facilitating collaboration.

**Key Concepts:**

- **Repository (Repo):** A collection of files and version history.
- **Commit:** A snapshot of changes made to the code.
- **Branch:** A separate line of development that diverges from the main codebase.
- **Merge:** Combining changes from one branch into another.
- **Pull Request (PR):** A proposed set of changes that one user wants to merge into the main branch.

#### Git Flow

**Definition:**
Git Flow is a branching model that defines a set of branching conventions and workflows for using Git. It provides a structured approach to managing feature development, releases, and hotfixes.

**Key Concepts:**

- **Master Branch:** Represents the production-ready code.
- **Develop Branch:** Integration branch where feature branches are merged for testing.
- **Feature Branch:** Branches created for developing new features.
- **Release Branch:** Prepares for a new release, allowing bug fixes without adding new features.
- **Hotfix Branch:** Addresses critical issues in the production code.

#### Trunk-Based Development

**Definition:**
Trunk-Based Development is an approach where all developers work on a single branch (usually the main or trunk branch). Feature branches are short-lived, and changes are continuously integrated into the main branch.

**Key Concepts:**

- **Main Branch:** Represents the current state of the production-ready code.
- **Feature Flags:** Used to selectively enable or disable features in the main branch.
- **Continuous Integration (CI):** Developers integrate code changes frequently, ensuring early detection of issues.

#### Feature Flags

**Definition:**
Feature Flags (or Feature Toggles) are a technique to enable or disable features at runtime. They allow developers to deploy code changes to production while keeping certain features hidden from users until they are ready to be released.

**Key Concepts:**

- **Gradual Rollout:** Features can be gradually introduced to users.
- **Experimentation:** A/B testing and gradual feature rollout for controlled experimentation.
- **Rollback:** Enables easy rollback of features by toggling the flag.

#### Summary

- **Git:** Version control system for tracking changes in code.
- **Git Flow:** Branching model for managing feature development, releases, and hotfixes.
- **Trunk-Based Development:** Approach where all developers work on a single branch for faster integration.
- **Feature Flags:** Technique to control the visibility of features, enabling gradual rollout and experimentation.

### 4. Hash Table?

A hash table is a data structure that allows you to store and retrieve values using a key. It uses a hash function to map keys to indices in an array, providing efficient access to values.

#### Time Complexity:

1. **Insertion (Addition):**

   - Average Case: O(1)
   - Worst Case: O(n) - In rare instances when there are collisions, and linear probing or chaining is used to resolve them. However, proper hash function and load factor management can keep collisions rare.

2. **Deletion:**

   - Average Case: O(1)
   - Worst Case: O(n) - Similar to insertion, worst-case scenario occurs when there are many collisions.

3. **Search (Lookup):**
   - Average Case: O(1)
   - Worst Case: O(n) - In cases of collisions, where linear probing or chaining is used.

#### Space Complexity:

1. **Space Complexity for Storage:**
   - O(n) - The space required is proportional to the number of key-value pairs stored in the hash table.

#### Note on Collisions:

- **Collision Handling:** Collisions occur when two different keys hash to the same index. Hash tables typically use techniques like separate chaining or open addressing (linear probing, quadratic probing, double hashing) to handle collisions.
- **Load Factor:** The ratio of the number of stored elements to the size of the hash table is called the load factor. A well-managed load factor helps minimize collisions and maintain efficient performance.
- **Rehashing:** When the load factor increases beyond a threshold, some hash tables automatically resize and rehash the elements to maintain a low load factor and reduce collisions.

Hash tables provide efficient average-case time complexities for basic operations, making them a widely used data structure for associative arrays and other applications where fast key-based access is required. It's crucial to choose a good hash function and manage load factors appropriately to ensure optimal performance.
