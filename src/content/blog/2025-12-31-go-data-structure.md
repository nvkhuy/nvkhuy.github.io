---
tags:
  - golang
  - cheatsheet
title: Golang Data Structures Cheat Sheet
author: Huy Nguyen
pubDatetime: 2025-12-30T11:20:00.737Z
slug: golang-data-structure-cheat-shee
featured: false
ogImage: https://pbs.twimg.com/media/DcvcASxX4AAQv56.jpg
description: Common manipulation patterns.
---

## Table of contents

---

# 1. Array

```go
arr := [3]int{1, 2, 3}
fmt.Println(arr[1])
```

**Input**

```
[1 2 3]
```

**Output**

```
2
```

---

# 2. Slice

```go
s := []int{1, 2, 3}
s = append(s, 4)
fmt.Println(s)
```

**Input**

```
[1 2 3]
```

**Output**

```
[1 2 3 4]
```

---

# 3. Slice Copy

```go
a := []int{1, 2, 3}
b := make([]int, len(a))
copy(b, a)
b[0] = 99
fmt.Println(a, b)
```

**Output**

```
[1 2 3] [99 2 3]
```

---

# 4. Map (HashMap)

```go
m := map[string]int{
	"a": 1,
	"b": 2,
}
m["c"] = 3
fmt.Println(m["b"])
```

**Output**

```
2
```

---

# 5. Map Check Exists

```go
v, ok := m["x"]
fmt.Println(v, ok)
```

**Output**

```
0 false
```

---

# 6. Set (Map as Set)

```go
set := map[int]struct{}{}
set[1] = struct{}{}
_, ok := set[1]
fmt.Println(ok)
```

**Output**

```
true
```

---

# 7. Struct

```go
type User struct {
	ID   int
	Name string
}

u := User{ID: 1, Name: "Huy"}
fmt.Println(u.Name)
```

**Output**

```
Huy
```

---

# 8. Pointer to Struct

```go
u := &User{ID: 1}
u.Name = "Go"
fmt.Println(u.Name)
```

**Output**

```
Go
```

---

# 9. Embedded Struct

```go
type Base struct {
	ID int
}

type Admin struct {
	Base
	Role string
}

a := Admin{Base{1}, "admin"}
fmt.Println(a.ID, a.Role)
```

**Output**

```
1 admin
```

---

# 10. Enum (iota)

```go
type Status int

const (
	Pending Status = iota
	Active
	Closed
)

fmt.Println(Active)
```

**Output**

```
1
```

---

# 11. String Builder

```go
var b strings.Builder
b.WriteString("Go")
b.WriteString("Lang")
fmt.Println(b.String())
```

**Output**

```
GoLang
```

---

# 12. Stack (Slice-based)

```go
stack := []int{}
stack = append(stack, 1)
stack = append(stack, 2)

top := stack[len(stack)-1]
stack = stack[:len(stack)-1]

fmt.Println(top, stack)
```

**Output**

```
2 [1]
```

---

# 13. Queue (Slice-based)

```go
q := []int{1, 2, 3}
front := q[0]
q = q[1:]

fmt.Println(front, q)
```

**Output**

```
1 [2 3]
```

---

# 14. Linked List (container/list)

```go
l := list.New()
l.PushBack(1)
l.PushBack(2)

for e := l.Front(); e != nil; e = e.Next() {
	fmt.Print(e.Value)
}
```

**Output**

```
12
```

---

# 15. Sort Slice

```go
nums := []int{3, 1, 2}
sort.Ints(nums)
fmt.Println(nums)
```

**Output**

```
[1 2 3]
```

---

# 16. Custom Sort

```go
type Item struct {
	Name  string
	Score int
}

items := []Item{{"A", 2}, {"B", 1}}
sort.Slice(items, func(i, j int) bool {
	return items[i].Score < items[j].Score
})
fmt.Println(items)
```

**Output**

```
[{B 1} {A 2}]
```

---

# 17. Group By Pattern

```go
items := []string{"a", "b", "a"}
group := map[string][]string{}

for _, v := range items {
	group[v] = append(group[v], v)
}

fmt.Println(group)
```

**Output**

```
map[a:[a a] b:[b]]
```

---

# 18. Frequency Count

```go
freq := map[string]int{}
for _, v := range items {
	freq[v]++
}
fmt.Println(freq)
```

**Output**

```
map[a:2 b:1]
```

---

# 19. Filter Slice

```go
nums := []int{1, 2, 3, 4}
res := []int{}

for _, v := range nums {
	if v%2 == 0 {
		res = append(res, v)
	}
}

fmt.Println(res)
```

**Output**

```
[2 4]
```

---

# 20. Reduce Pattern

```go
sum := 0
for _, v := range nums {
	sum += v
}
fmt.Println(sum)
```

**Output**

```
10
```

---

# 21. Interface

```go
type Animal interface {
	Speak() string
}

type Dog struct{}

func (Dog) Speak() string {
	return "woof"
}

var a Animal = Dog{}
fmt.Println(a.Speak())
```

**Output**

```
woof
```

---

# 22. Interface Assertion

```go
d, ok := a.(Dog)
fmt.Println(d, ok)
```

**Output**

```
{} true
```

---

# 23. Empty Interface (any)

```go
var x any = 10

switch v := x.(type) {
case int:
	fmt.Println(v + 1)
}
```

**Output**

```
11
```

---

# 24. Goroutine

```go
go func() {
	fmt.Println("hello")
}()

time.Sleep(time.Millisecond)
```

**Output**

```
hello
```

---

# 25. Channel (Unbuffered)

```go
ch := make(chan int)

go func() {
	ch <- 10
}()

fmt.Println(<-ch)
```

**Output**

```
10
```

---

# 26. Buffered Channel

```go
ch := make(chan int, 2)
ch <- 1
ch <- 2

fmt.Println(<-ch, <-ch)
```

**Output**

```
1 2
```

---

# 27. Channel Range

```go
ch := make(chan int)

go func() {
	for i := 1; i <= 3; i++ {
		ch <- i
	}
	close(ch)
}()

for v := range ch {
	fmt.Print(v)
}
```

**Output**

```
123
```

---

# 28. Select

```go
c1 := make(chan int)
c2 := make(chan int)

go func() { c1 <- 1 }()
go func() { c2 <- 2 }()

select {
case v := <-c1:
	fmt.Println(v)
case v := <-c2:
	fmt.Println(v)
}
```

**Output**

```
1 OR 2
```

---

# 29. WaitGroup

```go
var wg sync.WaitGroup
wg.Add(2)

go func() {
	defer wg.Done()
	fmt.Println("A")
}()

go func() {
	defer wg.Done()
	fmt.Println("B")
}()

wg.Wait()
```

**Output**

```
A
B
```

---

# 30. Mutex

```go
var mu sync.Mutex
count := 0

for i := 0; i < 2; i++ {
	go func() {
		mu.Lock()
		count++
		mu.Unlock()
	}()
}

time.Sleep(time.Millisecond)
fmt.Println(count)
```

**Output**

```
2
```

---

# 31. Worker Pool Pattern

```go
jobs := make(chan int, 3)
results := make(chan int, 3)

worker := func() {
	for j := range jobs {
		results <- j * 2
	}
}

go worker()
go worker()

jobs <- 1
jobs <- 2
jobs <- 3
close(jobs)

fmt.Println(<-results, <-results, <-results)
```

**Output**

```
2 4 6
```

---

# 32. Context Cancel

```go
ctx, cancel := context.WithCancel(context.Background())

go func() {
	select {
	case <-ctx.Done():
		fmt.Println("cancelled")
	}
}()

cancel()
time.Sleep(time.Millisecond)
```

**Output**

```
cancelled
```

---

# 33. Defer Stack Order

```go
for i := 0; i < 3; i++ {
	defer fmt.Print(i)
}
```

**Output**

```
210
```

---

# 34. Error Handling

```go
err := errors.New("fail")
if err != nil {
	fmt.Println(err.Error())
}
```

**Output**

```
fail
```

---

# 35. Custom Error Type

```go
type MyErr struct {
	Msg string
}

func (e MyErr) Error() string {
	return e.Msg
}

err := MyErr{"oops"}
fmt.Println(err)
```

**Output**

```
oops
```

---

## 36. Stack (Struct-based)

```go
type Stack struct {
	data []int
}

func (s *Stack) Push(v int) {
	s.data = append(s.data, v)
}

func (s *Stack) Pop() int {
	n := len(s.data)
	v := s.data[n-1]
	s.data = s.data[:n-1]
	return v
}

s := Stack{}
s.Push(1)
s.Push(2)
fmt.Println(s.Pop(), s.data)
```

**Output**

```
2 [1]
```

---

## 37. Queue (Struct-based)

```go
type Queue struct {
	data []int
}

func (q *Queue) Enqueue(v int) {
	q.data = append(q.data, v)
}

func (q *Queue) Dequeue() int {
	v := q.data[0]
	q.data = q.data[1:]
	return v
}

q := Queue{}
q.Enqueue(1)
q.Enqueue(2)
fmt.Println(q.Dequeue(), q.data)
```

**Output**

```
1 [2]
```

---

## 38. Priority Queue (Min-Heap)

```go
type Item struct {
	value int
}

type PQ []Item

func (pq PQ) Len() int            { return len(pq) }
func (pq PQ) Less(i, j int) bool  { return pq[i].value < pq[j].value }
func (pq PQ) Swap(i, j int)       { pq[i], pq[j] = pq[j], pq[i] }
func (pq *PQ) Push(x any)         { *pq = append(*pq, x.(Item)) }
func (pq *PQ) Pop() any {
	old := *pq
	n := len(old)
	x := old[n-1]
	*pq = old[:n-1]
	return x
}

pq := &PQ{}
heap.Init(pq)
heap.Push(pq, Item{3})
heap.Push(pq, Item{1})
heap.Push(pq, Item{2})

fmt.Println(heap.Pop(pq).(Item).value)
```

**Output**

```
1
```

---

## 39. Priority Queue (Max-Heap)

```go
func (pq PQ) Less(i, j int) bool {
	return pq[i].value > pq[j].value
}
```

**Input**

```
3,1,2
```

**Output**

```
3
```

---

## 40. Deque (Double-Ended Queue)

```go
type Deque struct {
	data []int
}

func (d *Deque) PushFront(v int) {
	d.data = append([]int{v}, d.data...)
}

func (d *Deque) PushBack(v int) {
	d.data = append(d.data, v)
}

func (d *Deque) PopFront() int {
	v := d.data[0]
	d.data = d.data[1:]
	return v
}

func (d *Deque) PopBack() int {
	n := len(d.data)
	v := d.data[n-1]
	d.data = d.data[:n-1]
	return v
}

d := Deque{}
d.PushBack(1)
d.PushFront(0)
fmt.Println(d.PopFront(), d.PopBack())
```

**Output**

```
0 1
```

---

## 41. Circular Buffer (Ring)

```go
r := ring.New(3)
for i := 1; i <= 3; i++ {
	r.Value = i
	r = r.Next()
}

r.Do(func(v any) {
	fmt.Print(v)
})
```

**Output**

```
123
```

---

## 42. Binary Tree Node

```go
type Node struct {
	Val   int
	Left  *Node
	Right *Node
}

root := &Node{1,
	&Node{2, nil, nil},
	&Node{3, nil, nil},
}

fmt.Println(root.Left.Val)
```

**Output**

```
2
```

---

## 43. DFS (Recursive)

```go
func dfs(n *Node) {
	if n == nil {
		return
	}
	fmt.Print(n.Val)
	dfs(n.Left)
	dfs(n.Right)
}

dfs(root)
```

**Output**

```
123
```

---

## 44. BFS (Queue)

```go
q := []*Node{root}

for len(q) > 0 {
	n := q[0]
	q = q[1:]

	fmt.Print(n.Val)

	if n.Left != nil {
		q = append(q, n.Left)
	}
	if n.Right != nil {
		q = append(q, n.Right)
	}
}
```

**Output**

```
123
```

---

## 45. Trie (Prefix Tree)

```go
type Trie struct {
	children map[rune]*Trie
	end      bool
}

func NewTrie() *Trie {
	return &Trie{children: map[rune]*Trie{}}
}

func (t *Trie) Insert(word string) {
	cur := t
	for _, ch := range word {
		if cur.children[ch] == nil {
			cur.children[ch] = NewTrie()
		}
		cur = cur.children[ch]
	}
	cur.end = true
}

func (t *Trie) Search(word string) bool {
	cur := t
	for _, ch := range word {
		if cur.children[ch] == nil {
			return false
		}
		cur = cur.children[ch]
	}
	return cur.end
}

trie := NewTrie()
trie.Insert("go")
fmt.Println(trie.Search("go"), trie.Search("golang"))
```

**Output**

```
true false
```

---

## 46. Union Find (Disjoint Set)

```go
parent := map[int]int{}

func find(x int) int {
	if parent[x] != x {
		parent[x] = find(parent[x])
	}
	return parent[x]
}

func union(a, b int) {
	parent[find(a)] = find(b)
}

parent[1] = 1
parent[2] = 2
union(1, 2)
fmt.Println(find(1) == find(2))
```

**Output**

```
true
```

---

## 47. LRU Cache (container/list)

```go
type Entry struct {
	key int
}

cache := list.New()
cache.PushFront(Entry{1})
cache.PushFront(Entry{2})

fmt.Println(cache.Front().Value.(Entry).key)
```

**Output**

```
2
```

---

## 48. Rate Limiter (Channel)

```go
limiter := time.Tick(time.Second)

for i := 0; i < 2; i++ {
	<-limiter
	fmt.Println("request")
}
```

**Output**

```
request
request
```

---

## 49. Fan-Out Fan-In

```go
work := make(chan int)
result := make(chan int)

for i := 0; i < 2; i++ {
	go func() {
		for v := range work {
			result <- v * 2
		}
	}()
}

go func() {
	for i := 1; i <= 3; i++ {
		work <- i
	}
	close(work)
}()

for i := 0; i < 3; i++ {
	fmt.Print(<-result)
}
```

**Output**

```
246
```

---

## 50. Atomic Counter

```go
var x int64
atomic.AddInt64(&x, 1)
fmt.Println(atomic.LoadInt64(&x))
```

**Output**

```
1
```

---
