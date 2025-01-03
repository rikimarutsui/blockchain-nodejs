/*********
 * Imports
 *********/
const { Block } = require('./block');
const { Transaction } = require('./transaction');


/**
 * @class Blockchain
 * @description Blockchain class
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
   * @constructor
   * @description Create a new blockchain
   * @memberof Blockchain
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
   * @function getClain
   * @description Get the chain
   * @memberof Blockchain
   * @returns  {Array<Block>} The chain
   */
  getClain() {
    return this.#chain;
  }

  /**
   * @function getLatestBlock
   * @description Get the latest block
   * @memberof Blockchain
   * @returns {Block} The latest block
   */
  getLatestBlock() {
    return this.#chain[this.#chain.length - 1];
  }

  /**
   * @function getLength
   * @description Get the length of the chain
   * @memberof Blockchain
   * @returns {number} The length of the chain
   */
  getLength(){
    return this.#chain.length;
  }

  /**
   * @function getBlockByIndex
   * @description Get the block by index
   * @memberof Blockchain
   * @param {number} index 
   * @returns {Block} The block at the given index
   */
  getBlockByIndex(index) {
    return this.#chain[index];
  }

  /**
   * @function getBlockByHash
   * @description Get the block by hash
   * @memberof Blockchain
   * @param {string} hash 
   * @returns {Block} The block with the given hash
   */
  getBlockByHash(hash) {
    return this.#chain.find((block) => block.hash === hash);
  }

  /**
   * @function getPendingTransactions
   * @description Get the pending transactions
   * @memberof Blockchain
   * @returns { Transaction[] } The Pending Transactions Array
   */
  getPendingTransactions(){
    return this.#pendingTransactions;
  }

  /**
   * @function getPendingTransactionsFromAddress
   * @description Get the pending transactions from an address
   * @memberof Blockchain
   * @param { string } fromAddress 
   * @returns { Transaction[] } The Pending Transactions Array from an address
   */
  getPendingTransactionsFromAddress(fromAddress){
    return this.#pendingTransactions.filter((tx) => tx.fromAddress === fromAddress);
  }

  /**
   * @function getPendingTransactionsToAddress
   * @description Get the pending transactions to an address
   * @memberof Blockchain
   * @param { string } toAddress
   * @returns { Transaction[] } The Pending Transactions Array to an address
   */
  getPendingTransactionsToAddress(toAddress){
    return this.#pendingTransactions.filter((tx) => tx.toAddress === toAddress);
  }

  /**
   * @function getPendingBalances
   * @description Get the pending balances
   * @memberof Blockchain
   * @returns {Object} The pending balances
   */
  getPendingBalances(){
    return this.#pendingBalances;
  }

  /**
   * @function getPendingBalanceByFromAddress
   * @description Get the pending balance by from address
   * @memberof Blockchain
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
   * @function getBalanceOfAddress
   * @description Get the balance of an address
   * @memberof Blockchain
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
   * @function getAllTransactionsOfAddress
   * @description Get all transactions for a wallet
   * @memberof Blockchain
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
   * @function getTransactionByTxid
   * @description Get the transaction by txid
   * @memberof Blockchain
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
   * @function #createGenesisBlock
   * @description Create the genesis block
   * @memberof Blockchain
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
   * @function addBlock
   * @description Add a new block to the chain
   * @memberof Blockchain
   * @param {Block} newBlock 
   */
  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.#difficulty);
    this.#chain.push(newBlock);
  }


  /**
   * @function minePendingTransactions
   * @description  Mine pending transactions and add a new block to the chain
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
   * @function addTransaction
   * @description Add a new transaction to the pending transactions
   * @memberof Blockchain
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
   * @function isChainValid
   * @description  Check if the chain is valid
   * @memberof Blockchain
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
 * @class BlockchainSingleton
 * @description Singleton class for the Blockchain
 * @exports BlockchainSingleton
 */
class BlockchainSingleton {
  constructor() {
    if (!BlockchainSingleton.instance) {
      BlockchainSingleton.instance = new Blockchain();
    }
  }

  getInstance() {
    return BlockchainSingleton.instance;
  }
}

module.exports.Blockchain = BlockchainSingleton;
