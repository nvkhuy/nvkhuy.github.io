---
tags:
   - interview
   - principle
title: What is CAP
author: Huy Nguyen
pubDatetime: 2023-09-18T15:57:52.737Z
slug: what-is-cap
featured: false
ogImage: https://user-images.githubusercontent.com/53733092/215771435-25408246-2309-4f8b-a781-1f3d93bdf0ec.png
description: explain what is cap
---
The CAP theorem, also known as Brewer's theorem, is a fundamental concept in distributed systems that deals with the trade-offs between three key properties: Consistency, Availability, and Partition Tolerance. The CAP theorem asserts that, in a distributed system, you can only guarantee two out of these three properties at any given time. Here are the details of each property:

1. **Consistency (C):**
   - Consistency refers to the idea that all nodes in a distributed system have a consistent view of the data. In other words, if a write operation is acknowledged as successful, any subsequent read operation should return that updated value or a more recent one.
   - Strong consistency ensures that every read operation will return the most recent write's result.
   - Achieving strong consistency often involves synchronization mechanisms that can introduce latency and reduce system availability.

2. **Availability (A):**
   - Availability refers to the system's ability to respond to client requests, even when some parts of the system are experiencing failures. In an available system, every request eventually receives a response, either with the requested data or an error message.
   - High availability is crucial for systems that need to deliver uninterrupted services, even in the face of hardware failures or network issues.
   - Ensuring high availability may lead to relaxing the constraints of strong consistency in some cases.

3. **Partition Tolerance (P):**
   - Partition tolerance deals with the ability of a distributed system to continue functioning correctly, even when network partitions (communication failures) occur between nodes in the system.
   - Network partitions can lead to scenarios where some nodes in the system cannot communicate with others, causing data inconsistencies and challenges in achieving both consistency and availability.
   - Achieving partition tolerance is essential for robust distributed systems, especially in cloud-based and wide-area network environments.

Now, the CAP theorem states that you can't have all three of these properties simultaneously in a distributed system. You have to make trade-offs:

1. **CA:** You can prioritize both Consistency and Availability but may need to sacrifice Partition Tolerance. In this case, the system ensures strong consistency and high availability but may not be able to function correctly in the presence of network partitions.

2. **CP:** You can prioritize both Consistency and Partition Tolerance but may need to sacrifice Availability. In this case, the system ensures strong consistency and can tolerate network partitions, but it might experience downtime or reduced availability during network disruptions.

3. **AP:** You can prioritize both Availability and Partition Tolerance but may need to sacrifice Strong Consistency. In this case, the system ensures high availability and can tolerate network partitions, but it might provide eventually consistent data.

It's important to note that the CAP theorem is a theoretical framework that helps in understanding the trade-offs in distributed systems design. In practice, various databases and distributed systems may offer different configurations and trade-offs to meet specific use cases and requirements. Your choice of system depends on your application's needs and the specific balance you wish to strike between consistency, availability, and partition tolerance.

Let's delve into the details of why each of the mentioned databases primarily focuses on two out of the three CAP properties (Consistency, Availability, and Partition Tolerance) and provide an example for each:

1. **Firestore (part of Google Cloud Firestore):**
   - **Consistency and Partition Tolerance:** Firestore prioritizes strong consistency and partition tolerance. It ensures that when you write data, you can immediately read the most recent version (strong consistency), and it can continue to function even when network partitions occur (partition tolerance).
   - **Example:** Suppose you have a Firestore database for a real-time messaging application. When a user sends a message, they expect that their own messages are immediately visible to them and that their friends see those messages in a consistent order. Firestore achieves this strong consistency while handling network disruptions gracefully.

2. **DynamoDB (Amazon DynamoDB):**
   - **Availability and Partition Tolerance:** DynamoDB primarily focuses on high availability and partition tolerance. It ensures that read and write operations remain available even in the presence of network partitions, making it suitable for applications that require uninterrupted service.
   - **Example:** Consider a global e-commerce platform that uses DynamoDB to handle product catalog data. Even if there are network issues affecting some regions, customers can still browse and purchase products with minimal disruption because DynamoDB maintains high availability and partition tolerance.

3. **MongoDB (MongoDB Atlas - managed MongoDB service):**
   - **Consistency and Partition Tolerance or Availability and Partition Tolerance:** MongoDB offers tunable consistency, allowing you to prioritize either consistency or availability based on your configuration.
   - **Example for Consistency and Partition Tolerance:** In a financial application, MongoDB can be configured for strong consistency to ensure that transactions are recorded reliably and consistently, even during network disruptions.
   - **Example for Availability and Partition Tolerance:** In a content delivery platform, MongoDB can be configured for high availability and partition tolerance, ensuring that content remains accessible even during network partitions. However, it may allow for eventual consistency in certain scenarios to maintain availability.

4. **Redis (in-memory data store):**
   - **Availability and Partition Tolerance:** Redis primarily focuses on high availability and partition tolerance while sacrificing strong consistency. It excels at providing low-latency, high-throughput access to data.
   - **Example:** In a caching layer for a web application, Redis can be used to store frequently accessed data. During network disruptions or high traffic, Redis continues to serve cached data, ensuring availability. However, it may not guarantee strong consistency if updates are made to the data source.

Each database's primary focus on specific CAP properties aligns with its intended use cases and design philosophy. When selecting a database for your application, it's crucial to consider the trade-offs and select the one that best matches your requirements in terms of consistency, availability, and partition tolerance. Additionally, the specific configurations and features of each database can influence the trade-offs you make in practice.