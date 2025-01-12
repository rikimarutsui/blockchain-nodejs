var express = require('express')
var router = express.Router();

/* Import P2P Server */
const P2PServer = require('../app/network/P2PServer');

/* Import Blockchain */
const { Blockchain } = require('../app/blockchain/blockchain');

/* Create a new blockchain */
let blockchain = new Blockchain().getInstance();
let p2pServer = new P2PServer().getInstance();

/* APIs */


/**
 * @swagger
 * /api/blockchain/:
 *  get:
 *      description: Get the blockchain
 *      responses:
 *          200:
 *              description: Success
 */
router.get('/', function(req, res, next) {
    res.json(blockchain.getClain());
});

/**
 * @swagger
 * /api/blockchain/length:
 *  get:
 *      description: Get the blockchain length
 *      responses:
 *          200:
 *              description: Success
 */
router.get('/length', function(req, res, next) {
    res.json(blockchain.getLength());
});

/**
 * @swagger
 * /api/blockchain/latest:
 *  get:
 *      description: Get the latest block
 *      responses:
 *          200:
 *              description: Success
 */
router.get('/latest', function(req, res, next) {
    res.json(blockchain.getLatestBlock());
});

/**
 * @swagger
 * /api/blockchain/block/index/:index:
 *  get:
 *      description: Get the block by index
 *      responses:
 *          200:
 *              description: Success
 */
router.get('/block/index/:index(\\d+)', function(req, res, next) {
    const { index } = req.params;
    res.json(blockchain.getBlockByIndex(index));
});

/**
 * @swagger
 * /api/blockchain/block/hash/:hash:
 *  get:
 *      description: Get the block by hash
 *      responses:
 *          200:
 *              description: Success
 */
router.get('/block/hash/:hash', function(req, res, next) {
    const { hash } = req.params;
    const block = blockchain.getBlockByHash(hash);
    res.json(block);
});

/**
 * @swagger
 * /api/blockchain/mine:
 *  post:
 *      description: Mine a new block
 *      parameters:
 *          - name: address
 *            description: The address of the miner
 *            in: formData
 *            required: true
 *            type: string
 *      responses:
 *          200:
 *              description: Success
 */
router.post('/mine', function(req, res, next) {
    const address = req.body.address;
    const block = blockchain.minePendingTransactions(address);
    p2pServer.broadcast({ type: 'NEW_BLOCK', block: block });
    res.json(block);
});

/**
 * @swagger
 * /api/blockchain/congestion:
 *  get:
 *      description: Get the congestion
 *      responses:
 *          200:
 *              description: Success
 */
router.get('/congestion', function(req, res, next) {
    res.json(blockchain.getCurrentCongestionLevel());
});

/**
 * @swagger
 * /api/blockchain/congestion:
 *  post:
 *      description: Set the congestion
 *      parameters:
 *          - name: level
 *            description: The level of the congestion
 *            in: formData
 *            required: true
 *            type: string
 *      responses:
 *          200:
 *              description: Success
 */
router.post('/congestion', function(req, res, next) {
    const level = req.body.level;
    console.log(level);
    blockchain.setCurrentCongestionLevel(parseInt(level));
    res.json(blockchain.getCurrentCongestionLevel());
});

module.exports = router;