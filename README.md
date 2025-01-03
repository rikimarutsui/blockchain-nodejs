# Blockchain-Nodejs

This is a blockchain example using Node.js

## Installation

Use the package manager [npm] to install

```bash
npm install
```

## Usage

### Start the application (main node)
```bash
node index.js
```

### Start the application (secondary nodes)
```bash
HTTP_PORT=3001 P2P_PORT=5002 PEERS=ws://localhost:5001 node index.js
```
