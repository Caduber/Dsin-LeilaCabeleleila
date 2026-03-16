const express = require('express');
const datefns = require('date-fns');

const sql = require('../db/dbClient');

const getAllAgendamentos = async (req,res) => {
    try {
        const response = await sql`SELECT * FROM agendamentos`;
        res.json(response);
    } catch (error) {
        console.error('Erro na query:', error);
        res.status(500).json({ message: 'Erro ao buscar agendamentos no banco de dados.' });
    }
};

const getAgendamentos = async (req,res) => {
    try {
        const response = await sql`SELECT * FROM agendamentos WHERE cli_id = ${req.params.cli_id}`;
        res.json(response);
    } catch (error) {
        console.error('Erro na query:', error);
        res.status(500).json({ message: 'Erro ao buscar agendamentos no banco de dados' });
    }
}

const insert = async (req, res)=> {
    
    try {
        const response = await sql`INSERT INTO agendamentos (age_data, age_hora, cli_id) VALUES (${req.body.data}, ${req.body.hora}, ${req.body.cli_id})`;
        res.json(response);

    } catch(error) {
        console.error('Erro na query:', error);
        res.status(500).json({ message: 'Erro ao inserir agendamento no banco de dados' })
    }
}

const patch = async (req, res) => {
    try{
        const [agendamento] = await sql`SELECT age_data FROM agendamentos WHERE age_id = ${req.params.age_id}`;

            if (!agendamento) {
                return res.status(404).json({ message: 'Agendamento não encontrado.' });
            }

            const dataAtual = new Date(agendamento.age_data);
            const novaData = new Date(req.body.data);

            const dif = datefns.differenceInDays(novaData, dataAtual);

            if (dif < -2 || dif >= 0) {
                await sql`UPDATE agendamentos SET age_data = ${req.body.data}, age_hora = ${req.body.hora} WHERE age_id = ${req.params.age_id}`;
                res.json({ message: 'Agendamento atualizado com sucesso!' });
            } else {
                res.status(200).json({ message: "A data selecionada está muito próxima, entre em contato por ligação" });
            }

        } catch (error) {
            console.error('Erro na query:', error);
            res.status(500).json({ message: 'Erro ao atualizar agendamento no banco de dados.' });
    }
}

const verifSemana = async(req, res) => {

    try{
        // Regra de negócio: Multiplos agendamentos na semana
        const agendamentos = await sql`SELECT age_data FROM agendamentos WHERE cli_id = ${req.params.cli_id}`;
        let dataAux = new Date(0, 0, 0);
        dataAux = dataAux.setHours(0, 0, 0, 0);

        agendamentos.forEach(agendamento => {
            const data = new Date(agendamento.age_data);
            const dif = datefns.differenceInDays(data, dataAux);

            if ((dif <= 7 && dif >= -7) && dif != 0 ) {
                return res.send({ 
                    multiplas: true,
                    message: 'Já existe um agendamento na semana, deseja agendar os dois no mesmo dia?',
                    data_sugerida: dataAux,
                    data_multipla: data
                });
            }
            else {
                dataAux = data;
            }        
        });
        return res.send({ multiplas: false });
    }catch(error) {
        console.error('Erro ao verificar consultas multiplas:', error);
        res.status(500).json({ message: 'Erro ao verificar consultas multiplas.' });
    }    
}

module.exports = {
    getAllAgendamentos,
    getAgendamentos,
    insert,
    patch,
    verifSemana
}

