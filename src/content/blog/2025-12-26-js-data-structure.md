---
tags:
  - javascript
  - cheatsheet
title: JS Data Structures Cheat Sheet
author: Huy Nguyen
pubDatetime: 2025-12-25T11:20:00.737Z
slug: js-data-structure-cheat-shee
featured: false
ogImage: https://i.redd.it/fryh34q1kmt31.jpg
description: Common manipulation patterns.
---

## Table of contents

---

## 1. Array

```ts
const arr: number[] = [1, 2, 3];

// Add / Remove
arr.push(4);
arr.pop();
arr.unshift(0);
arr.shift();

// Access
const first: number = arr[0];
const last: number | undefined = arr.at(-1);
````

### Common Array Manipulation

```ts
const nums: number[] = [1, 2, 3, 4];

// map
const doubled: number[] = nums.map(n => n * 2);

// filter
const evens: number[] = nums.filter(n => n % 2 === 0);

// reduce
const sum: number = nums.reduce((acc, n) => acc + n, 0);

// find
const found: number | undefined = nums.find(n => n > 2);

// some / every
const hasLarge: boolean = nums.some(n => n > 3);
const allPositive: boolean = nums.every(n => n > 0);

// includes
const hasTwo: boolean = nums.includes(2);
```

---

## 2. Object (Key–Value)

```ts
type User = {
  id: number;
  name: string;
  age?: number;
};

const user: User = {
  id: 1,
  name: "Huy",
};

// Access
const username: string = user.name;

// Add / Update
user.age = 25;

// Delete (optional only)
delete user.age;

// Iterate
Object.keys(user);    // string[]
Object.values(user);  // (string | number)[]
Object.entries(user); // [string, string | number][]
```

---

## 3. Map

```ts
const map = new Map<string, number | string>();

map.set("id", 1);
map.set("name", "Huy");

const name: string | number | undefined = map.get("name");

map.has("id");   // boolean
map.delete("id");

for (const [key, value] of map) {
  console.log(key, value);
}
```

---

## 4. Set

```ts
const set: Set<number> = new Set([1, 2, 2, 3]);

set.add(4);
set.delete(2);
set.has(3);

const unique: number[] = [...set];
```

---

## 5. Boolean Operators

```ts
const a: boolean = true;
const b: boolean = false;

a && b;
a || b;
!a;
```

### Short-circuit

```ts
const name: string = input || "default";
isAdmin && doSomething();
```

### Nullish Coalescing

```ts
const value: string = data ?? "fallback";
```

---

## 6. Comparison Operators

```ts
1 == "1";   // boolean
1 === "1";  // boolean (false)
```

---

## 7. Stack (LIFO)

```ts
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }
}

const stack = new Stack<number>();
stack.push(1);
stack.push(2);
stack.pop();
```

---

## 8. Queue (FIFO)

```ts
class Queue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }
}

const queue = new Queue<number>();
queue.enqueue(1);
queue.enqueue(2);
queue.dequeue();
```

---

## 9. Dictionary Pattern

```ts
type Dict<T> = Record<string, T>;

const dict: Dict<number> = {};

dict["a"] = 1;
dict["b"] = 2;
```

---

## 10. Tuple

```ts
const point: [number, number] = [10, 20];

const [x, y] = point;
```

---

## 11. Destructuring

```ts
const user = {name: "Huy", age: 25};

const {name, age} = user;

const arr2: number[] = [1, 2];
const [a1, b1] = arr2;
```

---

## 12. Spread / Rest

```ts
const a1: number[] = [1, 2];
const b1: number[] = [...a1, 3];

const obj = {x: 1};
const copy = {...obj, y: 2};

function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}
```

---

## 13. Optional Chaining

```ts
type Profile = {
  email?: string;
};

type User = {
  profile?: Profile;
};

user.profile?.email;
```

---

## 14. JSON

```ts
const json: string = JSON.stringify({a: 1});

const parsed: { a: number } = JSON.parse(json);
```

---

## 15. Common Patterns

---

### Deduplicate Array (see primitive)

```ts
const nums = [1, 2, 2, 3, 3];
const unique = [...new Set(nums)];
````

**Input**

```ts
[1, 2, 2, 3, 3]
```

**Output**

```ts
[1, 2, 3]
```

---

### Deduplicate Array (object by key)

```ts
type User = { id: number; name: string };

const users: User[] = [
  { id: 1, name: "A" },
  { id: 1, name: "A" },
  { id: 2, name: "B" },
];

const unique = Object.values(
  users.reduce<Record<number, User>>((acc, cur) => {
    acc[cur.id] = cur;
    return acc;
  }, {})
);
```

**Input**

```ts
[
  { id: 1, name: "A" },
  { id: 1, name: "A" },
  { id: 2, name: "B" }
]
```

**Output**

```ts
[
  { id: 1, name: "A" },
  { id: 2, name: "B" }
]
```

---

### Index Array by Key

```ts
type User = { id: number; name: string };

const users: User[] = [
  { id: 1, name: "A" },
  { id: 2, name: "B" },
];

const byId = users.reduce<Record<number, User>>((acc, cur) => {
  acc[cur.id] = cur;
  return acc;
}, {});
```

**Input**

```ts
[
  { id: 1, name: "A" },
  { id: 2, name: "B" }
]
```

**Output**

```ts
{
  1: { id: 1, name: "A" },
  2: { id: 2, name: "B" }
}
```

---

### Partition Array

```ts
const nums = [1, 2, 3, 4, 5];

const [even, odd] = nums.reduce<[number[], number[]]>(
  (acc, cur) => {
    acc[cur % 2 === 0 ? 0 : 1].push(cur);
    return acc;
  },
  [[], []]
);
```

**Input**

```ts
[1, 2, 3, 4, 5]
```

**Output**

```ts
even = [2, 4]
odd  = [1, 3, 5]
```

---

### Chunk Array

```ts
function chunk<T>(arr: T[], size: number): T[][] {
  return arr.reduce<T[][]>((acc, cur, i) => {
    if (i % size === 0) acc.push([]);
    acc[acc.length - 1].push(cur);
    return acc;
  }, []);
}

chunk([1, 2, 3, 4, 5], 2);
```

**Input**

```ts
([1, 2, 3, 4, 5], 2)
```

**Output**

```ts
[[1, 2], [3, 4], [5]]
```

---

### Flatten Array (1 level)

```ts
const arr = [[1], [2, 3], [4]];
const flat = arr.reduce<number[]>((acc, cur) => acc.concat(cur), []);
```

**Input**

```ts
[[1], [2, 3], [4]]
```

**Output**

```ts
[1, 2, 3, 4]
```

---

### Remove Falsy Values

```ts
const values = [0, 1, false, "", null, undefined, "ok"];
const truthy = values.filter(Boolean);
```

**Input**

```ts
[0, 1, false, "", null, undefined, "ok"]
```

**Output**

```ts
[1, "ok"]
```

---

### Toggle Value in Array

```ts
function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value)
    ? arr.filter(v => v !== value)
    : [...arr, value];
}

toggle([1, 2, 3], 2);
```

**Input**

```ts
([1, 2, 3], 2)
```

**Output**

```ts
[1, 3]
```

---

### Intersection of Arrays

```ts
const a = [1, 2, 3];
const b = [2, 3, 4];
const intersection = a.filter(v => b.includes(v));
```

**Input**

```ts
[1, 2, 3], [2, 3, 4]
```

**Output**

```ts
[2, 3]
```

---

### Difference of Arrays

```ts
const a = [1, 2, 3];
const b = [2];
const diff = a.filter(v => !b.includes(v));
```

**Input**

```ts
[1, 2, 3], [2]
```

**Output**

```ts
[1, 3]
```

---

### Union of Arrays

```ts
const a = [1, 2];
const b = [2, 3];
const union = [...new Set([...a, ...b])];
```

**Input**

```ts
[1, 2], [2, 3]
```

**Output**

```ts
[1, 2, 3]
```

---

### Pick Object Properties

```ts
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {} as Pick<T, K>);
}

pick({ a: 1, b: 2, c: 3 }, ["a", "c"]);
```

**Input**

```ts
{ a: 1, b: 2, c: 3 }, ["a", "c"]
```

**Output**

```ts
{ a: 1, c: 3 }
```

---

### Omit Object Properties

```ts
function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const clone = { ...obj };
  keys.forEach(k => delete clone[k]);
  return clone;
}

omit({ a: 1, b: 2, c: 3 }, ["b"]);
```

**Input**

```ts
{ a: 1, b: 2, c: 3 }, ["b"]
```

**Output**

```ts
{ a: 1, c: 3 }
```

---

### Group + Sum

```ts
type Item = { type: string; amount: number };

const items: Item[] = [
  { type: "A", amount: 10 },
  { type: "B", amount: 5 },
  { type: "A", amount: 7 },
];

const totalByType = items.reduce<Record<string, number>>((acc, cur) => {
  acc[cur.type] = (acc[cur.type] ?? 0) + cur.amount;
  return acc;
}, {});
```

**Input**

```ts
[
  { type: "A", amount: 10 },
  { type: "B", amount: 5 },
  { type: "A", amount: 7 }
]
```

**Output**

```ts
{ A: 17, B: 5 }
```

---

### Find Max by Property

```ts
type Item = { score: number };

const items: Item[] = [
  { score: 10 },
  { score: 30 },
  { score: 20 },
];

const max = items.reduce((a, b) => (a.score > b.score ? a : b));
```

**Input**

```ts
[{ score: 10 }, { score: 30 }, { score: 20 }]
```

**Output**

```ts
{ score: 30 }
```

---
