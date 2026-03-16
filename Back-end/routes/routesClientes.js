const express = require('express');

const controller = require("../controllers/clienteController");
const router = express.Router();

router.get('/', controller.getAllClientes);

router.get('/:cpf', controller.getClientes);

router.post('/insert', controller.insert);

module.exports = router;