const express = require('express');

const router = express.Router();
const sql = require('../db/dbClient');
const agendamentoController = require('../controllers/agendamentoController');

router.get('', async (req, res) => {
// Rota para buscar todos os agendamentos
router.get('', agendamentoController.getAllAgendamentos);

    try {
        const response = await sql`SELECT * FROM agendamentos`;
        res.json(response);
    } catch (error) {
        console.error('Erro na query:', error);
        res.status(500).json({ message: 'Erro ao buscar agendamentos no banco de dados.' });
    }
});
// Rota para inserir um novo agendamento (com regras de negócio no controller)
router.post('/insert', agendamentoController.createAgendamento);

router.post('/insert', async (req, res)=> {
// Rota para atualizar um agendamento
router.patch('/update/:id', agendamentoController.updateAgendamento);

    try {
        const response = await sql`INSERT INTO agendamentos (age_data, age_hora, cli_id) VALUES (${req.body.data}, ${req.body.hora}, ${req.body.cli_id})`;
        res.json({ message: 'Agendamento inserido com sucesso!' });
    } catch (error) {
        console.error('Erro na query:', error);
        res.status(500).json({ message: 'Erro ao inserir agendamento no banco de dados.' });
    }
});

router.patch('/update/:id', async (req, res) => {
    
    try {
        const response = await sql`UPDATE agendamentos SET age_data = ${req.body.data}, age_hora = ${req.body.hora} WHERE age_id = ${req.params.id}`;
        res.json({ message: 'Agendamento atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro na query:', error);
        res.status(500).json({ message: 'Erro ao atualizar agendamento no banco de dados.' });
    }
});


module.exports = router;