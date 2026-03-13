const express = require('express');
const cors = require('cors');
const routes = require('./routes/mainRouter');

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);



app.get('/', (req, res) => {
    res.json({ message: 'Bem-vindo à API da Cabeleleila Leila!' });
});



app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});