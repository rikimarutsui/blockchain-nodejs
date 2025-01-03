const { ec } = require('elliptic');
const EC = new ec('secp256k1');

class Wallet {
    #keyPair = null;
    #publicKey = null;
    #privateKey = null;

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

    getKeyPair(){
        return this.#keyPair;
    }

    getAddress(){
        return this.#publicKey;
    }

    getPrivateKey(){
        return this.#privateKey;
    }

}

module.exports.Wallet = Wallet;