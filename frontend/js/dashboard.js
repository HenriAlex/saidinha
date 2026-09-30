let abaAtualConsulta = 'saidas';

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

async function carregarSaidasDashboard() {
    const container = document.getElementById('saidasContainer');
    container.innerHTML = '<div style="text-align:center;padding:20px;">⏳ Carregando...</div>';

    try {
        const resposta = await fetch(`${API_BASE}/saidas/`);
        if (!resposta.ok) throw new Error('Erro ao carregar saídas');
        const saidas = await resposta.json();

        const respUsers = await fetch(`${API_BASE}/usuarios/`);
        const usuarios = respUsers.ok ? await respUsers.json() : [];
        const userMap = usuarios.reduce((m, u) => { m[u.id_usuario] = u.nome; return m; }, {});

        if (!saidas || saidas.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:20px;color:#666;">Nenhuma saída registrada.</div>';
            return;
        }

        const saidasAgrupadas = {};
        saidas.forEach(s => {
            const chave = `${s.id_usuario}-${s.id_saida}`;
            saidasAgrupadas[chave] = s;
        });

        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">';

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
    const filtro = document.getElementById('filtroDataFaltas').value;
    container.innerHTML = '<div style="text-align:center;padding:20px;">⏳ Carregando...</div>';

    try {
        const resposta = await fetch(`${API_BASE}/faltas/`);
        if (!resposta.ok) throw new Error('Erro ao carregar faltas');
        let faltas = await resposta.json();

        if (filtro) {
            const dias = parseInt(filtro);
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() - dias);

            faltas = faltas.filter(f => new Date(f.data_falta) >= dataLimite);
        }

        const respUsers = await fetch(`${API_BASE}/usuarios/`);
        const usuarios = respUsers.ok ? await respUsers.json() : [];
        const userMap = usuarios.reduce((m, u) => { m[u.id_usuario] = u.nome; return m; }, {});

        if (!faltas || faltas.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:20px;color:#666;">Nenhuma falta registrada neste período.</div>';
            return;
        }

        const faltasAgrupadas = {};
        faltas.forEach(f => {
            if (!faltasAgrupadas[f.id_usuario]) {
                faltasAgrupadas[f.id_usuario] = [];
            }
            faltasAgrupadas[f.id_usuario].push(f);
        });

        let html = '';

        Object.entries(faltasAgrupadas).forEach(([idUser, faltasList]) => {
            const nomePessoa = userMap[idUser] || 'Desconhecido';
            const totalFaltas = faltasList.length;

            html += `
                <div style="margin-bottom: 16px; background: #fff; border-radius: 8px; padding: 12px; border: 1px solid #e6e9f0;">
                    <div style="font-weight: 600; margin-bottom: 10px; color: #161821;">
                        👤 ${nomePessoa}
                        <span style="float: right; background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-size: 12px;">❌ ${totalFaltas} falta${totalFaltas > 1 ? 's' : ''}</span>
                    </div>
                    <div style="display: grid; gap: 6px;">
                        ${faltasList.map(f => `
                            <div style="font-size: 12px; color: #666; padding: 6px; background: #f8f9fa; border-radius: 4px;">
                                📅 ${new Date(f.data_falta).toLocaleDateString('pt-BR')} ${f.motivo ? `• ${f.motivo}` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

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
        let url = `${API_BASE}/atividades/bimestre/${bimestre}`;
        const resposta = await fetch(url);
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

        let html = '';
        for (const [nomeAluno, disciplinasList] of Object.entries(porAluno)) {
            const totalPontos = disciplinasList.reduce((s, d) => s + d.pontos, 0);

            html += `
                <div style="margin-bottom: 16px; background: #fff; border-radius: 8px; padding: 12px; border: 1px solid #e6e9f0;">
                    <div style="font-weight: 600; margin-bottom: 10px; color: #161821;">
                        👤 ${nomeAluno}
                        <span style="float: right; background: #dbeafe; color: #3b82f6; padding: 4px 8px; border-radius: 4px; font-size: 12px;">⭐ ${totalPontos.toFixed(1)} pts</span>
                    </div>
                    <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #f0f0f0;">
                            <th style="text-align: left; padding: 6px; color: #666;">Disciplina</th>
                            <th style="text-align: center; padding: 6px; color: #666;">Pontos</th>
                            <th style="text-align: center; padding: 6px; color: #666;">Atividades</th>
                        </tr>
                        ${disciplinasList.map(d => `
                            <tr style="border-bottom: 1px solid #f0f0f0;">
                                <td style="padding: 6px;">📚 ${d.disciplina}</td>
                                <td style="text-align: center; padding: 6px; font-weight: 600; color: #3b82f6;">${d.pontos.toFixed(1)}</td>
                                <td style="text-align: center; padding: 6px;">${d.atividades}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            `;
        }

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

        ranking.forEach((aluno, idx) => {
            const medalhas = ['🥇', '🥈', '🥉'];
            const medalha = idx < 3 ? medalhas[idx] : '•';

            const corBg = idx === 0 ? '#fef3c7' : idx === 1 ? '#f3f4f6' : idx === 2 ? '#fed7aa' : '#fff';
            const corBorda = idx === 0 ? '#f59e0b' : idx === 1 ? '#9ca3af' : idx === 2 ? '#f97316' : '#e5e7eb';

            const indicePorcentual = ((ranking.length - idx) / ranking.length * 100).toFixed(0);

            html += `
                <div style="background: ${corBg}; border: 2px solid ${corBorda}; border-radius: 8px; padding: 16px; position: relative; overflow: hidden;">
                    <div style="position: absolute; right: 0; top: 0; width: 60px; height: 60px; background: linear-gradient(135deg, ${corBorda}33 0%, transparent 100%);"></div>

                    <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 16px; align-items: center; position: relative; z-index: 1;">
                        <div style="font-size: 32px;">${medalha}</div>

                        <div>
                            <div style="font-weight: 700; font-size: 16px; color: #161821; margin-bottom: 6px;">
                                ${idx + 1}º - ${aluno.nome}
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
        });

        html += '</div>';
        container.innerHTML = html;

    } catch (erro) {
        console.error('Erro:', erro);
        container.innerHTML = '<div style="color:#dc2626;padding:20px;">Erro ao carregar ranking geral.</div>';
    }
}
