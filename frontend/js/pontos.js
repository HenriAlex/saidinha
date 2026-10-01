window.filtroPontosAtual = { label: 'todos', start_date: null, end_date: null };

const FILTROS_PERIODO_CONSULTA = [
    { label: 'hoje', texto: '📍 Hoje', isHoje: true },
    { label: 'semana', texto: '📅 Esta Semana', isSemana: true },
    { label: 'mes', texto: '🎯 Este mês', mes_atual: true },
    { label: 'todos', texto: '📋 Todo o Período' }
];

function aplicarFiltroConsultaPontos(label) {
    const filtro = FILTROS_PERIODO_CONSULTA.find(f => f.label === label) || FILTROS_PERIODO_CONSULTA[3];
    const hoje = new Date();
    let start_date = null, end_date = null;

    if (filtro.isHoje) {
        start_date = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        end_date = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
    } else if (filtro.isSemana) {
        const dia = hoje.getDay();
        const diff = hoje.getDate() - dia + (dia === 0 ? -6 : 1);
        start_date = new Date(hoje.getFullYear(), hoje.getMonth(), diff);
        end_date = hoje;
    } else if (filtro.mes_atual) {
        start_date = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        end_date = hoje;
    }

    window.filtroPontosAtual = {
        label: filtro.label,
        start_date: start_date,
        end_date: end_date || hoje
    };

    document.querySelectorAll('.filtro-chip-consulta').forEach(btn => {
        btn.style.background = '#f3f4f6';
        btn.style.color = '#6b7280';
    });
    event.target.style.background = '#dbeafe';
    event.target.style.color = '#3b82f6';

    carregarConsultaPontos();
}

async function carregarSelectsPontos() {
    try {
        const respDiscipl = await fetch(`${API_BASE}/disciplinas/`);

        if (respDiscipl.ok) {
            const disciplinas = await respDiscipl.json();
            const selectDisc = document.getElementById('selectDisciplinaConsulta');
            selectDisc.innerHTML = '<option value="">Todas as disciplinas</option>';
            disciplinas.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.id_disciplina;
                opt.textContent = d.descricao;
                selectDisc.appendChild(opt);
            });
        }
    } catch (erro) {
        console.error('Erro ao carregar disciplinas:', erro);
    }
}

async function carregarConsultaPontos() {
    const container = document.getElementById('pontosContainer');
    const bimestre = document.getElementById('selectBimestreConsulta').value;
    const idDisciplina = document.getElementById('selectDisciplinaConsulta').value;

    if (!bimestre) {
        showToast('Por favor, selecione um bimestre.', 'error');
        return;
    }

    container.innerHTML = '<div style="text-align:center;padding:20px;">⏳ Carregando...</div>';

    try {
        let url = `${API_BASE}/atividades/bimestre/${bimestre}`;
        const resposta = await fetch(url);

        if (!resposta.ok) throw new Error('Erro ao carregar atividades');
        let atividades = await resposta.json();

        if (idDisciplina) {
            atividades = atividades.filter(a => a.id_disciplina === parseInt(idDisciplina));
        }

        if (window.filtroPontosAtual.start_date && window.filtroPontosAtual.end_date) {
            atividades = atividades.filter(a => {
                const dataAtividade = new Date(a.data_atividade);
                return dataAtividade >= window.filtroPontosAtual.start_date && dataAtividade <= window.filtroPontosAtual.end_date;
            });
        }

        const [respUsers, respDiscipl] = await Promise.all([
            fetch(`${API_BASE}/usuarios/`),
            fetch(`${API_BASE}/disciplinas/`)
        ]);

        const usuarios = respUsers.ok ? await respUsers.json() : [];
        const disciplinas = respDiscipl.ok ? await respDiscipl.json() : [];

        const userMap = usuarios.reduce((m, u) => { m[u.id_usuario] = u; return m; }, {});
        const discMap = disciplinas.reduce((m, d) => { m[d.id_disciplina] = d.descricao; return m; }, {});

        let html = '<div style="margin-bottom: 16px;">';
        html += FILTROS_PERIODO_CONSULTA.map(f =>
            `<button class="filtro-chip-consulta" onclick="aplicarFiltroConsultaPontos('${f.label}')" style="padding: 8px 16px; border: none; border-radius: 20px; cursor: pointer; margin-right: 8px; font-size: 13px; margin-bottom: 8px; background: ${window.filtroPontosAtual.label === f.label ? '#dbeafe' : '#f3f4f6'}; color: ${window.filtroPontosAtual.label === f.label ? '#3b82f6' : '#6b7280'}; font-weight: 600;">${f.texto}</button>`
        ).join('');
        html += '</div>';

        if (!atividades || atividades.length === 0) {
            html += '<div style="text-align:center;padding:20px;color:#666;">Nenhuma atividade encontrada para este bimestre.</div>';
            container.innerHTML = html;
            return;
        }

        const pontosPorAlunoDisc = {};
        atividades.forEach(a => {
            const key = `${a.id_usuario}-${a.id_disciplina}`;
            if (!pontosPorAlunoDisc[key]) {
                pontosPorAlunoDisc[key] = {
                    usuario: userMap[a.id_usuario]?.nome || 'Desconhecido',
                    disciplina: discMap[a.id_disciplina] || 'Desconhecida',
                    pontos: 0,
                    atividades: []
                };
            }
            pontosPorAlunoDisc[key].pontos += a.pontos;
            pontosPorAlunoDisc[key].atividades.push(a);
        });

        const dados = Object.values(pontosPorAlunoDisc);
        const porAluno = {};
        dados.forEach(d => {
            if (!porAluno[d.usuario]) porAluno[d.usuario] = [];
            porAluno[d.usuario].push(d);
        });

        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        container.innerHTML = '';
        container.appendChild(wrapper);

        for (const [nomeAluno, disciplinas] of Object.entries(porAluno)) {
            const secao = document.createElement('div');
            secao.style.marginBottom = '20px';

            const titulo = document.createElement('h3');
            titulo.style.marginBottom = '12px';
            titulo.textContent = `👤 ${nomeAluno}`;
            secao.appendChild(titulo);

            const tabela = document.createElement('div');
            tabela.style.overflow = 'auto';

            const tabelaHTML = `
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <thead>
                        <tr style="background:#f0f0f0;border-bottom:2px solid #ddd;">
                            <th style="padding:10px;text-align:left;">Disciplina</th>
                            <th style="padding:10px;text-align:center;">Total Pontos</th>
                            <th style="padding:10px;text-align:center;">Atividades</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${disciplinas.map(d => `
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:10px;">📚 ${d.disciplina}</td>
                                <td style="padding:10px;text-align:center;font-weight:bold;color:#3b82f6;">⭐ ${d.pontos.toFixed(1)}</td>
                                <td style="padding:10px;text-align:center;">${d.atividades.length}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            tabela.innerHTML = tabelaHTML;
            secao.appendChild(tabela);
            container.appendChild(secao);
        }

    } catch (erro) {
        console.error('Erro:', erro);
        container.innerHTML = '<div style="color:#dc2626;padding:20px;">Erro ao carregar consulta de pontos.</div>';
    }
}
