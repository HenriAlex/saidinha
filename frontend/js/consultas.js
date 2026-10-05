/* consultas.js - Dashboard de Relatórios e Consultas
   Local: frontend/js/consultas.js

   Arquivo responsável por exibir estatísticas e relatórios
   de forma criativa e impactante:
   - Total de saídas por aluno
   - Total de horas fora
   - Ranking visual
   - Gráficos e cards com design moderno
*/

const API_RELATORIOS = typeof API_BASE !== 'undefined' ? API_BASE : 'http://127.0.0.1:8000';

function obterDataHojeLocal(){
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

function criarFiltroHoje(){
    const hoje = obterDataHojeLocal();
    return { periodo: 0, mes_atual: false, start_date: hoje, end_date: hoje, label: 'hoje' };
}

function inicializarConsultaPadrao(){
    window.filtroConsultaAtual = criarFiltroHoje();
}

// ============================================================
// CARREGAR ESTATÍSTICAS GERAIS
// ============================================================

// Guarda o filtro de período atualmente selecionado na tela de consultas.
// Formato: { periodo, mes_atual, start_date, end_date, label }
window.filtroConsultaAtual = window.filtroConsultaAtual || criarFiltroHoje();

// Define os filtros fixos exibidos como chips (segmented control).
const FILTROS_PERIODO = [
    { label: 'hoje', texto: '📍 Hoje', periodo: 0, mes_atual: false },
    { label: 'todos', texto: '📋 Todo o período', periodo: 0, mes_atual: false },
    { label: '7', texto: '📅 Últimos 7 dias', periodo: 7, mes_atual: false },
    { label: '15', texto: '🗓️ Últimos 15 dias', periodo: 15, mes_atual: false },
    { label: '30', texto: '📆 Últimos 30 dias', periodo: 30, mes_atual: false },
    { label: 'mes', texto: '🈷️ Mês atual', periodo: 0, mes_atual: true },
];

// Aplica um filtro fixo (chamado pelos botões dos chips).
function aplicarFiltroConsulta(label){
    if (label === 'hoje') {
        window.filtroConsultaAtual = criarFiltroHoje();
    } else {
        const filtro = FILTROS_PERIODO.find(f => f.label === label) || FILTROS_PERIODO[1];
        window.filtroConsultaAtual = { periodo: filtro.periodo, mes_atual: filtro.mes_atual, start_date: null, end_date: null, label: filtro.label };
    }
    carregarEstatisticasGerais();
}

// Aplica um intervalo de datas customizado (inputs de data).
function aplicarFiltroConsultaCustom(){
    const s = document.getElementById('consultaStart').value;
    const e = document.getElementById('consultaEnd').value;
    if (!s){
        if (typeof showToast === 'function') showToast('Informe ao menos a data inicial', 'error');
        else alert('Informe ao menos a data inicial');
        return;
    }
    window.filtroConsultaAtual = { periodo: 0, mes_atual: false, start_date: s, end_date: e || null, label: 'custom' };
    carregarEstatisticasGerais();
}

// Monta a barra de chips de filtro por período, destacando o ativo.
function renderFiltroPeriodoHTML(){
    const atual = window.filtroConsultaAtual;
    let chips = '<div class="period-filter">';
    FILTROS_PERIODO.forEach(f => {
        const ativo = atual.label === f.label ? ' active' : '';
        chips += `<button type="button" class="${ativo.trim()}" onclick="aplicarFiltroConsulta('${f.label}')">${f.texto}</button>`;
    });
    chips += '</div>';

    // Intervalo customizado (complementa os fixos, para quem precisa de algo específico).
    chips += `
        <div class="period-filter-custom">
            <label for="consultaStart">De</label>
            <input type="date" id="consultaStart" value="${atual.start_date || ''}">
            <label for="consultaEnd">Até</label>
            <input type="date" id="consultaEnd" value="${atual.end_date || ''}">
            <button type="button" class="btn ghost" onclick="aplicarFiltroConsultaCustom()">Aplicar intervalo</button>
        </div>
    `;
    return chips;
}

// Carrega estatísticas de todos os usuários, respeitando o filtro de período ativo.
async function carregarEstatisticasGerais(){

    const container = document.getElementById('saidasContainer');

    if (container) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">⏳ Carregando relatórios...</p>';
    }

    try{
        // Monta a query string a partir do filtro de período selecionado.
        const f = window.filtroConsultaAtual;
        const params = new URLSearchParams();
        if (f.periodo && f.periodo > 0) params.append('periodo', f.periodo);
        if (f.mes_atual) params.append('mes_atual', 'true');
        if (f.start_date) params.append('start_date', f.start_date);
        if (f.end_date) params.append('end_date', f.end_date);

        // Busca estatísticas gerais da API.
        // Qualquer perfil logado pode ver o relatório geral (módulo Consulta).
        const url = `${API_RELATORIOS}/relatorios/geral` + (Array.from(params).length ? ('?' + params.toString()) : '');
        const resp = await fetch(url);

        if (!resp.ok) throw new Error('Falha ao carregar estatísticas');

        const dados = await resp.json();

        // SEÇÃO 0: Filtro por período (chips + intervalo customizado)
        let html = renderFiltroPeriodoHTML();

        // SEÇÃO 1: Cards com resumo geral de saídas
        html += `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0 30px;">

                <!-- Card 1: Quantidade Total de Saídas -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="font-size: 14px; opacity: 0.9;">Quantidade de Saídas</div>
                    <div style="font-size: 42px; font-weight: bold; margin: 10px 0;">📤 ${dados.resumo_geral.total_saidas_geral}</div>
                    <div style="font-size: 12px; opacity: 0.8;">${dados.resumo_geral.total_usuarios_com_saidas} alunos com saídas</div>
                </div>

                <!-- Card 2: Tempo Total Fora (Horas) -->
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="font-size: 14px; opacity: 0.9;">Tempo Total Fora da Sala</div>
                    <div style="font-size: 42px; font-weight: bold; margin: 10px 0;">⏱️ ${dados.resumo_geral.total_horas_geral}h ${dados.resumo_geral.total_minutos_geral}min</div>
                    <div style="font-size: 12px; opacity: 0.8;">${Math.round(dados.resumo_geral.total_horas_geral + dados.resumo_geral.total_minutos_geral/60)} horas totais</div>
                </div>

                <!-- Card 3: Tempo Médio por Aluno -->
                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="font-size: 14px; opacity: 0.9;">Tempo Médio por Aluno</div>
                    <div style="font-size: 42px; font-weight: bold; margin: 10px 0;">📊 ${(() => {
                        const totalMin = dados.resumo_geral.total_horas_geral * 60 + dados.resumo_geral.total_minutos_geral;
                        const mediaMin = Math.round(totalMin / (dados.resumo_geral.total_usuarios_com_saidas || 1));
                        const h = Math.floor(mediaMin / 60);
                        const m = mediaMin % 60;
                        return h > 0 ? (h + 'h ' + m + 'min') : (m + 'min');
                    })()}</div>
                    <div style="font-size: 12px; opacity: 0.8;">por aluno com saídas</div>
                </div>

            </div>
        `;

        // SEÇÃO 2: Tabela de Ranking (quem fica mais tempo fora)
        const comSaidas = dados.usuarios.filter(u => u.total_saidas > 0);
        html += `
            <h3 style="margin: 30px 0 20px 0; color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                🏆 Ranking de Alunos por Tempo Fora da Sala
            </h3>
            <p style="color: #666; margin: 0 0 15px 0; font-size: 13px;">
                🔍 Classificação baseada no tempo total que cada aluno ficou fora. Quem fica mais tempo fora aparece primeiro.
            </p>
        `;

        if (comSaidas.length === 0){
            html += `<p class="muted" style="padding: 16px 0;">Nenhuma saída registrada no período selecionado.</p>`;
        } else {
            html += `
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                    <tr style="background-color: #f5f5f5; border-bottom: 2px solid #ddd;">
                        <th style="padding: 15px; text-align: left; font-weight: 600; color: #333;">Posição</th>
                        <th style="padding: 15px; text-align: left; font-weight: 600; color: #333;">Nome</th>
                        <th style="padding: 15px; text-align: center; font-weight: 600; color: #333;">RA</th>
                        <th style="padding: 15px; text-align: center; font-weight: 600; color: #667eea;">Saídas</th>
                        <th style="padding: 15px; text-align: center; font-weight: 600; color: #f5576c;">Tempo Fora</th>
                    </tr>
                </thead>
                <tbody>
            `;

            // Adiciona cada usuário na tabela (com ranking visual)
            comSaidas.forEach((usuario, index) => {
                const posicao = index + 1;
                const medalha = posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : `#${posicao}`;
                const corLinha = index % 2 === 0 ? '#fafafa' : 'white';

                html += `
                    <tr style="background-color: ${corLinha}; border-bottom: 1px solid #eee;" onclick="mostrarHistoricoUsuario(${usuario.id_usuario})" class="rank-row-clicavel">
                        <td style="padding: 15px; font-weight: 600; font-size: 18px;">${medalha}</td>
                        <td style="padding: 15px; color: #333;">${usuario.nome}</td>
                        <td style="padding: 15px; text-align: center; color: #666; font-family: monospace;">${usuario.ra}</td>
                        <td style="padding: 15px; text-align: center;">
                            <span style="background: #e3f2fd; color: #1976d2; padding: 6px 12px; border-radius: 20px; font-weight: 600;">
                                ${usuario.total_saidas}
                            </span>
                        </td>
                        <td style="padding: 15px; text-align: center;">
                            <span style="background: #ffebee; color: #d32f2f; padding: 6px 12px; border-radius: 20px; font-weight: 600;">
                                ${usuario.tempo_formatado}
                            </span>
                        </td>
                    </tr>
                `;
            });

            html += `
                </tbody>
            </table>
            `;
        }

        // SEÇÃO 3: Ranking Inverso (quem menos sai / mais presentes)
        html += renderRankingInversoHTML(dados.ranking_inverso || []);

        // Seção 4: Dica de uso
        html += `
            <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; text-align: center;">
                <p style="color: #666; margin: 0;">
                    💡 Clique em um aluno para ver seu histórico detalhado de saídas
                </p>
            </div>
        `;

        if (container) {
            container.innerHTML = html;
        }

    }catch(err){
        if (container) {
            container.innerHTML = `<p style="color: red; padding: 20px;">❌ Erro ao carregar: ${err.message}</p>`;
        }
    }
}

// ============================================================
// RANKING INVERSO — ALUNOS QUE MENOS SAEM (MAIS PRESENTES)
// ============================================================

// Monta o HTML da seção de "ranking inverso": destaca os alunos com
// menor número de saídas no período, valorizando a assiduidade.
function renderRankingInversoHTML(rankingInverso){
    if (!rankingInverso || rankingInverso.length === 0) return '';

    // Mostra um "pódio" com os 3 alunos mais presentes + lista dos demais.
    const top3 = rankingInverso.slice(0, 3);
    const resto = rankingInverso.slice(3, 10); // limita a lista para não poluir a tela

    const icones = ['🛡️', '🥈', '🥉'];
    const rotulos = ['Mais presente', '2º mais presente', '3º mais presente'];

    let html = `
        <h3 style="margin: 30px 0 20px 0; color: #333; border-bottom: 2px solid #11998e; padding-bottom: 10px;">
            🌟 Ranking Inverso — Quem Mais Marca Presença
        </h3>
        <p class="muted" style="margin-bottom: 16px;">Reconhecimento para os alunos com menos saídas no período selecionado.</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px;">
    `;

    top3.forEach((u, i) => {
        html += `
            <div class="rank-inverse-card" onclick="mostrarHistoricoUsuario(${u.id_usuario})">
                <div style="font-size: 28px;">${icones[i]}</div>
                <div style="font-weight: 700; font-size: 17px; margin-top: 6px;">${u.nome}</div>
                <div style="font-size: 12px; opacity: .9;">${rotulos[i]}</div>
                <div style="margin-top: 10px; font-size: 13px;">RA: ${u.ra}</div>
                <div style="margin-top: 4px; font-size: 22px; font-weight: 700;">${u.total_saidas} <span style="font-size:12px;font-weight:400;">saídas</span></div>
            </div>
        `;
    });

    html += `</div>`;

    if (resto.length > 0){
        html += `
            <table class="rank-table" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                    <tr>
                        <th style="padding: 10px; text-align: left;">Nome</th>
                        <th style="padding: 10px; text-align: center;">RA</th>
                        <th style="padding: 10px; text-align: center;">Saídas</th>
                    </tr>
                </thead>
                <tbody>
        `;
        resto.forEach(u => {
            html += `
                <tr class="rank-row-clicavel" onclick="mostrarHistoricoUsuario(${u.id_usuario})">
                    <td style="padding: 10px;">${u.nome}</td>
                    <td style="padding: 10px; text-align: center; font-family: monospace;">${u.ra}</td>
                    <td style="padding: 10px; text-align: center;">${u.total_saidas}</td>
                </tr>
            `;
        });
        html += `
                </tbody>
            </table>
        `;
    }

    return html;
}

// ============================================================
// CARREGAR HISTÓRICO DE UM USUÁRIO
// ============================================================

// Mostra histórico detalhado de um aluno específico
// agora permite filtros de período: periodo (dias), mes_atual, ou intervalo start_date/end_date (YYYY-MM-DD)
async function mostrarHistoricoUsuario(id_usuario, periodo = 0, start_date = null, end_date = null, mes_atual = false){

    // Remove modal anterior se existir
    const modalAnterior = document.getElementById('modalHistorico');
    if (modalAnterior) modalAnterior.remove();

    // Cria modal de carregamento
    const modal = document.createElement('div');
    modal.id = 'modalHistorico';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.4); display: flex; align-items: center;
        justify-content: center; z-index: 9999; padding: 20px;
        backdrop-filter: blur(2px);
    `;
    modal.innerHTML = '<div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">⏳ Carregando histórico...</div>';
    document.body.appendChild(modal);

    try{
        // Constrói query string conforme filtros
        const params = new URLSearchParams();
        if (periodo && periodo > 0) params.append('periodo', periodo);
        if (mes_atual) params.append('mes_atual', 'true');
        if (start_date) params.append('start_date', start_date);
        if (end_date) params.append('end_date', end_date);

        const url = `${API_RELATORIOS}/relatorios/historico/${id_usuario}` + (Array.from(params).length ? ('?' + params.toString()) : '');

        const resp = await fetch(url);

        if (!resp.ok) throw new Error('Falha ao carregar histórico');

        const dados = await resp.json();

        // Modal wrapper com container interno
        let html = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; backdrop-filter: blur(2px);">
                <div style="background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 900px; width: 100%; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column;">

                    <!-- Header do Modal -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 16px 16px 0 0; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                        <div>
                            <h2 style="margin: 0 0 8px 0; font-size: 24px;">📋 Histórico de Saídas</h2>
                            <p style="margin: 0; opacity: 0.9; font-size: 14px;">${dados.nome_usuario} | RA: <strong>${dados.ra_usuario}</strong></p>
                        </div>
                        <button onclick="voltarParaEstatisticas()" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 28px; cursor: pointer; padding: 4px 8px; border-radius: 6px;">✕</button>
                    </div>

                    <!-- Conteúdo do Modal -->
                    <div style="padding: 25px; overflow-y: auto; flex: 1;">

                        <!-- Cards de Resumo -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                            <div style="background: #f0f4ff; padding: 15px; border-radius: 10px; border-left: 4px solid #667eea;">
                                <div style="font-size: 12px; color: #666; font-weight: 600; margin-bottom: 4px;">📊 Total de Saídas</div>
                                <div style="font-size: 24px; font-weight: 700; color: #333;">${dados.total_registros}</div>
                            </div>
                            <div style="background: #fff0f4; padding: 15px; border-radius: 10px; border-left: 4px solid #f5576c;">
                                <div style="font-size: 12px; color: #666; font-weight: 600; margin-bottom: 4px;">⏱️ Tempo Total Fora</div>
                                <div style="font-size: 24px; font-weight: 700; color: #333;">${dados.total_horas || 0}h ${dados.total_minutos || 0}min</div>
                            </div>
                        </div>

                        <!-- Filtros -->
                        <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 25px; border: 1px solid #e0e0e0;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                                <button style="padding: 8px 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 12px;" onclick="mostrarHistoricoUsuario(${id_usuario},7)">📅 Últimos 7 dias</button>
                                <button style="padding: 8px 12px; background: #764ba2; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 12px;" onclick="mostrarHistoricoUsuario(${id_usuario},15)">📅 Últimos 15 dias</button>
                                <button style="padding: 8px 12px; background: #f5576c; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 12px;" onclick="mostrarHistoricoUsuario(${id_usuario},30)">📅 Últimos 30 dias</button>
                                <button style="padding: 8px 12px; background: #4facfe; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 12px;" onclick="mostrarHistoricoUsuario(${id_usuario},0,null,null,true)">🈷️ Mês Atual</button>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                                <div>
                                    <label style="font-size: 11px; color: #666; display: block; margin-bottom: 4px; font-weight: 600;">📅 De</label>
                                    <input type="date" id="histStart" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px;" />
                                </div>
                                <div>
                                    <label style="font-size: 11px; color: #666; display: block; margin-bottom: 4px; font-weight: 600;">📅 Até</label>
                                    <input type="date" id="histEnd" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px;" />
                                </div>
                                <div style="display: flex; gap: 8px; align-items: flex-end;">
                                    <button style="flex: 1; padding: 8px 12px; background: #0066cc; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;" onclick="(function(){ const s=document.getElementById('histStart').value; const e=document.getElementById('histEnd').value; if(!s) return alert('Informe a data inicial'); mostrarHistoricoUsuario(${id_usuario},0,s,e,false); })()">🔍 Aplicar</button>
                                </div>
                            </div>
                        </div>

                        <!-- Lista de Saídas -->
                        <div style="display: flex; flex-direction: column; gap: 12px;">
        `;

        // Mostra cada saída como um card profissional
        dados.historico.forEach((evento, index) => {
            const statusCor = evento.status === 'Retornou' ? '#4caf50' : '#ff9800';
            const statusIcon = evento.status === 'Retornou' ? '✓' : '⏳';
            const bgCard = evento.status === 'Retornou' ? '#f0fdf4' : '#fffbf0';

            const dataSaida = new Date(evento.data_saida);
            const dataSaidaFormatada = dataSaida.toLocaleDateString('pt-BR') + ' ' + dataSaida.toLocaleTimeString('pt-BR');

            html += `
                <div style="border-left: 5px solid ${statusCor}; padding: 16px; background: ${bgCard}; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s; border: 1px solid ${statusCor}20;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <div style="flex: 1;">
                            <span style="background: ${statusCor}; color: white; padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-block;">
                                ${statusIcon} ${evento.status}
                            </span>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #666; font-size: 12px; margin-bottom: 4px;">📅 ${dataSaidaFormatada}</div>
                            <div style="font-weight: 700; color: #333; font-size: 18px;">⏱️ ${evento.duracao}</div>
                        </div>
                    </div>
                    <div style="color: #333; margin: 10px 0; font-size: 14px;">
                        <strong>📌 Motivo:</strong> ${evento.motivo}
                    </div>
                    ${evento.observacoes ? `<div style="color: #666; font-size: 12px; margin-top: 8px; background: white; padding: 8px; border-radius: 6px; border-left: 3px solid #667eea;">📝 <strong>Observações:</strong> ${evento.observacoes}</div>` : ''}
                    <button class="btn-editar-retorno" data-id-saida="${evento.id_saida}" data-id-usuario="${id_usuario}" data-data-saida="${evento.data_saida}" data-data-retorno="${evento.data_retorno || ''}" data-duracao="${evento.duracao}" data-observacoes="${(evento.observacoes || '').replace(/"/g, '&quot;')}" style="margin-top: 12px; padding: 10px 16px; background: #0066cc; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.3s;">✏️ Editar Retorno</button>
                </div>
            `;
        });

        html += `
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Atualiza o modal com o histórico
        modal.innerHTML = html;

        // Adiciona event listeners aos botões de edição de retorno
        setTimeout(() => {
            const botoes = document.querySelectorAll('.btn-editar-retorno');
            console.log('🔍 Botões de edição encontrados:', botoes.length);

            botoes.forEach((btn) => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('✅ Clique detectado no botão de edição!');
                    abrirDetalhesRetorno(
                        this.dataset.idSaida,
                        this.dataset.idUsuario,
                        this.dataset.dataSaida,
                        this.dataset.dataRetorno,
                        this.dataset.duracao,
                        (this.dataset.observacoes || '').replace(/&quot;/g, '"')
                    );
                });
            });

            if (botoes.length === 0) {
                console.warn('⚠️ Nenhum botão .btn-editar-retorno encontrado!');
            }
        }, 100);

        // Se existirem inputs de data, preenche com valores do filtro atual
        try{
            if (start_date) document.getElementById('histStart').value = start_date;
            if (end_date) document.getElementById('histEnd').value = end_date;
        }catch(e){}

    }catch(err){
        modal.innerHTML = `<div style="background: white; padding: 40px; border-radius: 8px; max-width: 600px;"><p style="color: red;">❌ Erro: ${err.message}</p><button class="btn" onclick="document.getElementById('modalHistorico').remove()">Fechar</button></div>`;
    }
}

// Volta para exibição de estatísticas gerais
function voltarParaEstatisticas(){
    // Fecha o modal de histórico
    const modal = document.getElementById('modalHistorico');
    if (modal) {
        modal.remove();
    }
}

// ============================================================
// POPUP DE DETALHES E EDIÇÃO DE RETORNO
// ============================================================

// Armazena dados do retorno atual sendo editado
window.dadosRetornoEmEdicao = null;

async function abrirDetalhesRetorno(id_saida, id_usuario, dataSaidaStr, dataRetornoStr, duracao, observacoes) {
    // Busca os detalhes da saída
    try {
        const respSaida = await fetch(`${API_RELATORIOS}/saidas/${id_saida}`);
        const saida = respSaida.ok ? await respSaida.json() : null;

        if (!saida) {
            alert('Erro ao carregar detalhes da saída');
            return;
        }

        // Formata datas para exibição
        const dataSaida = new Date(dataSaidaStr.replace(' ', 'T'));
        const dataSaidaFormatada = dataSaida.toLocaleDateString('pt-BR') + ' às ' + dataSaida.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});

        let dataRetornoFormatada = 'Pendente';
        let horaRetornoEditar = '';
        let dataRetornoEditar = '';

        if (dataRetornoStr) {
            const dataRetorno = new Date(dataRetornoStr.replace(' ', 'T'));
            dataRetornoFormatada = dataRetorno.toLocaleDateString('pt-BR') + ' às ' + dataRetorno.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
            dataRetornoEditar = dataRetorno.toISOString().split('T')[0];
            horaRetornoEditar = dataRetorno.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit', hour12: false});
        }

        // Armazena dados para possível edição
        window.dadosRetornoEmEdicao = {
            id_saida: id_saida,
            id_usuario: id_usuario,
            data_saida: dataSaidaStr,
            data_retorno: dataRetornoStr || null
        };

        // Cria o modal HTML
        const modal = document.createElement('div');
        modal.id = 'modalDetalhesRetorno';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255,255,255,0.95); display: flex; align-items: center;
            justify-content: center; z-index: 10000; overflow: hidden; padding: 20px;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 700px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.4); max-height: 95vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: #333;">📋 Detalhes da Saída</h2>
                    <button onclick="document.getElementById('modalDetalhesRetorno').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">✕</button>
                </div>

                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-size: 12px; color: #666; font-weight: 600; margin-bottom: 4px;">📤 Data e Hora de Saída</label>
                        <div style="font-size: 16px; color: #333; font-weight: 500;">${dataSaidaFormatada}</div>
                    </div>
                    <div>
                        <label style="display: block; font-size: 12px; color: #666; font-weight: 600; margin-bottom: 4px;">Motivo</label>
                        <div style="font-size: 14px; color: #555;">${saida.motivo || 'Não informado'}</div>
                    </div>
                </div>

                <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-size: 12px; color: #666; font-weight: 600; margin-bottom: 4px;">🔄 Data e Hora de Retorno</label>
                        <div style="font-size: 16px; color: #333; font-weight: 500;" id="dataRetornoDisplay">${dataRetornoFormatada}</div>
                    </div>
                    <div>
                        <label style="display: block; font-size: 12px; color: #666; font-weight: 600; margin-bottom: 4px;">⏱️ Duração</label>
                        <div style="font-size: 14px; color: #555;" id="duracaoDisplay">${duracao}</div>
                    </div>
                </div>

                <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; color: #333; font-size: 14px;">✏️ Editar Retorno</h3>

                    <div style="margin-bottom: 12px;">
                        <label for="dataRetornoEdicao" style="display: block; font-size: 12px; color: #666; font-weight: 600; margin-bottom: 4px;">Data</label>
                        <input type="date" id="dataRetornoEdicao" value="${dataRetornoEditar}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                    </div>

                    <div style="margin-bottom: 12px;">
                        <label for="horaRetornoEdicao" style="display: block; font-size: 12px; color: #666; font-weight: 600; margin-bottom: 4px;">Hora (HH:MM)</label>
                        <input type="time" id="horaRetornoEdicao" value="${horaRetornoEditar}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label for="observacoesRetorno" style="display: block; font-size: 12px; color: #666; font-weight: 600; margin-bottom: 4px;">Observações (opcional)</label>
                        <textarea id="observacoesRetorno" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; min-height: 80px; resize: vertical;" placeholder="Adicione observações sobre o retorno...">${observacoes || ''}</textarea>
                    </div>
                </div>

                <div style="display: flex; gap: 10px;">
                    <button onclick="salvarEdicaoRetorno()" style="flex: 1; padding: 12px; background: #4caf50; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px;">💾 Salvar Alterações</button>
                    <button onclick="document.getElementById('modalDetalhesRetorno').remove()" style="flex: 1; padding: 12px; background: #ccc; color: #333; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px;">❌ Cancelar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    } catch (err) {
        console.error('Erro:', err);
        alert('Erro ao carregar detalhes: ' + err.message);
    }
}

async function salvarEdicaoRetorno() {
    const dados = window.dadosRetornoEmEdicao;
    if (!dados) return;

    const dataEdicao = document.getElementById('dataRetornoEdicao').value;
    const horaEdicao = document.getElementById('horaRetornoEdicao').value;
    const observacoesEdicao = document.getElementById('observacoesRetorno').value;

    // Validação básica
    if (!dataEdicao || !horaEdicao) {
        alert('Por favor, preencha a data e hora do retorno');
        return;
    }

    const novaDataRetorno = `${dataEdicao} ${horaEdicao}:00`;

    try {
        // Obtém usuário logado do localStorage
        const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado') || '{}');
        const idUsuarioLogado = usuarioLogado.id_usuario || 0;
        const idPerfilLogado = usuarioLogado.id_perfil || 0;

        console.log('Usuário logado:', usuarioLogado);

        // Primeiro, busca o ID do retorno
        const respRetornos = await fetch(`${API_RELATORIOS}/retornos/saida/${dados.id_saida}`);
        const retornos = respRetornos.ok ? await respRetornos.json() : [];

        if (retornos.length === 0) {
            alert('Nenhum retorno encontrado para esta saída. Registre um retorno primeiro.');
            return;
        }

        const idRetorno = retornos[0].id_retorno;

        // Atualiza o retorno
        const respAtualizar = await fetch(`${API_RELATORIOS}/retornos/${idRetorno}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_saida: dados.id_saida,
                id_usuario: dados.id_usuario,
                data_retorno_customizada: novaDataRetorno,
                observacoes: observacoesEdicao,
                id_usuario_logado: idUsuarioLogado,
                id_perfil_logado: idPerfilLogado
            })
        });

        if (!respAtualizar.ok) {
            const erro = await respAtualizar.json();
            alert('Erro ao salvar: ' + (erro.detail || 'Erro desconhecido'));
            return;
        }

        // Fecha modal e recarrega histórico
        document.getElementById('modalDetalhesRetorno').remove();
        alert('Retorno atualizado com sucesso!');

        // Recarrega o histórico
        mostrarHistoricoUsuario(dados.id_usuario);
    } catch (err) {
        console.error('Erro:', err);
        alert('Erro ao salvar: ' + err.message);
    }
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

// Carrega estatísticas quando abre a página de consultas
function abrirConsultas(){
    showScreen('telaConsultas');
}
