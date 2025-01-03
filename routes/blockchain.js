var express = require('express')
var router = express.Router();

/* Import Blockchain */
const { Block } = require('../app/blockchain/block');
const { Blockchain } = require('../app/blockchain/blockchain');

let blockchain = new Blockchain().getInstance();

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
 *  get:
 *      description: Mine a new block
 *      responses:
 *          200:
 *              description: Success
 */
router.post('/mine', function(req, res, next) {
    const address = req.body.address;
    const block = blockchain.minePendingTransactions(address);
    res.json(block);
});

module.exports = router;