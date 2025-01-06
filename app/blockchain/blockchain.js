/*********
 * Imports
 *********/
const { Block } = require('./block');
const { Transaction } = require('./transaction');


/**
 * Blockchain class
 * @class Blockchain
 * @exports Blockchain
 */
class Blockchain {
  /*******************
   * Global Variables
   ******************/
  #chain = [];
  #pendingTransactions = [];
  #pendingBalances = {};
  #difficulty;
  #miningReward;

  /**
   * Create a new blockchain
   * @constructor
   */
  constructor() {
    this.#chain = [this.#createGenesisBlock()];
    this.#pendingTransactions = [];
    this.#pendingBalances = {};
    this.#difficulty = 2;
    this.#miningReward = 100;
  }

  /******
   * Getter
   ******/

  /**
   * Get the chain
   * @function getClain
   * @returns  {Array<Block>} The chain
   */
  getClain() {
    return this.#chain;
  }

  /**
   * Replace the clain
   * @function replaceChain
   * @param {Array<Block>} newChain
   */
  replaceChain(newChain) {
    if (newChain.length < this.#chain.length) {
      console.log('Received chain is not longer than the current chain.');
      return;
    } else if (!this.isChainValid(newChain)) {
      console.log('The received chain is not valid.');
      return;
    }

    console.log('Replacing blockchain with the new chain.');
    this.#chain = newChain;
  }

  /**
   * Get the latest block
   * @function getLatestBlock
   * @returns {Block} The latest block
   */
  getLatestBlock() {
    return this.#chain[this.#chain.length - 1];
  }

  /**
   * Get the length of the chain
   * @function getLength
   * @returns {number} The length of the chain
   */
  getLength(){
    return this.#chain.length;
  }

  /**
   * Get the block by index
   * @function getBlockByIndex
   * @param {number} index 
   * @returns {Block} The block at the given index
   */
  getBlockByIndex(index) {
    return this.#chain[index];
  }

  /**
   * Get the block by hash
   * @function getBlockByHash
   * @param {string} hash 
   * @returns {Block} The block with the given hash
   */
  getBlockByHash(hash) {
    return this.#chain.find((block) => block.hash === hash);
  }

  /**
   * Get the pending transactions
   * @function getPendingTransactions
   * @returns { Transaction[] } The Pending Transactions Array
   */
  getPendingTransactions(){
    return this.#pendingTransactions;
  }

  /**
   * Get the pending transactions from an address
   * @function getPendingTransactionsFromAddress
   * @param { string } fromAddress 
   * @returns { Transaction[] } The Pending Transactions Array from an address
   */
  getPendingTransactionsFromAddress(fromAddress){
    return this.#pendingTransactions.filter((tx) => tx.fromAddress === fromAddress);
  }

  /**
   * Get the pending transactions to an address
   * @function getPendingTransactionsToAddress
   * @param { string } toAddress
   * @returns { Transaction[] } The Pending Transactions Array to an address
   */
  getPendingTransactionsToAddress(toAddress){
    return this.#pendingTransactions.filter((tx) => tx.toAddress === toAddress);
  }

  /**
   * Get the pending balances
   * @function getPendingBalances
   * @returns {Object} The pending balances
   */
  getPendingBalances(){
    return this.#pendingBalances;
  }

  /**
   * Get the pending balance by from address
   * @function getPendingBalanceByFromAddress
   * @param {string} fromAddress
   * @returns {number} The pending balance for the given from address
   */
  getPendingBalanceByFromAddress(fromAddress){
    return this.#pendingBalances[fromAddress] || null;
  }

  /******************
   * Wallet Functions
   *****************/

  /**
   * Get the balance of an address
   * @function getBalanceOfAddress
   * @param {string} address
   * @returns {number} The balance of the address
   */
  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.#chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    // Subtract pending transactions from balance to prevent double spending
    if (this.#pendingBalances[address]) {
      balance = this.#pendingBalances[address];
    }

    return balance;
  }

  /**
   * Get all transactions for a wallet
   * @function getAllTransactionsOfAddress
   * @param {string} address
   * @returns {Array<Transaction>} The transactions for the wallet
   */
  getAllTransactionsOfAddress(address) {
    const txs = [];

    for (const block of this.#chain) {
      for (const tx of block.transactions) {
        if (tx.fromAddress === address || tx.toAddress === address) {
          txs.push(tx);
        }
      }
    }

    return txs;
  }

  /**
   * Get the transaction by txid
   * @function getTransactionByTxid
   * @param {string} txid
   * @returns {Transaction} The transaction with the given txid
   */
  getTransactionByTxid(txid) {
    for (let i = 1; i < this.#chain.length; i++) {
      for (let j = 0; j < this.#chain[i].transactions.length; j++) {
        if (this.#chain[i].transactions[j].txid === txid) {
          return this.#chain[i].transactions[j];
        }
      }
    }
    return null;
  }

  /*************
   * Functions
   *************/
  /***********************
   * Blockchain Functions
   **********************/

  /**
   * Create the genesis block
   * @function #createGenesisBlock
   * @returns {Block} The genesis block
   */
  #createGenesisBlock() {
    return new Block(0, new Date().toISOString(), 
      [new Transaction(
        null,
        "04b4cb2848ac6e9f53dfc76a89edbf5c41967a6a89130f7343169f23bd0077d78251905fda5a45eb58682516e72cacb6f9d544f4c671f17c3e8e6ee80475c5d562",
        50,
        "Genesis Block"
      )], 
    "0");
  }

  /**
   * Add a new block to the chain
   * @function addBlock
   * @param {Block} newBlock 
   */
  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.#difficulty);
    this.#chain.push(newBlock);
  }


  /**
   * Mine pending transactions and add a new block to the chain
   * @function minePendingTransactions
   * @param {string} miningRewardAddress - The address to receive the mining reward
   * @returns {Block} The new block that was mined
  */
  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(null, miningRewardAddress, this.#miningReward, 'Mining Reward');
    this.#pendingTransactions.push(rewardTx);

    const block = new Block(this.#chain.length, new Date().toISOString(), this.#pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.#difficulty);

    console.log('Block successfully mined!');
    this.#chain.push(block);

    this.#pendingTransactions = [];
    this.#pendingBalances = {};

    return block;
  }

  /**
   * Add a new transaction to the pending transactions
   * @function addTransaction
   * @param {Transaction} transaction
   */
  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }

    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    if (transaction.amount <= 0) {
      throw new Error('Transaction amount should be higher than 0');
    }

    if (this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount) {
      throw new Error('Not enough balance');
    }

    // Update pending balance to prevent double spending
    if (typeof this.#pendingBalances[transaction.fromAddress] == 'undefined') {
      this.#pendingBalances[transaction.fromAddress] = this.getBalanceOfAddress(transaction.fromAddress);
    }

    if (this.#pendingBalances[transaction.fromAddress] - transaction.amount < 0){
      throw new Error('Not enough balance');
    }

    this.#pendingBalances[transaction.fromAddress] = this.#pendingBalances[transaction.fromAddress] - transaction.amount;

    this.#pendingTransactions.push(transaction);
  }

  /**
   * Check if a block is valid
   * @function isBlockValid
   * @param {Block} newBlock
   * @returns {boolean} True if the block is valid, false otherwise
   */
  isBlockValid(newBlock) {
    if (this.getLatestBlock().index + 1 !== newBlock.index) {
      return false;
    } else if (this.getLatestBlock().hash !== newBlock.previousHash) {
      return false;
    } else if (newBlock.calculateHash() !== newBlock.hash) {
      return false;
    }
    return true;
  }

  /**
   * Check if the chain is valid
   * @function isChainValid
   * @returns {boolean} True if the chain is valid, false otherwise
   */
  isChainValid() {
    for (let i = 1; i < this.#chain.length; i++) {
      const currentBlock = this.#chain[i];
      const previousBlock = this.#chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}









/**
 * Singleton class for the Blockchain
 * @class BlockchainSingleton
 * @exports BlockchainSingleton
 */
class BlockchainSingleton {

  /**
   * Create a Singleton Blockchain
   * @constructor
   */
  constructor() {
    if (!BlockchainSingleton.instance) {
      BlockchainSingleton.instance = new Blockchain();
    }
  }

  /**
   * Get the Singleton Blockchain Instance
   * @function getInstance
   * @returns { Blockchain } The Singleton Blockchain Instance
   */
  getInstance() {
    return BlockchainSingleton.instance;
  }
}

module.exports.Blockchain = BlockchainSingleton;
