## Go Worker Pools

Implement golang worker pools

Init worker pools with 3 workers then assign 3, 5, 6, 7 jobs to see runtime difference, each job takes 100ms processing

Round 1 - 3 tasks - runtime 101ms

Round 2 - 5 tasks - runtime 202ms

Round 3 - 6 tasks - runtime 202ms

Round 4 - 7 tasks - runtime 302ms

---

### Code
```go
package main

import (
	"log"
	"time"
)

type Worker struct {
	MaxNumJob     int
	Jobs, Results chan int
}

func (w *Worker) work(jobs <-chan int, results chan<- int) {
	for j := range jobs {
		time.Sleep(100 * time.Millisecond)
		results <- j
	}
}
func (w *Worker) Init(num int) {
	w.MaxNumJob = num
	w.Jobs = make(chan int, w.MaxNumJob)
	w.Results = make(chan int, w.MaxNumJob)
	for i := 1; i <= w.MaxNumJob; i++ {
		go w.work(w.Jobs, w.Results)
	}
	return
}
func (w *Worker) assign(round int, num int) {
	log.Println("[Round]", round)
	start := time.Now()
	for i := 1; i <= num; i++ {
		w.Jobs <- i
	}
	for i := 1; i <= num; i++ {
		res := <-w.Results
		log.Println(res)
	}
	end := time.Now()
	log.Println("Runtime:", end.Sub(start).Milliseconds(), "ms")
}

func main() {
	worker := &Worker{}
	worker.Init(3)
	worker.assign(1, 3)
	worker.assign(2, 5)
	worker.assign(3, 6)
	worker.assign(4, 7)
}

```

### Output
```
$go run main.go
2022/06/03 22:20:01 [Round] 1
2022/06/03 22:20:01 2
2022/06/03 22:20:01 1
2022/06/03 22:20:01 3
2022/06/03 22:20:01 Runtime: 101 ms
2022/06/03 22:20:01 [Round] 2
2022/06/03 22:20:01 1
2022/06/03 22:20:01 2
2022/06/03 22:20:01 3
2022/06/03 22:20:01 4
2022/06/03 22:20:01 5
2022/06/03 22:20:01 Runtime: 202 ms
2022/06/03 22:20:01 [Round] 3
2022/06/03 22:20:01 2
2022/06/03 22:20:01 3
2022/06/03 22:20:01 1
2022/06/03 22:20:02 4
2022/06/03 22:20:02 6
2022/06/03 22:20:02 5
2022/06/03 22:20:02 Runtime: 202 ms
2022/06/03 22:20:02 [Round] 4
2022/06/03 22:20:02 2
2022/06/03 22:20:02 3
2022/06/03 22:20:02 1
2022/06/03 22:20:02 4
2022/06/03 22:20:02 6
2022/06/03 22:20:02 5
2022/06/03 22:20:02 7
2022/06/03 22:20:02 Runtime: 302 ms

```