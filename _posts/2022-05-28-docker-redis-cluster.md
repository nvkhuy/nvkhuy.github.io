## Redis Cluster Docker Compose

Redis Cluster provides a way to run a Redis installation 
where data is automatically sharded across multiple Redis nodes.

---

### Code

#### docker-compose.yml

``` yml
version: "3"

services:
  redis-cluster:
    image: grokzen/redis-cluster:latest
    ports:
      - "26379-26384:26379-26384"
    environment:
      - "INITIAL_PORT=26379"
      - "MASTERS=5"
      - "SLAVES_PER_MASTER=1"
      - "SENTINEL=false"
      - "REDIS_CLUSTER_IP=0.0.0.0"
      - "IP=0.0.0.0"
      - "BIND_ADDRESS=0.0.0.0"
```

### Docker compose
```
$ docker-compose up -d
```

### Connect redis cluster
```
$ redis-client -c -h 127.0.0.1 -p 26379
```