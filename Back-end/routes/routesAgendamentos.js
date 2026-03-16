const express = require('express');

const router = express.Router();
const controller = require('../controllers/agendamentoController');

router.get('/', controller.getAllAgendamentos);

router.get('/:cli_id', controller.getAgendamentos);

router.post('/insert', controller.insert);

router.patch('/update/:age_id', controller.patch);

router.get('/verifSemana/:cli_id', controller.verifSemana);

module.exports = router;