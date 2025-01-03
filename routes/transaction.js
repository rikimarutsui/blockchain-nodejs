/*******************
 * Import Libraries
 *******************/
var express = require('express')
var router = express.Router();

/**********************
 *  Import Blockchain 
 **********************/
const { Blockchain } = require('../app/blockchain/blockchain');

/* Connect to the Blockchain */
let blockchain = new Blockchain().getInstance();

/***********
 *  APIs
 ***********/

/**
 * @swagger
 * /api/transaction/block/:hash:
 *  get:
 *      description: Get all transactions of the block
 *      responses:
 *          200:
 *              description: Success
 */
router.get('/block/:hash', function(req, res, next) {
    const { hash } = req.params;
    const block = blockchain.getBlockByHash(hash);
    res.json(block.transactions);
});

/**
 * @swagger
 * /api/transaction/pending/all:
 *  get:
 *      description: Get all pending transactions
 *      responses:
 *          200:
 *              description: Success
 */
router.get('/pending/all', function(req, res, next) {
    res.json(blockchain.getPendingTransactions());
});

/**
 * @swagger
 * /api/transaction/pending/from/:from:
 *  get:
 *      description: Get all pending transactions from an address
 *      responses:
 *          200:
 *              description: Success
 */
router.get('/pending/from/:from', function(req, res, next) {
    const { from } = req.params;
    const txs = blockchain.getPendingTransactionsFromAddress(from);
    res.json(txs);
});

/**
 * @swagger
 * /api/transaction/pending/to/:to:
 *  get:
 *      description: Get all pending transactions to an address
 *      responses:
 *          200:
 *              description: Success
 */
router.get('/pending/to/:to', function(req, res, next) {
    const { to } = req.params;
    const txs = blockchain.getPendingTransactionsToAddress(to);
    res.json(txs);
});

/**
 * @swagger
 * /api/transaction/pending/balance/all:
 *  get:
 *      description: Get the pending balance of all addresses
 *      responses:
 *          200:
 *              description: Success
 */
router.get('/pending/balance/all', function(req, res, next) {
    const balance = blockchain.getPendingBalances();
    res.json(balance);
});

/**
 * @swagger
 * /api/transaction/pending/balance/from/:from:
 *  get:
 *      description: Get the pending balance of an address
 *      responses:
 *          200:
 *              description: Success
 */
router.get('/pending/balance/from/:from', function(req, res, next) {
    const { from } = req.params;
    const balance = blockchain.getPendingBalanceByFromAddress(from);
    res.json(balance);
});

/**
 * @swagger
 * /api/transaction/txid/:txid:
 *  get:
 *      description: Get the transaction by txid
 *      responses:
 *          200:
 *              description: Success
 */
router.get('/txid/:txid', function(req, res, next) {
    const { txid } = req.params;
    const tx = blockchain.getTransactionByTxid(txid);
    res.json(tx);
});



/******************
* Wallet Functions
******************/

/**
 * @swagger
 * /api/transaction/address/balance/:address:
 *  get:
 *      description: Get the balance of an address
 *      responses:
 *          200:
 *              description: Success
 */router.get('/address/balance/:address', function(req, res, next) {
    const { address } = req.params;
    const balance = blockchain.getBalanceOfAddress(address);
    res.json(balance);
});

/**
 * @swagger
 * /api/transaction/address/:address:
 *  get:
 *      description: Get the transactions by address
 *      responses:
 *          200:
 *              description: Success
 */
router.get('/address/:address', function(req, res, next) {
    const { address } = req.params;
    const txs = blockchain.getAllTransactionsOfAddress(address);
    res.json(txs);
});

module.exports = router;


