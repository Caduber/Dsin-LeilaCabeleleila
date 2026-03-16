const alerta = document.getElementById('alerta');
const tipoCliente = document.getElementById('tipoCliente');
const campoBusca = document.getElementById('campoBusca');
const campoNovoCliente = document.getElementById('campoNovoCliente');
const clienteSelecionado = document.getElementById('clienteSelecionado');
const etapaDataHora = document.getElementById('etapa-data-hora');
const tituloEtapa = document.getElementById('tituloEtapa');

let clienteAtual = null;

function mostrarAlerta(msg, tipo = 'sucesso') {
  alerta.textContent = msg;
  alerta.className = 'alerta alerta-' + tipo;
  alerta.style.display = 'block';
}
function esconderAlerta() {
  alerta.style.display = 'none';
}

tipoCliente.addEventListener('change', () => {
  const isNovo = tipoCliente.value === 'novo';
  campoBusca.style.display = isNovo ? 'none' : 'block';
  campoNovoCliente.style.display = isNovo ? 'block' : 'none';
  clienteSelecionado.style.display = 'none';
  clienteAtual = null;
  esconderAlerta();
});

document.getElementById('btnBuscarCliente').addEventListener('click', async () => {
  esconderAlerta();
  const cpf = document.getElementById('cpfBusca').value.replace(/\D/g, '');
  if (!cpf) {
    mostrarAlerta('Informe o CPF para buscar.', 'aviso');
    return;
  }
  try {
    const clientes = await api.clientes.listar();
    const cliente = clientes.find(c => String(c.cli_cpf).replace(/\D/g, '') === cpf);
    if (!cliente) {
      mostrarAlerta('Nenhum cliente encontrado com este CPF. Cadastre como novo cliente.', 'aviso');
      return;
    }
    clienteAtual = cliente;
    document.getElementById('nomeClienteSel').textContent = cliente.cli_nome;
    document.getElementById('cpfClienteSel').textContent = cliente.cli_cpf || '';
    document.getElementById('telClienteSel').textContent = cliente.cli_telefone;
    clienteSelecionado.style.display = 'block';
    campoBusca.style.display = 'none';
    mostrarAlerta('Cliente encontrado! Preencha data e horário abaixo.', 'sucesso');
    mostrarEtapaDataHora();
    verificarAvisoSemana(cliente.cli_id);
  } catch (e) {
    mostrarAlerta('Busca falhou. Motivo: ' + (e.data?.message || e.message || 'verifique se a API está em http://localhost:8080'), 'erro');
  }
});

document.getElementById('btnCadastrarCliente').addEventListener('click', async () => {
  esconderAlerta();
  const nome = document.getElementById('nomeNovo').value.trim();
  const cpf = document.getElementById('cpfNovo').value.replace(/\D/g, '');
  const telefone = document.getElementById('telefoneNovo').value.trim();
  if (!nome || !cpf || !telefone) {
    mostrarAlerta('Preencha nome, CPF e telefone.', 'aviso');
    return;
  }
  try {
    await api.clientes.cadastrar(nome, cpf, telefone);
    const clientes = await api.clientes.listar();
    const cliente = clientes.find(c => String(c.cli_cpf).replace(/\D/g, '') === cpf);
    if (!cliente) {
      mostrarAlerta('Cliente cadastrado, mas não foi possível carregar. Tente buscar pelo CPF.', 'aviso');
      return;
    }
    clienteAtual = cliente;
    document.getElementById('nomeClienteSel').textContent = cliente.cli_nome;
    document.getElementById('cpfClienteSel').textContent = cliente.cli_cpf || '';
    document.getElementById('telClienteSel').textContent = cliente.cli_telefone;
    clienteSelecionado.style.display = 'block';
    campoNovoCliente.style.display = 'none';
    document.getElementById('nomeNovo').value = '';
    document.getElementById('cpfNovo').value = '';
    document.getElementById('telefoneNovo').value = '';
    mostrarAlerta('Cliente cadastrado com sucesso! Escolha data e horário.', 'sucesso');
    mostrarEtapaDataHora();
    verificarAvisoSemana(cliente.cli_id);
  } catch (e) {
    mostrarAlerta('Cadastro não realizado. Motivo: ' + (e.data?.message || e.message || 'erro ao cadastrar'), 'erro');
  }
});

document.getElementById('btnTrocarCliente').addEventListener('click', () => {
  clienteAtual = null;
  clienteSelecionado.style.display = 'none';
  document.getElementById('avisoSemana').style.display = 'none';
  document.getElementById('avisoSemana').innerHTML = '';
  campoBusca.style.display = tipoCliente.value === 'novo' ? 'none' : 'block';
  campoNovoCliente.style.display = tipoCliente.value === 'novo' ? 'block' : 'none';
  etapaDataHora.style.display = 'none';
  tituloEtapa.textContent = '1. Cliente';
  esconderAlerta();
});

async function verificarAvisoSemana(cliId) {
  const box = document.getElementById('avisoSemana');
  try {
    const r = await api.agendamentos.verificarSemana(cliId);
    if (r && r.multiplas) {
      box.innerHTML = (r.message || 'Este cliente já possui agendamento nesta semana.') + ' <a href="agendamentos.html">Deseja reagendar? Ver agendamentos</a>';
      box.style.display = 'block';
    } else {
      box.style.display = 'none';
      box.innerHTML = '';
    }
  } catch (e) {
    box.style.display = 'none';
    box.innerHTML = '';
  }
}

function mostrarEtapaDataHora() {
  tituloEtapa.textContent = '2. Data e horário';
  etapaDataHora.style.display = 'block';
}

document.getElementById('btnVoltarCliente').addEventListener('click', () => {
  etapaDataHora.style.display = 'none';
  tituloEtapa.textContent = '1. Cliente';
});

document.getElementById('btnConfirmarAgendamento').addEventListener('click', async () => {
  esconderAlerta();
  if (!clienteAtual) {
    mostrarAlerta('Selecione ou cadastre um cliente primeiro.', 'aviso');
    return;
  }
  const data = document.getElementById('dataAgenda').value;
  const hora = document.getElementById('horaAgenda').value;
  if (!data || !hora) {
    mostrarAlerta('Preencha data e horário.', 'aviso');
    return;
  }
  try {
    const verif = await api.agendamentos.verificarSemana(clienteAtual.cli_id);
    if (verif.multiplas) {
      if (!confirm(verif.message + '\n\nDeseja mesmo criar este agendamento?')) return;
    }
    await api.agendamentos.criar(data, hora, clienteAtual.cli_id);
    mostrarAlerta('Agendamento realizado com sucesso!', 'sucesso');
    document.getElementById('dataAgenda').value = '';
    document.getElementById('horaAgenda').value = '';
    verificarAvisoSemana(clienteAtual.cli_id);
  } catch (e) {
    mostrarAlerta('Agendamento não realizado. Motivo: ' + (e.data?.message || e.message || 'erro ao criar agendamento'), 'erro');
  }
});
