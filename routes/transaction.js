/*******************
 * Import Libraries
 *******************/
var express = require('express')
var router = express.Router();

/**********************
 *  Import Blockchain 
 **********************/
const { Blockchain } = require('../app/blockchain/blockchain');
let blockchainUtil = require('../app/blockchain/util');

let blockchain = new Blockchain().getInstance();

/***********
 *  APIs
 ***********/

/**
 * @swagger
 * /api/transaction/create:
 *  post:
 *      description: Create a transaction
 *      responses:
 *          200:
 *              description: Success
 */
router.post('/create', function(req, res, next) {
    const { sender, recipient, amount } = req.body;
    var newBlock = blockchainUtil.createTransaction(sender, recipient, amount);
    res.json(newBlock);
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
    const block = blockchain.chain.find(
        (block) => block.data.txid === txid
    );
    res.json(block);
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


