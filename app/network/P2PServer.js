/********************
 * Import Libraries
 *******************/
const WebSocket = require('ws');

/*********************
 * Import Blockchain
 ********************/
const { Block } = require('../blockchain/block');
const { Blockchain } = require('../blockchain/blockchain');

let blockchain = new Blockchain().getInstance();

/**
 * P2P Server
 * @class P2PServer
 * @exports P2PServer
 */
class P2PServer {
    /**
     * @constructor
     * P2PServer Constructor
     * @param {string} port
     */
    constructor() {
        this.sockets = [];
        this.server = new WebSocket.Server({ port: process.env.P2P_PORT || 5001 });
        this.listen();
    }

    /**
     * Listen for new connections
     * @function listen
     */
    listen() {
        this.server.on('connection', socket => {
            this.sockets.push(socket);
            console.log('New peer connected');
            this.messageHandler(socket);
        });
    }

    /**
     * Handle messages from peers
     * @function messageHandler
     * @param { WebSocket } socket 
     */
    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message);
            console.log(data);
            switch (data.type) {
                case 'NEW_BLOCK':
                    console.log('New block received');
                    let newblock = new Block(
                        data.block.index,
                        data.block.timestamp,
                        data.block.transactions,
                        data.block.previousHash,
                        data.block.hash,
                        data.block.nonce
                    );
                    if(blockchain.isBlockValid(newblock)){
                        blockchain.addBlock(newblock);
                        this.broadcast({ type: 'NEW_BLOCK', block: newblock });
                        console.log('New block added');
                    }else{
                        console.log('Invalid block');
                    }
                    break;
                case 'REPLACE_CHAIN':
                    blockchain.replaceChain(data.chain);
                    break;
                case 'REQUEST_CHAIN':
                    socket.send(JSON.stringify({ type: 'REPLACE_CHAIN', chain: blockchain.getClain() }));
                    break;
            }
        });
    }

    /**
     * Broadcast a message to all peers
     * @function broadcast
     * @param { Object } message
     */
    broadcast(message) {
        this.sockets.forEach(socket => {
            socket.send(JSON.stringify(message));
        });
    }

    /**
     * Connect to a peer
     * @function connectToPeer
     * @param {*} peer 
     */
    connectToPeer(peer) {
        const socket = new WebSocket(peer);
        socket.on('open', () => {
            this.sockets.push(socket);
            console.log(`Connected to peer: ${peer}`);
            socket.send(JSON.stringify({ type: 'REQUEST_CHAIN' }));
        });
        this.messageHandler(socket);
    }
}

/**
 * @class P2PServerSingleton
 * P2P Server Singleton
 * @exports P2PServerSingleton
 */
class P2PServerSingleton {
    /**
     * Constructor
     * @constructor
     */
    constructor() {
        if (!P2PServerSingleton.instance) {
            P2PServerSingleton.instance = new P2PServer();
        }
    }

    /**
     * Get the instance of the P2P Server
     * @function getInstance
     * @returns {P2PServer} The instance of the P2P Server
     */
    getInstance() {
        return P2PServerSingleton.instance;
    }
}

module.exports = P2PServerSingleton;