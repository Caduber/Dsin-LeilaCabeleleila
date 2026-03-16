(function() {
  const box = document.getElementById('avisoSemanaInicio');
  function mesmaSemana(s1, s2) {
    const d1 = new Date(String(s1).split('T')[0] + 'T12:00:00');
    const d2 = new Date(String(s2).split('T')[0] + 'T12:00:00');
    if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return false;
    const seg = 86400000;
    const segSemana = 7 * seg;
    const ini1 = d1.getTime() - (d1.getDay() * seg);
    const ini2 = d2.getTime() - (d2.getDay() * seg);
    return Math.abs(ini1 - ini2) < segSemana;
  }
  Promise.all([api.agendamentos.listarTodos(), api.clientes.listar()])
    .then(function(res) {
      const agendamentos = res[0];
      const clientes = res[1];
      const porCliente = {};
      agendamentos.forEach(function(a) {
        if (!porCliente[a.cli_id]) porCliente[a.cli_id] = [];
        porCliente[a.cli_id].push(a);
      });
      let temMultiplo = false;
      Object.keys(porCliente).forEach(function(cliId) {
        const list = porCliente[cliId];
        if (list.length < 2) return;
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            if (mesmaSemana(list[i].age_data, list[j].age_data)) {
              temMultiplo = true;
              return;
            }
          }
        }
      });
      if (temMultiplo) {
        box.innerHTML = 'Existem clientes com mais de um agendamento na mesma semana. <a href="agendamentos.html">Deseja reagendar? Ver agendamentos</a>';
        box.style.display = 'block';
      }
    })
    .catch(function() {});
})();
