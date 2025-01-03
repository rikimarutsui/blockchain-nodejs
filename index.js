/* Import Libraries */
const WebSocket = require('ws');
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

/* Import Blockchain */
const { Blockchain } = require('./app/blockchain/blockchain');

/* Swagger Configuration */
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Blockchain API",
            description: "Blockchain API Information",
            contact: {
                name: "Rikimarutsui"
            },
            servers: ["http://localhost:3000"]
        }
    },
    apis: ["./index.js", "./routes/blockchain.js", "./routes/transaction.js", "./routes/wallet.js"]
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);

/* Server Initialization */
const app = express();
const HTTP_PORT = process.env.PORT || 3000;

/* Initialize API routes */
app.use(express.static(__dirname + "/express/public"));  // Public files
app.use(express.static("public"));                       // Public files
app.set("view engine", "ejs");                           // Express Engine HTML files
app.use(bodyParser.urlencoded({ extended: true }));      // Body Parser

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // Swagger document
app.use('/api/blockchain', require('./routes/blockchain'));
app.use('/api/transaction', require('./routes/transaction'));
app.use('/api/wallet', require('./routes/wallet'));

/* Create a Blockchain */
let blockchain = new Blockchain().getInstance();

/* Create Socket List */
const sockets = [];


/***************
 * Form Actions
***************/
/*app.get("/transaction", (req, res) => {
    res.render("transaction", { txid: null });
});

app.post("/transaction/create", (req, res) => {
    const { sender, recipient, amount } = req.body;
    var newBlock = blockchainUtil.createTransaction(sender, recipient, amount);
    res.render("transaction", { txid: newBlock.transaction.txid });
});*/


/***************
 * Server Startup
 **************/

/* HTTP Server start up method */
app.listen(HTTP_PORT, () => {
  console.log(`Server is running on port ${HTTP_PORT}`);
});


