const express = require('express');

const controller = require("../controllers/clienteController");
const router = express.Router();

router.get('/', controller.getAllClientes);

router.get('/:id', controller.getClientes);

router.post('/insert', controller.insert);

module.exports = router;