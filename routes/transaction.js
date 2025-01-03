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


