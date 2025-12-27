---
tags:
  - csharp
  - cheatsheet
title: C# Data Structures Cheat Sheet
author: Huy Nguyen
pubDatetime: 2025-12-26T11:20:00.737Z
slug: csharp-data-structure-cheat-shee
featured: false
ogImage: https://i.redd.it/wjtbbvepokd91.png
description: Common manipulation patterns.
---

## Table of contents

---

## ARRAY (`T[]`)

### Access

```csharp
int[] a = { 10, 20, 30 };
var x = a[1];
```

**Input:** `[10,20,30]`
**Output:** `20`

---

### Update

```csharp
a[0] = 99;
```

**Output:** `[99,20,30]`

---

## LIST (`List<T>`)

### Add / Remove

```csharp
var list = new List<int> { 1, 2, 3 };
list.Add(4);
list.Remove(2);
```

**Output:** `[1,3,4]`

---

### Insert

```csharp
list.Insert(1, 99);
```

**Output:** `[1,99,3,4]`

---

### Sort

```csharp
list.Sort();
```

**Output:** `[1,3,4,99]`

---

## LINKEDLIST (`LinkedList<T>`)

```csharp
var ll = new LinkedList<int>();
ll.AddLast(1);
ll.AddLast(2);
ll.AddFirst(0);
```

**Output:** `0 → 1 → 2`

---

## DICTIONARY (`Dictionary<TKey,TValue>`)

### Create / Get

```csharp
var dict = new Dictionary<string, int> {
    ["a"] = 1,
    ["b"] = 2
};

var v = dict["a"];
```

**Output:** `1`

---

### Safe Get

```csharp
var v = dict.GetValueOrDefault("c", 0);
```

**Output:** `0`

---

### Update or Insert

```csharp
dict["a"] = dict.GetValueOrDefault("a") + 1;
```

**Output:** `{ a:2, b:2 }`

---

## SORTEDDICTIONARY

```csharp
var sd = new SortedDictionary<int, string>();
sd[2] = "B";
sd[1] = "A";
```

**Output order:** `1:A, 2:B`

---

## HASHSET (`HashSet<T>`)

### Deduplicate

```csharp
var set = new HashSet<int> { 1, 2, 2, 3 };
```

**Output:** `{1,2,3}`

---

### Contains

```csharp
set.Contains(2);
```

**Output:** `true`

---

## SORTEDSET

```csharp
var ss = new SortedSet<int> { 3, 1, 2 };
```

**Output:** `{1,2,3}`

---

## STACK (`Stack<T>`)

```csharp
var stack = new Stack<int>();
stack.Push(1);
stack.Push(2);
var x = stack.Pop();
```

**Output:** `2`

---

## QUEUE (`Queue<T>`)

```csharp
var q = new Queue<int>();
q.Enqueue(1);
q.Enqueue(2);
var x = q.Dequeue();
```

**Output:** `1`

---

## PRIORITYQUEUE (.NET 6+)

```csharp
var pq = new PriorityQueue<string, int>();
pq.Enqueue("low", 3);
pq.Enqueue("high", 1);
pq.Dequeue();
```

**Output:** `"high"`

---

## TUPLE / VALUETUPLE

```csharp
(string name, int age) t = ("Alice", 30);
```

**Output:** `(Alice,30)`

---

### Deconstruct

```csharp
var (name, age) = t;
```

**Output:** `name="Alice", age=30`

---

## RECORD (IMMUTABLE)

```csharp
record User(string Name, int Age);

var u1 = new User("A", 20);
var u2 = u1 with { Age = 21 };
```

**Output:** `User { Name=A, Age=21 }`

---

## ARRAY → DICTIONARY (INDEXING)

```csharp
var users = new[] {
    new { Id = 1, Name = "A" },
    new { Id = 2, Name = "B" }
};

var indexed = users.ToDictionary(x => x.Id);
```

**Output:** `{ 1:A, 2:B }`

---

## GROUP BY

```csharp
var data = new[] { "a", "bb", "c", "dd" };
var g = data.GroupBy(x => x.Length);
```

**Output:**
`1:[a,c]`
`2:[bb,dd]`

---

## FREQUENCY MAP

```csharp
var freq = new Dictionary<string, int>();
foreach (var x in new[] { "a", "b", "a" })
    freq[x] = freq.GetValueOrDefault(x) + 1;
```

**Output:** `{ a:2, b:1 }`

---

## PARTITION

```csharp
var nums = new[] { 1, 2, 3, 4 };
var even = nums.Where(x => x % 2 == 0);
var odd = nums.Where(x => x % 2 != 0);
```

**Output:**
`even=[2,4]`
`odd=[1,3]`

---

## CHUNK (.NET 6+)

```csharp
var chunks = nums.Chunk(2);
```

**Output:** `[[1,2],[3,4]]`

---

## FLATTEN

```csharp
var nested = new[] { new[] {1,2}, new[] {3} };
var flat = nested.SelectMany(x => x);
```

**Output:** `[1,2,3]`

---

## INTERSECTION

```csharp
var a = new[] {1,2,3};
var b = new[] {2,3,4};
var r = a.Intersect(b);
```

**Output:** `[2,3]`

---

## DIFFERENCE

```csharp
var r = a.Except(b);
```

**Output:** `[1]`

---

## UNION

```csharp
var r = a.Union(b);
```

**Output:** `[1,2,3,4]`

---

## TOGGLE IN LIST

```csharp
var l = new List<int> { 1, 2 };
int v = 2;

if (!l.Remove(v))
    l.Add(v);
```

**Output:** `[1]`

---

## REMOVE NULLS

```csharp
int?[] arr = { 1, null, 2 };
var r = arr.Where(x => x.HasValue).Select(x => x.Value);
```

**Output:** `[1,2]`

---

## OPTIONAL CHAINING

```csharp
string city = user?.Address?.City;
```

**Output:** `null`

---

## NULL COALESCING

```csharp
string name = input ?? "default";
```

**Input:** `null`
**Output:** `"default"`

---

## CONCURRENTDICTIONARY

```csharp
var cd = new ConcurrentDictionary<int, int>();
cd.AddOrUpdate(1, 1, (_, v) => v + 1);
```

**Output:** `{1:1}`

---

## BLOCKINGCOLLECTION (QUEUE)

```csharp
var bc = new BlockingCollection<int>();
bc.Add(1);
var x = bc.Take();
```

**Output:** `1`

---

## SPAN

```csharp
Span<int> s = stackalloc int[] { 1, 2, 3 };
var x = s[1];
```

**Output:** `2`

---

## READONLYCOLLECTION

```csharp
var ro = new ReadOnlyCollection<int>(new[] {1,2});
```

**Output:** `[1,2] (immutable)`

---

## LOOKUP (`ILookup`)

```csharp
var lookup = data.ToLookup(x => x.Length);
```

**Output:** `lookup[1]=[a,c]`

---

## ENUM AS KEY

```csharp
enum Status { New, Done }

var map = new Dictionary<Status, int> {
    [Status.New] = 1
};
```

**Output:** `{ New:1 }`

---

## BIT FLAGS

```csharp
[Flags]
enum Perm { Read=1, Write=2, Execute=4 }

var p = Perm.Read | Perm.Write;
```

**Output:** `Read, Write`

---

## IMMUTABLECOLLECTIONS

```csharp
var imm = ImmutableList.Create(1,2,3);
var next = imm.Add(4);
```

**Output:** `[1,2,3,4]`

---

## LRU CORE STRUCTURE

```csharp
Dictionary<int, LinkedListNode<int>> map;
LinkedList<int> order;
```

**Output:** O(1) cache operations

---

## INDEX BY MULTIPLE KEYS

```csharp
var idx = users
    .GroupBy(u => (u.Country, u.Role))
    .ToDictionary(g => g.Key, g => g.ToList());
```

**Output:** `(VN,Admin) → [users]`
