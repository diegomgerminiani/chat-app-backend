const express = require('express');
const cors = require('cors');
const routes = require('./routes');

class AppController {
    constructor() {
        this.express = express();

        //Middlewares
        this.express.use(express.json());
        this.express.use(express.urlencoded({extended: true}));
        this.express.use(cors({origin: '*'}));
        this.express.use(routes);
    }
}

module.exports = new AppController().express;