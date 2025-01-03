/* Import Libraries */
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

/* Import Blockchain */
const { Block } = require('./app/blockchain/block');
const { Blockchain } = require('./app/blockchain/blockchain');
let blockchainUtil = require('./app/blockchain/util');

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
const port = process.env.PORT || 3000;

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


/***************
 * Form Actions
***************/

app.get("/", (req, res) => {
  res.render("index", { certificateId: null });
});

app.get("/transaction", (req, res) => {
    res.render("transaction", { txid: null });
});

app.post("/transaction/create", (req, res) => {
    const { sender, recipient, amount } = req.body;
    var newBlock = blockchainUtil.createTransaction(sender, recipient, amount);
    res.render("transaction", { txid: newBlock.transaction.txid });
});

/**
 * @swagger
 * /issue-certificate:
 *  post:
 *      description: Issue a certificate
 *      responses:
 *          200:
 *              description: Success
 * 
 */
app.post("/issue-certificate", (req, res) => {
    const { recipient, certificateName } = req.body;
    const  certificateId = generateCertificateId();
    const newBlock = new Block(
      blockchain.chain.length,
      new Date().toString(),
      { certificateId, recipient, certificateName }
    );
    blockchain.addBlock(newBlock);
    console.log(newBlock);

    res.render("index", { certificateId });
});

app.get("/verify-certificate/", (req, res) => {
    res.render("verify", { isValid: null });
});

app.post("/verify-certificate", (req, res) => {
    const { certificateId } = req.body;
    const block = blockchain.chain.find(
        (block) => block.data.certificateId === certificateId
    );
    const isValid = block !== undefined;
    res.render("verify", { certificateId, isValid });
});

function generateCertificateId() {
    return Math.random().toString(36).substring(2, 10);
}




/* Server start up method */
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
