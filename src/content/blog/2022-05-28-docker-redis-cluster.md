---
tags:
    - docker
    - redis
title: Docker Redis Cluster
author: Huy Nguyen
pubDatetime: 2022-05-28T15:57:52.737Z
slug: docker-redis-cluster
featured: false
ogImage: https://user-images.githubusercontent.com/53733092/215771435-25408246-2309-4f8b-a781-1f3d93bdf0ec.png
description: using redis cluster with docker
---

---
Redis Cluster provides a way to run a Redis installation 
where data is automatically sharded across multiple Redis nodes.

---

### Code

#### docker-compose.yml

```
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