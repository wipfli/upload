# upload
Node express server for uploading measurement data to ballometer.io

## Installation

Write a ```upload.service``` file with the JWT secret:

```
[Unit]
Description=Node express server for uploading measurement data to ballometer.io

[Service]
WorkingDirectory=/root/upload
Environment=PORT=3001
Environment=JWT_SECRET="your-secret"
ExecStart=node index.js
Restart=always
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
```

```bash
npm install
```

test with

```bash
JWT_SECRET="your-secret" PORT=3001 node index.js
```

install with

```bash
systemctl enable /root/upload/upload.service
systemctl start upload
```
