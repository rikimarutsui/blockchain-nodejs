/**********************
 *  Import Blockchain 
 **********************/
const { Block } = require('./block');
const { Blockchain } = require('./blockchain');

let blockchain = new Blockchain().getInstance();

function generateTxId() {
    return Math.random().toString(36).substring(2, 10);
}

function createTransaction(sender, recipient, amount) {
    const txid = generateTxId();
    const newBlock = new Block(
        blockchain.getLength(),
        new Date().toString(),
        { sender, recipient, amount, txid }
    );
    blockchain.addBlock(newBlock);
    return newBlock;
}

module.exports.generateTxId = generateTxId;
module.exports.createTransaction = createTransaction;
