let abaAtualConsulta = 'saidas';
window.filtroConsultaAtualDash = { periodo: 0, mes_atual: false, start_date: null, end_date: null, label: 'todos' };

const FILTROS_PERIODO_DASH = [
    { label: 'todos', texto: '📋 Todo o período', periodo: 0, mes_atual: false },
    { label: '7', texto: '📅 Últimos 7 dias', periodo: 7, mes_atual: false },
    { label: '15', texto: '🗓️ Últimos 15 dias', periodo: 15, mes_atual: false },
    { label: '30', texto: '📆 Últimos 30 dias', periodo: 30, mes_atual: false },
    { label: 'mes', texto: '🎯 Este mês', periodo: 0, mes_atual: true }
];

function mudarAbaConsulta(aba) {
    abaAtualConsulta = aba;

    document.querySelectorAll('.aba-consulta').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.style.color = '#6b7280';
        el.style.borderBottom = '3px solid transparent';
    });

    const mapa = {
        'saidas': 'abasSaidase',
        'faltas': 'abasFaltas',
        'pontos': 'abasPontos',
        'geral': 'abasGeral'
    };

    document.getElementById(mapa[aba]).style.display = 'block';
    event.target.style.color = '#3b82f6';
    event.target.style.borderBottom = '3px solid #3b82f6';

    if (aba === 'saidas') carregarSaidasDashboard();
    else if (aba === 'faltas') carregarFaltasComFiltro();
    else if (aba === 'pontos') carregarPontosComFiltro();
    else if (aba === 'geral') carregarRankingGeral();
}

function aplicarFiltroConsultaDash(label) {
    const filtro = FILTROS_PERIODO_DASH.find(f => f.label === label) || FILTROS_PERIODO_DASH[0];
    const hoje = new Date();
    let start_date = null, end_date = null;

    if (filtro.periodo > 0) {
        start_date = new Date(hoje);
        start_date.setDate(start_date.getDate() - filtro.periodo);
    }

    if (filtro.mes_atual) {
        start_date = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        end_date = hoje;
    }

    window.filtroConsultaAtualDash = {
        periodo: filtro.periodo,
        mes_atual: filtro.mes_atual,
        start_date: start_date,
        end_date: end_date || hoje,
        label: filtro.label
    };

    document.querySelectorAll('.filtro-chip-dash').forEach(btn => {
        btn.style.background = '#f3f4f6';
        btn.style.color = '#6b7280';
    });
    event.target.style.background = '#dbeafe';
    event.target.style.color = '#3b82f6';

    if (abaAtualConsulta === 'saidas') carregarSaidasDashboard();
    else if (abaAtualConsulta === 'faltas') carregarFaltasComFiltro();
}

async function carregarSaidasDashboard() {
    const container = document.getElementById('saidasContainer');
    container.innerHTML = '<div style="text-align:center;padding:20px;">⏳ Carregando...</div>';

    try {
        const resposta = await fetch(`${API_BASE}/saidas/`);
        if (!resposta.ok) throw new Error('Erro ao carregar saídas');
        let saidas = await resposta.json();

        const filtro = window.filtroConsultaAtualDash;
        if (filtro.periodo > 0 || filtro.mes_atual) {
            saidas = saidas.filter(s => {
                const dataSaida = new Date(s.data_saida);
                return dataSaida >= filtro.start_date && dataSaida <= filtro.end_date;
            });
        }

        const respUsers = await fetch(`${API_BASE}/usuarios/`);
        const usuarios = respUsers.ok ? await respUsers.json() : [];
        const userMap = usuarios.reduce((m, u) => { m[u.id_usuario] = u.nome; return m; }, {});

        if (!saidas || saidas.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:20px;color:#666;">Nenhuma saída registrada neste período.</div>';
            return;
        }

        let html = '<div style="margin-bottom: 16px;">';
        html += FILTROS_PERIODO_DASH.map(f =>
            `<button class="filtro-chip-dash" onclick="aplicarFiltroConsultaDash('${f.label}')" style="padding: 8px 16px; border: none; border-radius: 20px; cursor: pointer; margin-right: 8px; font-size: 13px; margin-bottom: 8px; background: ${window.filtroConsultaAtualDash.label === f.label ? '#dbeafe' : '#f3f4f6'}; color: ${window.filtroConsultaAtualDash.label === f.label ? '#3b82f6' : '#6b7280'}; font-weight: 600;">${f.texto}</button>`
        ).join('');
        html += '</div>';

        const saidasAgrupadas = {};
        saidas.forEach(s => {
            const chave = `${s.id_usuario}-${s.id_saida}`;
            saidasAgrupadas[chave] = s;
        });

        html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">';

        Object.values(saidasAgrupadas).forEach(s => {
            const nomePessoa = userMap[s.id_usuario] || 'Desconhecido';
            const data = new Date(s.data_saida).toLocaleDateString('pt-BR');

            html += `
                <div style="background: #f8f9fa; border-radius: 8px; padding: 12px; border-left: 4px solid #f59e0b;">
                    <div style="font-weight: 600; margin-bottom: 6px;">👤 ${nomePessoa}</div>
                    <div style="font-size: 13px; color: #666; margin-bottom: 4px;">📅 ${data}</div>
                    <div style="font-size: 13px; color: #666;">📝 ${s.motivo}</div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

    } catch (erro) {
        console.error('Erro:', erro);
        container.innerHTML = '<div style="color:#dc2626;padding:20px;">Erro ao carregar saídas.</div>';
    }
}

async function carregarFaltasComFiltro() {
    const container = document.getElementById('faltasConsultaContainer');
    container.innerHTML = '<div style="text-align:center;padding:20px;">⏳ Carregando...</div>';

    try {
        const resposta = await fetch(`${API_BASE}/faltas/`);
        if (!resposta.ok) throw new Error('Erro ao carregar faltas');
        let faltas = await resposta.json();

        const filtro = window.filtroConsultaAtualDash;
        if (filtro.periodo > 0 || filtro.mes_atual) {
            faltas = faltas.filter(f => {
                const dataFalta = new Date(f.data_falta);
                return dataFalta >= filtro.start_date && dataFalta <= filtro.end_date;
            });
        }

        const respUsers = await fetch(`${API_BASE}/usuarios/`);
        const usuarios = respUsers.ok ? await respUsers.json() : [];
        const userMap = usuarios.reduce((m, u) => { m[u.id_usuario] = u.nome; return m; }, {});

        if (!faltas || faltas.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:20px;color:#666;">Nenhuma falta registrada neste período.</div>';
            return;
        }

        let html = '<div style="margin-bottom: 16px;">';
        html += FILTROS_PERIODO_DASH.map(f =>
            `<button class="filtro-chip-dash" onclick="aplicarFiltroConsultaDash('${f.label}')" style="padding: 8px 16px; border: none; border-radius: 20px; cursor: pointer; margin-right: 8px; font-size: 13px; margin-bottom: 8px; background: ${window.filtroConsultaAtualDash.label === f.label ? '#dbeafe' : '#f3f4f6'}; color: ${window.filtroConsultaAtualDash.label === f.label ? '#3b82f6' : '#6b7280'}; font-weight: 600;">${f.texto}</button>`
        ).join('');
        html += '</div>';

        const faltasAgrupadas = {};
        faltas.forEach(f => {
            if (!faltasAgrupadas[f.id_usuario]) {
                faltasAgrupadas[f.id_usuario] = [];
            }
            faltasAgrupadas[f.id_usuario].push(f);
        });

        html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">';

        Object.entries(faltasAgrupadas).forEach(([idUser, faltasList]) => {
            const nomePessoa = userMap[idUser] || 'Desconhecido';
            const totalFaltas = faltasList.length;
            const mediaFaltas = (totalFaltas / (new Date().getDate())).toFixed(1);

            html += `
                <div style="background: #fff; border-radius: 8px; padding: 12px; border: 2px solid #fee2e2;">
                    <div style="font-weight: 600; margin-bottom: 8px; color: #161821;">👤 ${nomePessoa}</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                        <div style="background: #fee2e2; padding: 8px; border-radius: 6px; text-align: center;">
                            <div style="font-weight: 700; color: #dc2626;">❌ ${totalFaltas}</div>
                            <div style="font-size: 11px; color: #666;">Total</div>
                        </div>
                        <div style="background: #fef3c7; padding: 8px; border-radius: 6px; text-align: center;">
                            <div style="font-weight: 700; color: #f59e0b;">📊 ${mediaFaltas}</div>
                            <div style="font-size: 11px; color: #666;">Média</div>
                        </div>
                    </div>
                    <div style="font-size: 12px; color: #666; max-height: 80px; overflow-y: auto;">
                        ${faltasList.slice(0, 3).map(f => `📅 ${new Date(f.data_falta).toLocaleDateString('pt-BR')}`).join(' • ')}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

    } catch (erro) {
        console.error('Erro:', erro);
        container.innerHTML = '<div style="color:#dc2626;padding:20px;">Erro ao carregar faltas.</div>';
    }
}

async function carregarPontosComFiltro() {
    const container = document.getElementById('pontosConsultaContainer');
    const bimestre = document.getElementById('filtroBimestreConsultaMain').value;
    const disciplina = document.getElementById('filtroDisciplinaConsultaMain').value;

    if (!document.getElementById('filtroDisciplinaConsultaMain').innerHTML) {
        const respDiscipl = await fetch(`${API_BASE}/disciplinas/`);
        if (respDiscipl.ok) {
            const disciplinas = await respDiscipl.json();
            const selectDisc = document.getElementById('filtroDisciplinaConsultaMain');
            selectDisc.innerHTML = '<option value="">Todas as disciplinas</option>';
            disciplinas.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.id_disciplina;
                opt.textContent = d.descricao;
                selectDisc.appendChild(opt);
            });
        }
    }

    if (!bimestre) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:#999;">Selecione um bimestre para visualizar os pontos.</div>';
        return;
    }

    container.innerHTML = '<div style="text-align:center;padding:20px;">⏳ Carregando...</div>';

    try {
        const resposta = await fetch(`${API_BASE}/atividades/bimestre/${bimestre}`);
        if (!resposta.ok) throw new Error('Erro ao carregar atividades');
        let atividades = await resposta.json();

        if (disciplina) {
            atividades = atividades.filter(a => a.id_disciplina === parseInt(disciplina));
        }

        const [respUsers, respDiscipl] = await Promise.all([
            fetch(`${API_BASE}/usuarios/`),
            fetch(`${API_BASE}/disciplinas/`)
        ]);

        const usuarios = respUsers.ok ? await respUsers.json() : [];
        const disciplinas = respDiscipl.ok ? await respDiscipl.json() : [];

        const userMap = usuarios.reduce((m, u) => { m[u.id_usuario] = u; return m; }, {});
        const discMap = disciplinas.reduce((m, d) => { m[d.id_disciplina] = d.descricao; return m; }, {});

        if (!atividades || atividades.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:20px;color:#666;">Nenhuma atividade encontrada para este bimestre.</div>';
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
                    atividades: 0
                };
            }
            pontosPorAlunoDisc[key].pontos += a.pontos;
            pontosPorAlunoDisc[key].atividades += 1;
        });

        const porAluno = {};
        Object.values(pontosPorAlunoDisc).forEach(d => {
            if (!porAluno[d.usuario]) porAluno[d.usuario] = [];
            porAluno[d.usuario].push(d);
        });

        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">';

        Object.entries(porAluno).forEach(([nomeAluno, disciplinasList]) => {
            const totalPontos = disciplinasList.reduce((s, d) => s + d.pontos, 0);
            const mediaPontos = (totalPontos / disciplinasList.length).toFixed(1);

            html += `
                <div style="background: #fff; border-radius: 8px; padding: 12px; border: 2px solid #dbeafe;">
                    <div style="font-weight: 600; margin-bottom: 8px; color: #161821;">👤 ${nomeAluno}</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                        <div style="background: #dbeafe; padding: 8px; border-radius: 6px; text-align: center;">
                            <div style="font-weight: 700; color: #3b82f6;">⭐ ${totalPontos.toFixed(1)}</div>
                            <div style="font-size: 11px; color: #666;">Total</div>
                        </div>
                        <div style="background: #e0e7ff; padding: 8px; border-radius: 6px; text-align: center;">
                            <div style="font-weight: 700; color: #6366f1;">📊 ${mediaPontos}</div>
                            <div style="font-size: 11px; color: #666;">Média</div>
                        </div>
                    </div>
                    <div style="font-size: 12px; color: #666;">
                        ${disciplinasList.map(d => `📚 ${d.disciplina} (${d.atividades})`).join(' • ')}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

    } catch (erro) {
        console.error('Erro:', erro);
        container.innerHTML = '<div style="color:#dc2626;padding:20px;">Erro ao carregar pontos.</div>';
    }
}

async function carregarRankingGeral() {
    const container = document.getElementById('rankingGeralContainer');
    container.innerHTML = '<div style="text-align:center;padding:20px;">⏳ Carregando ranking...</div>';

    try {
        const [respUsers, respSaidas, respFaltas, respAtividades] = await Promise.all([
            fetch(`${API_BASE}/usuarios/`),
            fetch(`${API_BASE}/saidas/`),
            fetch(`${API_BASE}/faltas/`),
            fetch(`${API_BASE}/atividades/`)
        ]);

        const usuarios = respUsers.ok ? await respUsers.json() : [];
        const saidas = respSaidas.ok ? await respSaidas.json() : [];
        const faltas = respFaltas.ok ? await respFaltas.json() : [];
        const atividades = respAtividades.ok ? await respAtividades.json() : [];

        const ranking = usuarios.map(u => {
            const totalSaidas = saidas.filter(s => s.id_usuario === u.id_usuario).length;
            const totalFaltas = faltas.filter(f => f.id_usuario === u.id_usuario).length;
            const totalAtividades = atividades.filter(a => a.id_usuario === u.id_usuario).length;
            const totalPontos = atividades
                .filter(a => a.id_usuario === u.id_usuario)
                .reduce((s, a) => s + a.pontos, 0);

            return {
                nome: u.nome,
                saidas: totalSaidas,
                faltas: totalFaltas,
                atividades: totalAtividades,
                pontos: totalPontos,
                score: (10 - totalFaltas) + totalAtividades + (10 - totalSaidas) + (totalPontos / 10)
            };
        }).sort((a, b) => b.score - a.score);

        let html = '<div style="display: grid; gap: 12px;">';
        let posicao = 1;
        let scoreAnterior = null;

        const maxScore = Math.max(...ranking.map(r => r.score));
        const minScore = Math.min(...ranking.map(r => r.score));

        ranking.forEach((aluno, idx) => {
            if (scoreAnterior !== null && aluno.score !== scoreAnterior) {
                posicao = idx + 1;
            }

            const medalhas = ['🥇', '🥈', '🥉'];
            const medalha = posicao <= 3 ? medalhas[posicao - 1] : '•';

            const corBg = posicao === 1 ? '#fef3c7' : posicao === 2 ? '#f3f4f6' : posicao === 3 ? '#fed7aa' : '#fff';
            const corBorda = posicao === 1 ? '#f59e0b' : posicao === 2 ? '#9ca3af' : posicao === 3 ? '#f97316' : '#e5e7eb';

            const indicePorcentual = maxScore === minScore ?
                Math.round((aluno.score / Math.max(1, maxScore)) * 100) :
                Math.round(((aluno.score - minScore) / (maxScore - minScore)) * 100);

            html += `
                <div style="background: ${corBg}; border: 2px solid ${corBorda}; border-radius: 8px; padding: 16px; position: relative; overflow: hidden;">
                    <div style="position: absolute; right: 0; top: 0; width: 60px; height: 60px; background: linear-gradient(135deg, ${corBorda}33 0%, transparent 100%);"></div>

                    <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 16px; align-items: center; position: relative; z-index: 1;">
                        <div style="font-size: 32px;">${medalha}</div>

                        <div>
                            <div style="font-weight: 700; font-size: 16px; color: #161821; margin-bottom: 6px;">
                                ${posicao}º - ${aluno.nome}
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; font-size: 12px;">
                                <div style="background: rgba(255,255,255,0.6); padding: 6px; border-radius: 4px; text-align: center;">
                                    📚 ${aluno.atividades}<br><span style="color: #666; font-size: 11px;">atividades</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.6); padding: 6px; border-radius: 4px; text-align: center;">
                                    ⭐ ${aluno.pontos.toFixed(0)}<br><span style="color: #666; font-size: 11px;">pontos</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.6); padding: 6px; border-radius: 4px; text-align: center;">
                                    ❌ ${aluno.faltas}<br><span style="color: #666; font-size: 11px;">faltas</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.6); padding: 6px; border-radius: 4px; text-align: center;">
                                    📤 ${aluno.saidas}<br><span style="color: #666; font-size: 11px;">saídas</span>
                                </div>
                            </div>
                        </div>

                        <div style="text-align: right;">
                            <div style="font-size: 28px; font-weight: 700; color: #3b82f6;">${indicePorcentual}%</div>
                            <div style="font-size: 11px; color: #666; margin-top: 4px;">desempenho</div>
                        </div>
                    </div>

                    <div style="margin-top: 12px; background: rgba(255,255,255,0.6); height: 6px; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${indicePorcentual}%; height: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6); border-radius: 3px;"></div>
                    </div>
                </div>
            `;

            scoreAnterior = aluno.score;
        });

        html += '</div>';
        container.innerHTML = html;

    } catch (erro) {
        console.error('Erro:', erro);
        container.innerHTML = '<div style="color:#dc2626;padding:20px;">Erro ao carregar ranking geral.</div>';
    }
}
