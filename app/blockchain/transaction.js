/*********************
 * Import Libraries
 ********************/
const { ec } = require('elliptic');
const EC = new ec('secp256k1');
const SHA256 = require("crypto-js/sha256");

/********************
 * Import Blockchain
 ********************/
const { Block } = require('./block');

/**
 * @class Transaction
 * @description Transaction class
 * @exports Transaction
 */
class Transaction {
    signature;
    fromAddress;
    toAddress;
    amount;
    message;
    timestamp;
    txid;

    /**
     * @constructor
     * @param {string} fromAddress
     * @param {string} toAddress
     * @param {number} amount
     * @param {string} message
     * @memberof Transaction
     */
    constructor(fromAddress, toAddress, amount, message) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.message = message;
        this.timestamp = new Date().toISOString();
        this.txid = this.calculateHash();
    }

    /**
     * @function calculateHash
     * @description Calculate the hash of the transaction
     * @memberof Transaction
     * @returns {string} The hash of the transaction
     */
    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount + this.message + this.timestamp).toString();
    }

    /**
     * @function signTransaction
     * @description Sign the transaction with the private key
     * @memberof Transaction
     * @param {keyPair} signingKey - The private key to sign the transaction with
     */
    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }


    /**
     * @function isValid
     * @description Check if the transaction is valid
     * @memberof Transaction
     * @returns {boolean} True if the transaction is valid, false otherwise
     */
    isValid() {
        if (this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }
        if (this.fromAddress === this.toAddress) {
            throw new Error('Cannot send to yourself');
        }

        const publicKey = EC.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

module.exports.Transaction = Transaction;