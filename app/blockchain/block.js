/********************
 * Import Libraries
 *******************/
const SHA256 = require("crypto-js/sha256");

/**
 * @class Block
 * @description Block class
 * @exports Block
 */
class Block {
  /**
   * @constructor
   * @memberof Block
   * @param {number} index
   * @param {string} timestamp
   * @param {Transaction[]} transactions 
   * @param {string} previousHash
   */
  constructor(index, timestamp, transactions, previousHash = "", hash = null, nonce = 0) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = hash? hash : this.calculateHash();
    this.nonce = nonce;
  }

  /**
   * @function calculateHash
   * @description: Calculate the hash of the block
   * @memberof Block
   * @returns {string} The hash of the block
   */
  calculateHash() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  }

  /**
   * @function mineBlock
   * @description: Mine a block with PoW
   * @memberof Block
   * @param {number} difficulty 
   */
  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log("Block mined: " + this.hash);
  }
}

module.exports.Block = Block;