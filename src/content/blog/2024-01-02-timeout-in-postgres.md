---
tags:
  - postgres
  - database
  - optimization
title: Timeout In Postgres
author: Huy Nguyen
pubDatetime: 2023-01-02T15:57:52.737Z
slug: timeout-in-postgres
featured: false
ogImage: https://user-images.githubusercontent.com/53733092/215771435-25408246-2309-4f8b-a781-1f3d93bdf0ec.png
description: prevent long-running transactions from tying up resources
---
**1.idle_in_transaction_session_timeout** 

Determines the maximum time a session can remain idle inside a transaction before it is automatically terminated.
Helps prevent long-running transactions from tying up resources.

```sql
SET idle_in_transaction_session_timeout = 60000; -- 60 seconds
```

Concerned with the overall duration of inactivity within a transaction.

**2. statement_timeout**

Sets the maximum allowed time for the execution of individual SQL statements.
If a statement takes longer than the specified timeout, it is automatically canceled.

```sql
SET statement_timeout = 5000; -- 5 seconds
```

Focuses on limiting the execution time of individual SQL statements.

**3. lock_timeout**

Sets the maximum allowed time to wait for a lock to be acquired.
If a lock cannot be acquired within the specified timeout, the statement is canceled.

```sql
SET lock_timeout = '10s'; -- 10 seconds
```

Determines the time a statement can wait for a lock to be acquired.

**4. tcp_keepalives_idle, tcp_keepalives_interval, tcp_keepalives_count**

Configures TCP keepalive settings to detect and terminate idle connections at the TCP level.

```sql
SET tcp_keepalives_idle = 600;      -- 10 minutes
SET tcp_keepalives_interval = 60;   -- 1 minute
SET tcp_keepalives_count = 5;
```

Operates at the TCP level, detecting and terminating idle connections.

**Testing the Variables:**

To test these variables, you can perform the following steps:

**idle_in_transaction_session_timeout:**

Open a transaction and remain idle for longer than the specified timeout.
Observe that the session is terminated due to inactivity within the transaction.

**statement_timeout:**

Execute a query that takes longer than the specified timeout.
Observe that the query is automatically canceled.

**lock_timeout:**

Attempt to acquire a lock that is held by another transaction for longer than the specified timeout.
Observe that the statement attempting to acquire the lock is canceled.

**tcp_keepalives_idle**

**tcp_keepalives_interval**

**tcp_keepalives_count:**

Adjust these settings to configure TCP keepalives.
Monitor network connections and observe how idle connections are handled.
Review the impact of these settings in a controlled environment before applying them in a production setting. 
Testing should involve various scenarios to ensure that the configured timeouts meet the requirements of your application without causing disruptions.