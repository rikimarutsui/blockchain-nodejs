var express = require('express')
var router = express.Router();

/* Import Blockchain */
const { Blockchain } = require('../app/blockchain/blockchain');
const { Wallet } = require('../app/blockchain/wallet');
const { Transaction } = require('../app/blockchain/transaction');

/* Connect to the Blockchain */
let blockchain = new Blockchain().getInstance();

/***********
 *  APIs
 ***********/

/**
 * @swagger
 * /api/wallet/create:
 *  get:
 *      description: Create a new wallet
 *      responses:
 *          200:
 *              description: Success
 */
router.get('/create', function(req, res, next) {
    const wallet = new Wallet();
    const address = wallet.getAddress();
    const privateKey = wallet.getPrivateKey();
    res.json({ address: address, privateKey: privateKey });
});


/**
 * @swagger
 * /api/wallet/private:
 *  post:
 *      description: Get wallet information from private key
 *      parameters:
 *          - name: privateKey
 *            description: The private key of the wallet
 *            in: formData
 *            required: true
 *            type: string
 *      responses:
 *          200:
 *              description: Success
 */
router.post('/private', function(req, res, next) {
    const { privateKey } = req.body
    const wallet = new Wallet(privateKey);
    const address = wallet.getAddress();
    res.json({ address: address });
});


/**
 * @swagger
 * /api/wallet/send:
 *  post:
 *      description: Send a transaction
 *      parameters:
 *          - name: sender
 *            description: The address of the sender
 *            in: formData
 *            required: true
 *            type: string
 *          - name: recipient
 *            description: The address of the recipient
 *            in: formData
 *            required: true
 *            type: string
 *          - name: amount
 *            description: The amount of the transaction
 *            in: formData
 *            required: true
 *            type: string
 *          - name: privateKey
 *            description: The private key of the sender
 *            in: formData
 *            required: true
 *            type: string
 *          - name: message
 *            description: The message of the transaction
 *            in: formData
 *            required: true
 *            type: string
 *      responses:
 *          200:
 *              description: Success
 */
router.post('/send', function(req, res, next) {
    const { sender, recipient, amount, privateKey, message } = req.body;
    const tx = new Transaction(sender, recipient, Number(amount), message);
    const wallet = new Wallet(privateKey);
    tx.signTransaction(wallet.getKeyPair());
    const isValid = tx.isValid();
    if (isValid) {
        blockchain.addTransaction(tx);
        var signature = tx.signature;
        res.json({ tx, signature });
    } else {
        res.json({ error: 'Invalid signature' });
    }
});


module.exports = router;

