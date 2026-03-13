const express = require('express');

const router = express.Router();

const routesClientes = require('./routesClientes');
const routesAgendamentos = require('./routesAgendamentos');

router.use('/clientes', routesClientes);
router.use('/agendamentos', routesAgendamentos);

module.exports = router;