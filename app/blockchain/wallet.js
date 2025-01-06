const { ec } = require('elliptic');
const EC = new ec('secp256k1');

/**
 * Wallet class
 * @class Wallet
 * @exports Wallet
 */
class Wallet {
    #keyPair = null;
    #publicKey = null;
    #privateKey = null;

    /**
     * Create a new wallet
     * @constructor
     * @param {string} privateKey
     */
    constructor(privateKey = null){
        if(privateKey){
            this.#privateKey = privateKey;
            this.#keyPair = EC.keyFromPrivate(this.#privateKey);
            this.#publicKey = this.#keyPair.getPublic('hex');
        }else{
            this.#keyPair = EC.genKeyPair();
            this.#publicKey = this.#keyPair.getPublic('hex');
            this.#privateKey = this.#keyPair.getPrivate('hex');
        }
    }

    /**
     * Get the key pair
     * @function getKeyPair
     * @returns {Object} The keyPair
     */
    getKeyPair(){
        return this.#keyPair;
    }

    /**
     * Get the address
     * @function getAddress
     * @returns {string} Public Key of wallet
     */
    getAddress(){
        return this.#publicKey;
    }

    /**
     * Get the private key
     * @function getPrivateKey
     * @returns {string} Private Key of wallet
     */
    getPrivateKey(){
        return this.#privateKey;
    }

}

module.exports.Wallet = Wallet;