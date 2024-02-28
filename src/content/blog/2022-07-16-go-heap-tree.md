---
tags:
  - go
  - data structure
title: Go Heap Tree
author: Huy Nguyen
pubDatetime: 2022-07-16T15:57:52.737Z
slug: go-heap-tree
featured: false
ogImage: https://user-images.githubusercontent.com/53733092/215771435-25408246-2309-4f8b-a781-1f3d93bdf0ec.png
description: example using go heap tree
---
Implement golang heap tree interface

---

### Code
```go
package main

import (
	"container/heap"
	"log"
)
type IntHeap []int

func (h IntHeap) Len() int { 
    return len(h) 
}
func (h IntHeap) Less(i, j int) bool { 
    return h[i] < h[j] 
}
func (h IntHeap) Swap(i, j int) { 
    h[i], h[j] = h[j], h[i] 
}
func (h *IntHeap) Push(x interface{}) {
	*h = append(*h, x.(int))
}
func (h *IntHeap) Pop() interface{} {
	old := *h
	n := len(old)
	x := old[n-1]
	*h = old[0 : n-1]
	return x
}
func main() {
	h := IntHeap{}
	heap.Push(&h,5)
	heap.Push(&h,1)
	heap.Push(&h,3)
	log.Println(h)
	log.Println(heap.Pop(&h))
}

```

### Output
```
$go run main.go
2022/07/15 09:47:10 [1 5 3]
2022/07/15 09:47:10 1

```