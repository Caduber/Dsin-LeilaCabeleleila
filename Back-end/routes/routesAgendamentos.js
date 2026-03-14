const express = require('express');

const app = express();
const router = express.Router();
const controller = require('../controllers/agendamentoController');

router.get('/', controller.getAllAgendamentos);

router.get('/:id', controller.getAgendamentos);

router.post('/insert', controller.insert);

router.patch('/update/:id', controller.patch)


module.exports = router;