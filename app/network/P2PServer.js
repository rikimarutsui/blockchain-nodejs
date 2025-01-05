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
 * @class P2PServer
 * @description P2P Server
 * @memberof module:app/network
 * @exports P2PServer
 */
class P2PServer {
    /**
     * @constructor
     * @description Constructor
     * @memberof module:app/network.P2PServer
     * @param {string} port
     */
    constructor() {
        this.sockets = [];
        this.server = new WebSocket.Server({ port: process.env.P2P_PORT || 5001 });
        this.listen();
    }

    /**
     * @function listen
     * @description Listen for new connections
     * @memberof module:app/network.P2PServer
     */
    listen() {
        this.server.on('connection', socket => {
            this.sockets.push(socket);
            console.log('New peer connected');
            this.messageHandler(socket);
        });
    }

    /**
     * @function messageHandler
     * @description Handle messages from peers
     * @memberof module:app/network.P2PServer
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
     * @function broadcast
     * @description Broadcast a message to all peers
     * @memberof module:app/network.P2PServer
     * @param { Object } message
     */
    broadcast(message) {
        this.sockets.forEach(socket => {
            socket.send(JSON.stringify(message));
        });
    }

    /**
     * @function connectToPeer
     * @description Connect to a peer
     * @memberof module:app/network.P2PServer
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
 * @description P2P Server Singleton
 * @memberof module:app/network
 * @exports P2PServerSingleton
 */
class P2PServerSingleton {
    /**
     * @constructor
     * @description Constructor
     * @memberof module:app/network.P2PServerSingleton
     */
    constructor() {
        if (!P2PServerSingleton.instance) {
            P2PServerSingleton.instance = new P2PServer();
        }
    }

    /**
     * @function getInstance
     * @description Get the instance of the P2P Server
     * @memberof module:app/network.P2PServerSingleton
     * @returns {P2PServer} The instance of the P2P Server
     */
    getInstance() {
        return P2PServerSingleton.instance;
    }
}

module.exports = P2PServerSingleton;