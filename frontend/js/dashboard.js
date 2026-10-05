let abaAtualConsulta = 'saidas';
window.filtroConsultaAtualDash = { label: 'todos', start_date: null, end_date: null, prev_start: null, prev_end: null };

const FILTROS_PERIODO_DASH = [
    { label: 'hoje',   texto: 'Hoje',           icone: '📍' },
    { label: 'semana', texto: 'Esta Semana',    icone: '📅' },
    { label: 'mes',    texto: 'Este mês',       icone: '🎯' },
    { label: 'todos',  texto: 'Todo o Período', icone: '📋' }
];

const CARREGADORES_ABA = {
    saidas: () => carregarSaidasDashboard(),
    faltas: () => carregarFaltasComFiltro(),
    pontos: () => carregarPontosComFiltro(),
    geral:  () => carregarRankingGeral()
};

/* ---------- utilitários ---------- */

function esc(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Datas "YYYY-MM-DD" devem ser lidas como horário local, senão o fuso (UTC-3) recua um dia.
function parseData(str) {
    if (!str) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const [a, m, d] = str.split('-').map(Number);
        return new Date(a, m - 1, d);
    }
    return new Date(String(str).replace(' ', 'T'));
}

function inicioDoDia(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function fimDoDia(d)    { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999); }

function capitalizar(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function fmtData(d)     { return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); }
function fmtDataLonga(d){ return capitalizar(d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })); }
function fmtHora(d)     { return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }
function fmtNum(n, casas = 1) { return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: casas }); }

function calcularDuracao(dataSaidaStr, dataRetornoStr) {
    try {
        const dataSaida = new Date(dataSaidaStr.replace(' ', 'T'));
        const dataRetorno = new Date(dataRetornoStr.replace(' ', 'T'));
        const minutos = Math.floor((dataRetorno - dataSaida) / (1000 * 60));
        return Math.max(0, minutos);
    } catch (e) {
        return 0;
    }
}

function filtrarPorPeriodo(lista, campo, inicio, fim) {
    if (!inicio || !fim) return lista;
    return lista.filter(item => {
        const d = parseData(item[campo]);
        return d && d >= inicio && d <= fim;
    });
}

// Médias e ranking consideram só alunos; se o perfil não vier na API, usa todos.
function somenteAlunos(usuarios) {
    const alunos = usuarios.filter(u => String(u.ds_perfil || '').toLowerCase() === 'aluno');
    return alunos.length ? alunos : usuarios;
}

function iniciais(nome) {
    return String(nome || '?').trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('');
}

function avatarHTML(nome, tamanho = 36) {
    return `<span class="dash-avatar" style="--size:${tamanho}px;background:${corPorTexto(nome || '?')}">${esc(iniciais(nome))}</span>`;
}

/* ---------- componentes ---------- */

function deltaHTML(atual, anterior, inverso = false) {
    const f = window.filtroConsultaAtualDash;
    if (!f.prev_start || anterior === null || anterior === undefined) return '';
    if (anterior === 0 && atual === 0) return '<span class="kpi-delta neutro">= período anterior</span>';
    if (anterior === 0) return '<span class="kpi-delta neutro">novo no período</span>';
    const variacao = ((atual - anterior) / anterior) * 100;
    if (Math.abs(variacao) < 0.5) return '<span class="kpi-delta neutro">= período anterior</span>';
    const subiu = variacao > 0;
    const bom = inverso ? !subiu : subiu;
    return `<span class="kpi-delta ${bom ? 'bom' : 'ruim'}">${subiu ? '▲' : '▼'} ${fmtNum(Math.abs(variacao), 0)}% vs anterior</span>`;
}

function kpiHTML({ icone, rotulo, valor, sub = '', delta = '', tom = 'blue', texto = false }) {
    return `
        <div class="kpi" data-tone="${tom}">
            <div class="kpi-icon">${icone}</div>
            <div class="kpi-body">
                <div class="kpi-label">${rotulo}</div>
                <div class="kpi-value ${texto ? 'texto' : ''}" title="${texto ? esc(valor) : ''}">${valor}</div>
                ${sub ? `<div class="kpi-sub">${sub}</div>` : ''}
                ${delta}
            </div>
        </div>`;
}

function kpisHTML(lista) {
    return `<div class="kpi-grid">${lista.map(kpiHTML).join('')}</div>`;
}

function tituloSecaoHTML(texto, extra = '') {
    return `<div class="dash-section-title"><span>${texto}</span>${extra ? `<small>${extra}</small>` : ''}</div>`;
}

function barraHTML(percentual, tom = 'blue') {
    return `<div class="dash-bar" data-tone="${tom}"><span style="width:${Math.max(0, Math.min(100, percentual))}%"></span></div>`;
}

function estadoVazioHTML(icone, titulo, dica) {
    return `
        <div class="dash-empty">
            <div class="dash-empty-icon">${icone}</div>
            <strong>${titulo}</strong>
            <p>${dica}</p>
        </div>`;
}

function skeletonHTML(linhas = 3) {
    return `
        <div class="kpi-grid">${'<div class="skeleton dash-skel-kpi"></div>'.repeat(4)}</div>
        <div class="dash-skel-list">${'<div class="skeleton"></div>'.repeat(linhas)}</div>`;
}

function erroHTML(msg) {
    return `<div class="dash-error">⚠️ ${esc(msg)}</div>`;
}

/* ---------- período ---------- */

function calcularPeriodo(label) {
    const hoje = new Date();
    let start = null, end = null, prevStart = null, prevEnd = null;

    if (label === 'hoje') {
        start = inicioDoDia(hoje); end = fimDoDia(hoje);
        const ontem = new Date(start); ontem.setDate(ontem.getDate() - 1);
        prevStart = inicioDoDia(ontem); prevEnd = fimDoDia(ontem);
    } else if (label === 'semana') {
        const dia = hoje.getDay();
        const segunda = new Date(hoje); segunda.setDate(hoje.getDate() - (dia === 0 ? 6 : dia - 1));
        start = inicioDoDia(segunda); end = fimDoDia(hoje);
        prevEnd = new Date(start.getTime() - 1);
        prevStart = inicioDoDia(new Date(prevEnd.getTime() - 6 * 86400000));
    } else if (label === 'mes') {
        start = new Date(hoje.getFullYear(), hoje.getMonth(), 1); end = fimDoDia(hoje);
        prevEnd = new Date(start.getTime() - 1);
        prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), 1);
    }

    return { label, start_date: start, end_date: end, prev_start: prevStart, prev_end: prevEnd };
}

function textoPeriodo() {
    const f = window.filtroConsultaAtualDash;
    if (!f.start_date) return 'Todos os registros';
    if (f.label === 'hoje') return fmtDataLonga(f.start_date);
    return `${fmtData(f.start_date)} – ${fmtData(f.end_date)}`;
}

function renderChipsDash() {
    const chips = document.getElementById('dashChips');
    const texto = document.getElementById('dashPeriodoTexto');
    if (!chips) return;
    chips.innerHTML = FILTROS_PERIODO_DASH.map(f => `
        <button type="button" class="dash-chip ${window.filtroConsultaAtualDash.label === f.label ? 'active' : ''}"
                onclick="aplicarFiltroConsultaDash('${f.label}')" aria-pressed="${window.filtroConsultaAtualDash.label === f.label}">
            <span class="dash-chip-icon">${f.icone}</span>${f.texto}
        </button>`).join('');
    if (texto) texto.textContent = textoPeriodo();
}

function aplicarFiltroConsultaDash(label) {
    window.filtroConsultaAtualDash = calcularPeriodo(label);
    renderChipsDash();
    (CARREGADORES_ABA[abaAtualConsulta] || CARREGADORES_ABA.saidas)();
}

/* ---------- navegação ---------- */

function inicializarDashboardConsultas() {
    renderChipsDash();
    (CARREGADORES_ABA[abaAtualConsulta] || CARREGADORES_ABA.saidas)();
}

function mudarAbaConsulta(aba, btn) {
    abaAtualConsulta = aba;

    document.querySelectorAll('.aba-consulta').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.dash-tab').forEach(el => {
        el.classList.toggle('active', el.dataset.tab === aba);
        el.setAttribute('aria-selected', el.dataset.tab === aba);
    });

    const mapa = { saidas: 'abasSaidase', faltas: 'abasFaltas', pontos: 'abasPontos', geral: 'abasGeral' };
    const alvo = document.getElementById(mapa[aba]);
    if (alvo) alvo.style.display = 'block';

    (CARREGADORES_ABA[aba] || CARREGADORES_ABA.saidas)();
}

/* ---------- SAÍDAS ---------- */

async function carregarSaidasDashboard() {
    const container = document.getElementById('saidasContainer');
    container.innerHTML = skeletonHTML();

    try {
        const [respSaidas, respRetornos, respUsers] = await Promise.all([
            fetch(`${API_BASE}/saidas/`),
            fetch(`${API_BASE}/retornos/`),
            fetch(`${API_BASE}/usuarios/`)
        ]);
        if (!respSaidas.ok) throw new Error('Não foi possível carregar as saídas.');
        const todas = await respSaidas.json();
        const todosRetornos = respRetornos.ok ? await respRetornos.json() : [];
        const usuarios = respUsers.ok ? await respUsers.json() : [];
        const userMap = Object.fromEntries(usuarios.map(u => [u.id_usuario, u.nome]));
        const f = window.filtroConsultaAtualDash;

        const saidas = filtrarPorPeriodo(todas, 'data_saida', f.start_date, f.end_date);
        const anteriores = f.prev_start ? filtrarPorPeriodo(todas, 'data_saida', f.prev_start, f.prev_end) : null;

        if (saidas.length === 0) {
            container.innerHTML = estadoVazioHTML('🏖️', 'Nenhuma saída no período', 'Experimente ampliar o período no filtro acima.');
            return;
        }

        // Cria mapa de retornos por id_saida
        const retornoMap = Object.fromEntries(todosRetornos.map(r => [r.id_saida, r]));

        // Calcula tempo fora por aluno
        const porAluno = {};
        const porMotivo = {};
        let totalMinutosGeral = 0;

        saidas.forEach(s => {
            const retorno = retornoMap[s.id_saida];
            const duracao = retorno ? calcularDuracao(s.data_saida, retorno.data_retorno) : 0;

            if (!porAluno[s.id_usuario]) {
                porAluno[s.id_usuario] = { quantidade: 0, minutos: 0 };
            }
            porAluno[s.id_usuario].quantidade += 1;
            porAluno[s.id_usuario].minutos += duracao;
            totalMinutosGeral += duracao;

            const m = (s.motivo || 'Não informado').trim();
            porMotivo[m] = (porMotivo[m] || 0) + 1;
        });

        // Ordena por tempo fora (decrescente), depois por quantidade
        const rankAlunos = Object.entries(porAluno)
            .map(([id, dados]) => [id, dados.quantidade, dados.minutos])
            .sort((a, b) => b[2] - a[2] || b[1] - a[1]);

        const totalAlunos = Math.max(1, somenteAlunos(usuarios).length);
        const [topId, topQtd, topMinutos] = rankAlunos[0];
        const [motivoTop, motivoQtd] = Object.entries(porMotivo).sort((a, b) => b[1] - a[1])[0];
        const maxMinutos = topMinutos || 1;
        const horasGerais = Math.floor(totalMinutosGeral / 60);
        const minutosGerais = totalMinutosGeral % 60;

        let html = kpisHTML([
            { icone: '📤', rotulo: 'Total de saídas', valor: saidas.length, delta: deltaHTML(saidas.length, anteriores?.length, true), tom: 'amber' },
            { icone: '⏱️', rotulo: 'Tempo total fora', valor: `${horasGerais}h ${minutosGerais}min`, sub: `${totalMinutosGeral} minutos`, tom: 'rose' },
            { icone: '👥', rotulo: 'Alunos com saída', valor: rankAlunos.length, sub: `de ${totalAlunos} alunos`, tom: 'cyan' },
            { icone: '💬', rotulo: 'Motivo mais comum', valor: esc(motivoTop), sub: `${motivoQtd}× · ${fmtNum(motivoQtd / saidas.length * 100, 0)}% do total`, tom: 'violet', texto: true }
        ]);

        html += tituloSecaoHTML('Tempo fora por aluno', `${rankAlunos.length} ${rankAlunos.length === 1 ? 'aluno' : 'alunos'}`);
        html += '<div class="dash-ranklist">';
        rankAlunos.slice(0, 8).forEach(([id, qtd, minutos]) => {
            const nome = userMap[id] || 'Desconhecido';
            const horas = Math.floor(minutos / 60);
            const mins = minutos % 60;
            const tempoTexto = horas > 0 ? `${horas}h ${mins}min` : `${mins}min`;
            html += `
                <div class="dash-rankrow" data-aluno-id="${id}" style="cursor: pointer;">
                    ${avatarHTML(nome, 30)}
                    <div class="dash-rankrow-body">
                        <div class="dash-rankrow-head"><span>${esc(nome)}</span><strong>${tempoTexto}</strong><small>${qtd} saída${qtd === 1 ? '' : 's'}</small></div>
                        ${barraHTML(minutos / maxMinutos * 100, 'rose')}
                    </div>
                </div>`;
        });
        html += '</div>';

        // Adiciona event listeners para clique nos alunos
        setTimeout(() => {
            document.querySelectorAll('.dash-ranklist .dash-rankrow').forEach(row => {
                row.addEventListener('click', function() {
                    const alunoId = this.dataset.alunoId;
                    console.log('Clicou no aluno:', alunoId);
                    if (typeof mostrarHistoricoUsuario === 'function') {
                        mostrarHistoricoUsuario(alunoId);
                    } else {
                        alert('Função mostrarHistoricoUsuario não disponível');
                    }
                });
                row.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#f0f0f0';
                });
                row.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = 'transparent';
                });
            });
        }, 100);

        const porDia = {};
        saidas.forEach(s => {
            const d = parseData(s.data_saida);
            const chave = inicioDoDia(d).getTime();
            (porDia[chave] ||= []).push({ ...s, _d: d });
        });

        html += tituloSecaoHTML('Linha do tempo');
        html += '<div class="dash-timeline">';
        Object.keys(porDia).sort((a, b) => b - a).forEach(chave => {
            const itens = porDia[chave].sort((a, b) => b._d - a._d);
            html += `<div class="dash-day"><div class="dash-day-label">${fmtDataLonga(new Date(Number(chave)))}<small>${itens.length}</small></div>`;
            itens.forEach(s => {
                const nome = userMap[s.id_usuario] || s.nome_usuario || 'Desconhecido';
                html += `
                    <div class="dash-event" data-tone="amber" data-saida-id="${s.id_saida}" data-usuario-id="${s.id_usuario}" data-data-saida="${s.data_saida}" style="position: relative;">
                        <time>${fmtHora(s._d)}</time>
                        ${avatarHTML(nome, 32)}
                        <div class="dash-event-body">
                            <strong>${esc(nome)}</strong>
                            <span>${esc(s.motivo || 'Sem motivo informado')}</span>
                        </div>
                        <button class="btn-editar-timeline" data-saida-id="${s.id_saida}" data-usuario-id="${s.id_usuario}" data-data-saida="${s.data_saida}" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: #0066cc; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.3s;">✏️ Editar</button>
                    </div>`;
            });
            html += '</div>';
        });
        html += '</div>';

        container.innerHTML = html;

        // Adiciona event listeners aos botões de edição na timeline
        setTimeout(() => {
            document.querySelectorAll('.btn-editar-timeline').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const usuarioId = this.dataset.usuarioId;
                    const saidaId = this.dataset.saidaId;
                    console.log('✏️ Editar saída:', saidaId, 'de usuário:', usuarioId);
                    // Abre o modal de histórico do usuário
                    if (typeof mostrarHistoricoUsuario === 'function') {
                        mostrarHistoricoUsuario(usuarioId);
                    }
                });
            });
        }, 200);
    } catch (erro) {
        console.error('Erro:', erro);
        container.innerHTML = erroHTML(erro.message || 'Erro ao carregar saídas.');
    }
}

/* ---------- FALTAS ---------- */

async function carregarFaltasComFiltro() {
    const container = document.getElementById('faltasConsultaContainer');
    container.innerHTML = skeletonHTML();

    try {
        const [respFaltas, respUsers] = await Promise.all([fetch(`${API_BASE}/faltas/`), fetch(`${API_BASE}/usuarios/`)]);
        if (!respFaltas.ok) throw new Error('Não foi possível carregar as faltas.');
        const todas = await respFaltas.json();
        const usuarios = respUsers.ok ? await respUsers.json() : [];
        const userMap = Object.fromEntries(usuarios.map(u => [u.id_usuario, u.nome]));
        const f = window.filtroConsultaAtualDash;

        const faltas = filtrarPorPeriodo(todas, 'data_falta', f.start_date, f.end_date);
        const anteriores = f.prev_start ? filtrarPorPeriodo(todas, 'data_falta', f.prev_start, f.prev_end) : null;

        if (faltas.length === 0) {
            container.innerHTML = estadoVazioHTML('🎉', 'Nenhuma falta no período', 'Presença total! Amplie o período para ver o histórico.');
            return;
        }

        const porAluno = {};
        faltas.forEach(fl => (porAluno[fl.id_usuario] ||= []).push(fl));

        const totalAlunos = Math.max(1, somenteAlunos(usuarios).length);
        const alunosComFalta = Object.keys(porAluno).length;
        const semFalta = Math.max(0, totalAlunos - alunosComFalta);
        const justificadas = faltas.filter(fl => (fl.motivo || '').trim()).length;
        const rank = Object.entries(porAluno).sort((a, b) => b[1].length - a[1].length);
        const maxFaltas = rank[0][1].length;

        let html = kpisHTML([
            { icone: '❌', rotulo: 'Total de faltas', valor: faltas.length, delta: deltaHTML(faltas.length, anteriores?.length, true), tom: 'red' },
            { icone: '✅', rotulo: 'Alunos sem falta', valor: `${fmtNum(semFalta / totalAlunos * 100, 0)}%`, sub: `${semFalta} de ${totalAlunos} alunos`, tom: 'emerald' },
            { icone: '📝', rotulo: 'Justificadas', valor: `${fmtNum(justificadas / faltas.length * 100, 0)}%`, sub: `${justificadas} com motivo · ${faltas.length - justificadas} sem`, tom: 'blue' },
            { icone: '🔝', rotulo: 'Mais faltas', valor: esc(userMap[rank[0][0]] || 'Desconhecido'), sub: `${maxFaltas} ${maxFaltas === 1 ? 'falta' : 'faltas'}`, tom: 'rose', texto: true }
        ]);

        html += tituloSecaoHTML('Faltas por aluno', `${alunosComFalta} ${alunosComFalta === 1 ? 'aluno' : 'alunos'}`);
        html += '<div class="dash-cards">';
        rank.forEach(([id, lista]) => {
            const nome = userMap[id] || 'Desconhecido';
            const just = lista.filter(fl => (fl.motivo || '').trim()).length;
            const datas = lista.map(fl => parseData(fl.data_falta)).sort((a, b) => b - a);
            html += `
                <div class="dash-card" data-tone="red">
                    <div class="dash-card-head">
                        ${avatarHTML(nome)}
                        <div class="dash-card-title">
                            <strong>${esc(nome)}</strong>
                            <span>${fmtNum(lista.length / faltas.length * 100, 0)}% das faltas do período</span>
                        </div>
                        <div class="dash-card-number">${lista.length}</div>
                    </div>
                    ${barraHTML(lista.length / maxFaltas * 100, 'red')}
                    <div class="dash-card-meta">
                        <span>📝 ${just} justificada${just === 1 ? '' : 's'}</span>
                        <span>⚠️ ${lista.length - just} sem motivo</span>
                    </div>
                    <div class="dash-tags">
                        ${datas.slice(0, 4).map(d => `<span class="dash-tag">${fmtData(d)}</span>`).join('')}
                        ${datas.length > 4 ? `<span class="dash-tag more">+${datas.length - 4}</span>` : ''}
                    </div>
                </div>`;
        });
        html += '</div>';

        container.innerHTML = html;
    } catch (erro) {
        console.error('Erro:', erro);
        container.innerHTML = erroHTML(erro.message || 'Erro ao carregar faltas.');
    }
}

/* ---------- PONTOS ---------- */

async function popularDisciplinasDashboard() {
    const select = document.getElementById('filtroDisciplinaConsultaMain');
    if (!select || select.options.length > 0) return;
    try {
        const resp = await fetch(`${API_BASE}/disciplinas/`);
        if (!resp.ok) return;
        const disciplinas = await resp.json();
        select.innerHTML = '<option value="">Todas as disciplinas</option>' +
            disciplinas.map(d => `<option value="${d.id_disciplina}">${esc(d.descricao)}</option>`).join('');
    } catch (e) { console.error(e); }
}

async function carregarPontosComFiltro() {
    const container = document.getElementById('pontosConsultaContainer');
    const bimestre = document.getElementById('filtroBimestreConsultaMain')?.value || '';
    const disciplina = document.getElementById('filtroDisciplinaConsultaMain')?.value || '';
    container.innerHTML = skeletonHTML();

    try {
        await popularDisciplinasDashboard();

        const url = bimestre ? `${API_BASE}/atividades/bimestre/${bimestre}` : `${API_BASE}/atividades/`;
        const [respAtv, respUsers, respDisc] = await Promise.all([fetch(url), fetch(`${API_BASE}/usuarios/`), fetch(`${API_BASE}/disciplinas/`)]);
        if (!respAtv.ok) throw new Error('Não foi possível carregar as atividades.');
        let atividades = await respAtv.json();
        const usuarios = respUsers.ok ? await respUsers.json() : [];
        const disciplinas = respDisc.ok ? await respDisc.json() : [];
        const userMap = Object.fromEntries(usuarios.map(u => [u.id_usuario, u.nome]));
        const discMap = Object.fromEntries(disciplinas.map(d => [d.id_disciplina, d.descricao]));
        const f = window.filtroConsultaAtualDash;

        if (disciplina) atividades = atividades.filter(a => a.id_disciplina === parseInt(disciplina));
        const anteriores = f.prev_start ? filtrarPorPeriodo(atividades, 'data_atividade', f.prev_start, f.prev_end) : null;
        atividades = filtrarPorPeriodo(atividades, 'data_atividade', f.start_date, f.end_date);

        if (atividades.length === 0) {
            container.innerHTML = estadoVazioHTML('📭', 'Nenhuma atividade encontrada', 'Ajuste o período, o bimestre ou a disciplina para ver os pontos.');
            return;
        }

        const porAluno = {};
        const porDisciplina = {};
        let totalPontos = 0;
        atividades.forEach(a => {
            const al = (porAluno[a.id_usuario] ||= { total: 0, qtd: 0, disc: {} });
            al.total += a.pontos; al.qtd += 1;
            const dd = (al.disc[a.id_disciplina] ||= { pontos: 0, qtd: 0 });
            dd.pontos += a.pontos; dd.qtd += 1;

            const pd = (porDisciplina[a.id_disciplina] ||= { pontos: 0, qtd: 0 });
            pd.pontos += a.pontos; pd.qtd += 1;
            totalPontos += a.pontos;
        });

        const rank = Object.entries(porAluno).sort((a, b) => b[1].total - a[1].total);
        const maxTotal = rank[0][1].total || 1;
        const discDestaque = Object.entries(porDisciplina).sort((a, b) => (b[1].pontos / b[1].qtd) - (a[1].pontos / a[1].qtd))[0];
        const pontosAnteriores = anteriores ? anteriores.reduce((s, a) => s + a.pontos, 0) : null;

        let html = kpisHTML([
            { icone: '⭐', rotulo: 'Total de pontos', valor: fmtNum(totalPontos), sub: `${atividades.length} atividade${atividades.length === 1 ? '' : 's'}`, delta: deltaHTML(totalPontos, pontosAnteriores), tom: 'blue' },
            { icone: '📊', rotulo: 'Média por aluno', valor: fmtNum(totalPontos / rank.length), sub: `${rank.length} aluno${rank.length === 1 ? '' : 's'} com pontos`, tom: 'violet' },
            { icone: '🏆', rotulo: 'Maior pontuação', valor: esc(userMap[rank[0][0]] || 'Desconhecido'), sub: `${fmtNum(rank[0][1].total)} pontos`, tom: 'emerald', texto: true },
            { icone: '📚', rotulo: 'Disciplina destaque', valor: esc(discMap[discDestaque[0]] || 'Desconhecida'), sub: `média ${fmtNum(discDestaque[1].pontos / discDestaque[1].qtd)} por atividade`, tom: 'amber', texto: true }
        ]);

        html += tituloSecaoHTML('Pontuação por aluno', `${rank.length} ${rank.length === 1 ? 'aluno' : 'alunos'}`);
        html += '<div class="dash-cards">';
        rank.forEach(([id, dados]) => {
            const nome = userMap[id] || 'Desconhecido';
            const discs = Object.entries(dados.disc).sort((a, b) => b[1].pontos - a[1].pontos);
            const maxDisc = discs[0][1].pontos || 1;
            html += `
                <div class="dash-card" data-tone="blue">
                    <div class="dash-card-head">
                        ${avatarHTML(nome)}
                        <div class="dash-card-title">
                            <strong>${esc(nome)}</strong>
                            <span>${dados.qtd} atividade${dados.qtd === 1 ? '' : 's'} · média ${fmtNum(dados.total / dados.qtd)}</span>
                        </div>
                        <div class="dash-card-number">${fmtNum(dados.total)}</div>
                    </div>
                    ${barraHTML(dados.total / maxTotal * 100, 'blue')}
                    <div class="dash-minilist">
                        ${discs.map(([idD, dd]) => `
                            <div class="dash-minirow">
                                <span class="dash-minirow-label">${esc(discMap[idD] || 'Desconhecida')}</span>
                                ${barraHTML(dd.pontos / maxDisc * 100, 'violet')}
                                <span class="dash-minirow-value">${fmtNum(dd.pontos)}</span>
                            </div>`).join('')}
                    </div>
                </div>`;
        });
        html += '</div>';

        container.innerHTML = html;
    } catch (erro) {
        console.error('Erro:', erro);
        container.innerHTML = erroHTML(erro.message || 'Erro ao carregar pontos.');
    }
}

/* ---------- RANKING GERAL ---------- */

async function carregarRankingGeral() {
    const container = document.getElementById('rankingGeralContainer');
    container.innerHTML = skeletonHTML(5);

    try {
        const f = window.filtroConsultaAtualDash;

        // Constrói query string para os filtros
        const params = new URLSearchParams();
        if (f.periodo && f.periodo > 0) params.append('periodo', f.periodo);
        if (f.mes_atual) params.append('mes_atual', 'true');
        if (f.start_date) params.append('start_date', f.start_date);
        if (f.end_date) params.append('end_date', f.end_date);

        // Busca dados do relatório (que já calcula tempo de saídas)
        const [respRelatorios, respFaltas, respAtv] = await Promise.all([
            fetch(`${API_BASE}/relatorios/geral${params.size ? ('?' + params) : ''}`),
            fetch(`${API_BASE}/faltas/`),
            fetch(`${API_BASE}/atividades/`)
        ]);

        const relatorios = respRelatorios.ok ? await respRelatorios.json() : { usuarios: [] };
        const faltas = filtrarPorPeriodo(respFaltas.ok ? await respFaltas.json() : [], 'data_falta', f.start_date, f.end_date);
        const atividades = filtrarPorPeriodo(respAtv.ok ? await respAtv.json() : [], 'data_atividade', f.start_date, f.end_date);

        const usuarios = relatorios.usuarios || [];

        if (usuarios.length === 0) {
            container.innerHTML = estadoVazioHTML('👥', 'Nenhum aluno cadastrado', 'Cadastre alunos para gerar o ranking.');
            return;
        }

        const ranking = somenteAlunos(usuarios).map(u => {
            const tempo_minutos = (u.total_horas * 60) + u.total_minutos;
            const tempo_horas = tempo_minutos / 60;
            const fl = faltas.filter(x => x.id_usuario === u.id_usuario).length;
            const p = atividades.filter(x => x.id_usuario === u.id_usuario).reduce((acc, a) => acc + a.pontos, 0);

            // Score com pesos iguais (25% cada critério):
            // 1. Quantidade de Saídas: quanto mais, pior (10 - quantidade)
            // 2. Tempo Fora: quanto mais, pior (10 - horas)
            // 3. Faltas: quanto mais, pior (10 - faltas)
            // 4. Pontos: quanto mais, melhor (pontos ÷ 10)
            const scoreQtdSaidas = Math.max(0, 10 - u.total_saidas);
            const scoreTempo = Math.max(0, 10 - tempo_horas);
            const scoreFaltas = Math.max(0, 10 - fl);
            const scorePontos = p / 10;

            const score = scoreQtdSaidas + scoreTempo + scoreFaltas + scorePontos;

            return {
                nome: u.nome,
                saidas: u.total_saidas,
                tempo_horas: tempo_horas,
                tempo_formatado: u.tempo_formatado,
                faltas: fl,
                pontos: p,
                scoreQtdSaidas,
                scoreTempo,
                scoreFaltas,
                scorePontos,
                score
            };
        }).sort((a, b) => b.score - a.score || a.nome.localeCompare(b.nome));

        let posicao = 1;
        ranking.forEach((al, idx) => {
            if (idx > 0 && al.score !== ranking[idx - 1].score) posicao = idx + 1;
            al.posicao = posicao;
        });

        const scores = ranking.map(r => r.score);
        const maxScore = Math.max(...scores), minScore = Math.min(...scores);
        const mediaScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const pct = s => maxScore === minScore ? 100 : Math.round(((s - minScore) / (maxScore - minScore)) * 100);

        const classePodio = p => p === 1 ? 'ouro' : p === 2 ? 'prata' : 'bronze';
        const medalha = p => p === 1 ? '🥇' : p === 2 ? '🥈' : p === 3 ? '🥉' : '';

        // Empatados dividem o mesmo degrau; com 4 empatados em 1º, por exemplo, só existe o degrau "1º".
        const degraus = {};
        ranking.filter(al => al.posicao <= 3).forEach(al => (degraus[al.posicao] ||= []).push(al));
        const slots = Object.keys(degraus).map(Number).sort((a, b) => a - b);
        const ordemPodio = slots.length === 3 ? [slots[1], slots[0], slots[2]] : slots;

        const slotHTML = pos => {
            const grupo = degraus[pos];
            const avatares = grupo.slice(0, 3).map(al => avatarHTML(al.nome, 48)).join('') +
                (grupo.length > 3 ? `<span class="dash-avatar podium-more" style="--size:48px">+${grupo.length - 3}</span>` : '');
            const nome = grupo.length === 1
                ? `<strong class="podium-name" title="${esc(grupo[0].nome)}">${esc(grupo[0].nome)}</strong>`
                : `<strong class="podium-name">${grupo.length} alunos empatados</strong>
                   <span class="podium-names" title="${esc(grupo.map(a => a.nome).join(', '))}">${esc(grupo.map(a => a.nome.split(' ')[0]).join(', '))}</span>`;
            return `
                <div class="podium-slot ${classePodio(pos)}">
                    <div class="podium-medal">${medalha(pos)}</div>
                    <div class="podium-avatars">${avatares}</div>
                    ${nome}
                    <span class="podium-score">${fmtNum(grupo[0].score)} pts</span>
                    <div class="podium-base">${pos}º</div>
                </div>`;
        };

        let html = `
            <div class="dash-podium" data-slots="${slots.length}">${ordemPodio.map(slotHTML).join('')}</div>
            <div class="dash-strip">
                <div><small>Alunos avaliados</small><strong>${ranking.length}</strong></div>
                <div><small>Média de pontuação</small><strong>${fmtNum(mediaScore)}</strong></div>
                <div><small>Melhor pontuação</small><strong>${fmtNum(maxScore)}</strong></div>
                <div class="dash-strip-info"><small>Como é calculado</small><code>(10−qtd saídas) + (10−tempo) + (10−faltas) + (pontos÷10)</code></div>
            </div>`;

        html += tituloSecaoHTML('Classificação completa', 'empates compartilham a mesma posição');
        html += '<div class="dash-ranking">';
        ranking.forEach(al => {
            const p = pct(al.score);
            html += `
                <div class="rank-row ${al.posicao <= 3 ? classePodio(al.posicao) : ''}">
                    <div class="rank-pos">${medalha(al.posicao) || `<span>${al.posicao}º</span>`}</div>
                    ${avatarHTML(al.nome, 40)}
                    <div class="rank-body">
                        <div class="rank-head">
                            <strong>${esc(al.nome)}</strong>
                            <span class="rank-score">${fmtNum(al.score)} pts</span>
                        </div>
                        ${barraHTML(p, 'blue')}
                        <div class="rank-stats">
                            <span title="Pontos em atividades">⭐ ${fmtNum(al.pontos, 0)}</span>
                            <span title="Faltas">❌ ${al.faltas}</span>
                            <span title="Tempo fora da sala">⏱️ ${al.tempo_formatado}</span>
                            <span class="rank-pct">${p}%</span>
                        </div>
                    </div>
                </div>`;
        });
        html += '</div>';

        container.innerHTML = html;
    } catch (erro) {
        console.error('Erro:', erro);
        container.innerHTML = erroHTML(erro.message || 'Erro ao carregar ranking geral.');
    }
}
