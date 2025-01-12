/* Import Libraries */
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

/* Import P2P Server */
const P2PServer = require('./app/network/P2PServer');

/* Import Blockchain */
const { Blockchain } = require('./app/blockchain/blockchain');

/* Server Initialization */
const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 3000;

/* Swagger Configuration */
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Blockchain API",
            description: "Blockchain API Information",
            contact: {
                name: "Rikimarutsui"
            },
            servers: ["http://localhost:" + HTTP_PORT]
        }
    },
    apis: ["./index.js", "./routes/blockchain.js", "./routes/transaction.js", "./routes/wallet.js"]
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);



/* Initialize API routes */
app.use(express.static(__dirname + "/express/public"));  // Public files
app.use(express.static("public"));                       // Public files
app.set("view engine", "ejs");                           // Express Engine HTML files
app.use(bodyParser.urlencoded({ extended: true }));      // Body Parser
app.use(bodyParser.json());                              // Body Parser

app.use('/jsdoc', express.static('out'));                // JSDoc
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // Swagger document
app.use('/api/blockchain', require('./routes/blockchain'));
app.use('/api/transaction', require('./routes/transaction'));
app.use('/api/wallet', require('./routes/wallet'));

/* Create a Blockchain */
let blockchain = new Blockchain().getInstance();

/* Create P2P Server */
const p2pServer = new P2PServer().getInstance();

/* Create Socket List */
const sockets = [];

/***************
 * Form Actions
***************/
app.get("/createWallet", (req, res) => {
    res.render("createWallet", { address: null, privateKey: null });
})

app.post("/wallet/create", (req, res) => {
    return new Promise((resolve, reject) => {
        request(req.protocol + '://' + req.get('host') + '/api/wallet/create', { json: true }, (err, res, body) => {
            if (err) { reject(err); }
            resolve(body);
        });
    }).then((body) => {
        res.render("createWallet", { address: body.address, privateKey: body.privateKey });
    }).catch((err) => {
        console.log(err);
    }); 
});


app.get("/transaction", (req, res) => {
    res.render("transaction");
});


app.post("/transaction/create", (req, res) => {
    const { sender, privateKey, recipient, amount, message } = req.body;
    return new Promise((resolve, reject) => {
        request.post(req.protocol + '://' + req.get('host') + '/api/wallet/send', 
        {   json: true, 
            body: { sender, recipient, amount, privateKey, message } 
        }, (err, res, body) => {
            if (err) { reject(err); }
            resolve(body);
        });
    }).then((body) => {
        res.render("transactionDetail", {
            sender: sender,
            recipient: recipient,
            amount: amount,
            message: message,
            tx: body.tx,
            signature: body.signature
        });
    }).catch((err) => {
        console.log(err);
    });
});


/***************
 * Server Startup
 **************/

/* HTTP Server start up method */
app.listen(HTTP_PORT, () => {
  console.log(`Server is running on port ${HTTP_PORT}`);
});


const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
peers.forEach(peer => p2pServer.connectToPeer(peer));