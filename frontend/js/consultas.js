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
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%);
        display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;
        backdrop-filter: blur(8px);
    `;
    modal.innerHTML = '<div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);">⏳ Carregando histórico...</div>';
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
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(245, 87, 108, 0.15) 100%); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; backdrop-filter: blur(8px);">
                <div style="background: white; border-radius: 20px; box-shadow: 0 25px 80px rgba(0,0,0,0.2); max-width: 950px; width: 100%; max-height: 92vh; overflow-y: auto; display: flex; flex-direction: column;">

                    <!-- Header do Modal - Design Moderno -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 20px 20px 0 0; display: flex; justify-content: space-between; align-items: flex-start; flex-shrink: 0; position: relative; overflow: hidden;">
                        <div style="position: relative; z-index: 2;">
                            <h1 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">📋 Histórico de Saídas</h1>
                            <p style="margin: 0; opacity: 0.95; font-size: 15px; font-weight: 500;">${dados.nome_usuario}</p>
                            <p style="margin: 6px 0 0 0; opacity: 0.8; font-size: 13px;">RA: <strong>${dados.ra_usuario}</strong></p>
                        </div>
                        <button onclick="voltarParaEstatisticas()" style="background: rgba(255,255,255,0.25); border: none; color: white; font-size: 32px; cursor: pointer; padding: 8px 12px; border-radius: 10px; transition: all 0.2s; font-weight: bold;" onmouseover="this.style.background='rgba(255,255,255,0.35)'" onmouseout="this.style.background='rgba(255,255,255,0.25)'">✕</button>
                    </div>

                    <!-- Conteúdo do Modal -->
                    <div style="padding: 32px; overflow-y: auto; flex: 1; background: #f8fafb;">

                        <!-- Cards de Resumo -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px;">
                            <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e8f0ff 100%); padding: 20px; border-radius: 12px; border: 1px solid #d4e0ff; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.08);">
                                <div style="font-size: 13px; color: #667eea; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">📊 Total de Saídas</div>
                                <div style="font-size: 32px; font-weight: 900; color: #667eea;">${dados.total_registros}</div>
                            </div>
                            <div style="background: linear-gradient(135deg, #fff0f4 0%, #ffe8ed 100%); padding: 20px; border-radius: 12px; border: 1px solid #ffccd8; box-shadow: 0 4px 12px rgba(245, 87, 108, 0.08);">
                                <div style="font-size: 13px; color: #f5576c; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">⏱️ Tempo Total Fora</div>
                                <div style="font-size: 32px; font-weight: 900; color: #f5576c;">${dados.total_horas || 0}h ${dados.total_minutos || 0}min</div>
                            </div>
                        </div>

                        <!-- Filtros - Design Moderno -->
                        <div style="background: white; padding: 24px; border-radius: 12px; margin-bottom: 28px; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                            <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #1f2937; text-transform: uppercase; letter-spacing: 0.5px;">🔍 Filtrar por Período</h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin-bottom: 18px;">
                                <button style="padding: 10px 14px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.3s; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'" onclick="mostrarHistoricoUsuario(${id_usuario},7)">📅 Últimos 7 dias</button>
                                <button style="padding: 10px 14px; background: #764ba2; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.3s; box-shadow: 0 2px 8px rgba(118, 75, 162, 0.2);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'" onclick="mostrarHistoricoUsuario(${id_usuario},15)">📅 Últimos 15 dias</button>
                                <button style="padding: 10px 14px; background: #f5576c; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.3s; box-shadow: 0 2px 8px rgba(245, 87, 108, 0.2);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'" onclick="mostrarHistoricoUsuario(${id_usuario},30)">📅 Últimos 30 dias</button>
                                <button style="padding: 10px 14px; background: #4facfe; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.3s; box-shadow: 0 2px 8px rgba(79, 172, 254, 0.2);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'" onclick="mostrarHistoricoUsuario(${id_usuario},0,null,null,true)">🈷️ Mês Atual</button>
                            </div>

                            <div style="border-top: 1px solid #e5e7eb; padding-top: 18px;">
                                <p style="margin: 0 0 12px 0; font-size: 12px; color: #6b7280; font-weight: 600;">Ou selecione um intervalo customizado:</p>
                                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                                    <div>
                                        <label style="font-size: 12px; color: #374151; display: block; margin-bottom: 6px; font-weight: 700;">📅 Data Inicial</label>
                                        <input type="date" id="histStart" style="width: 100%; padding: 10px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 13px; transition: all 0.3s;" onfocus="this.style.borderColor='#667eea'" onblur="this.style.borderColor='#d1d5db'" />
                                    </div>
                                    <div>
                                        <label style="font-size: 12px; color: #374151; display: block; margin-bottom: 6px; font-weight: 700;">📅 Data Final</label>
                                        <input type="date" id="histEnd" style="width: 100%; padding: 10px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 13px; transition: all 0.3s;" onfocus="this.style.borderColor='#667eea'" onblur="this.style.borderColor='#d1d5db'" />
                                    </div>
                                    <div style="display: flex; gap: 8px; align-items: flex-end;">
                                        <button style="flex: 1; padding: 10px 14px; background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 13px; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0, 102, 204, 0.2);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'" onclick="(function(){ const s=document.getElementById('histStart').value; const e=document.getElementById('histEnd').value; if(!s) return alert('Informe a data inicial'); mostrarHistoricoUsuario(${id_usuario},0,s,e,false); })()">🔍 Aplicar</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Lista de Saídas -->
                        <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #1f2937; text-transform: uppercase; letter-spacing: 0.5px;">📝 Registros de Saída</h3>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
        `;

        // Mostra cada saída como um card profissional
        dados.historico.forEach((evento, index) => {
            const statusCor = evento.status === 'Retornou' ? '#4caf50' : '#ff9800';
            const statusIcon = evento.status === 'Retornou' ? '✓' : '⏳';
            const bgCard = evento.status === 'Retornou' ? '#f0fdf4' : '#fffbf0';

            const dataSaida = new Date(evento.data_saida);
            const dataSaidaFormatada = dataSaida.toLocaleDateString('pt-BR') + ' ' + dataSaida.toLocaleTimeString('pt-BR');

            const dataRetornoEditar = evento.data_retorno ? new Date(evento.data_retorno.replace(' ', 'T')).toISOString().split('T')[0] : '';
            const horaRetornoEditar = evento.data_retorno ? new Date(evento.data_retorno.replace(' ', 'T')).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit', hour12: false}) : '';

            html += `
                <div style="border-left: 5px solid ${statusCor}; padding: 18px; background: white; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: all 0.3s; border: 1px solid ${statusCor}30; hover: box-shadow 0 4px 20px rgba(0,0,0,0.1);" data-card-retorno="${evento.id_retorno}">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 14px;">
                        <div style="flex: 1;">
                            <span style="background: linear-gradient(135deg, ${statusCor}, ${statusCor}dd); color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; box-shadow: 0 2px 8px ${statusCor}40;">
                                ${statusIcon} ${evento.status}
                            </span>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #6b7280; font-size: 12px; margin-bottom: 6px; font-weight: 500;">📅 ${dataSaidaFormatada}</div>
                            <div style="font-weight: 800; color: ${statusCor}; font-size: 20px;">⏱️ ${evento.duracao}</div>
                        </div>
                    </div>
                    <div style="color: #374151; margin: 12px 0; font-size: 14px; line-height: 1.5;">
                        <strong style="color: #1f2937;">📌 Motivo:</strong> ${evento.motivo}
                    </div>
                    ${evento.observacoes ? `<div style="color: #4b5563; font-size: 13px; margin-top: 12px; background: #f3f4f6; padding: 12px; border-radius: 8px; border-left: 4px solid #667eea;">📝 <strong style="color: #1f2937;">Observações:</strong> ${evento.observacoes}</div>` : ''}

                    <!-- Formulário de Edição (inicialmente oculto) -->
                    <div class="form-edicao-inline" data-id-retorno="${evento.id_retorno}" style="display: none; margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb;">
                        <h4 style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px;">✏️ Editar Retorno</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                            <div>
                                <label style="font-size: 12px; color: #374151; display: block; margin-bottom: 4px; font-weight: 600;">📅 Data</label>
                                <input type="date" data-input-data="${evento.id_retorno}" value="${dataRetornoEditar}" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px;" />
                            </div>
                            <div>
                                <label style="font-size: 12px; color: #374151; display: block; margin-bottom: 4px; font-weight: 600;">🕐 Hora</label>
                                <input type="time" data-input-hora="${evento.id_retorno}" value="${horaRetornoEditar}" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px;" />
                            </div>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #374151; display: block; margin-bottom: 4px; font-weight: 600;">📝 Observações</label>
                            <input type="text" data-input-obs="${evento.id_retorno}" value="${evento.observacoes || ''}" placeholder="Adicione uma observação..." style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px;" />
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: 12px;">
                            <button class="btn-salvar-inline" data-id-retorno="${evento.id_retorno}" data-id-saida="${evento.id_saida}" data-id-usuario="${id_usuario}" style="flex: 1; padding: 8px 12px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; transition: all 0.3s;">💾 Salvar</button>
                            <button class="btn-cancelar-inline" data-id-retorno="${evento.id_retorno}" style="flex: 1; padding: 8px 12px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; transition: all 0.3s;">❌ Cancelar</button>
                        </div>
                    </div>

                    ${evento.id_retorno ? `<button class="btn-editar-retorno" data-id-retorno="${evento.id_retorno}" data-id-saida="${evento.id_saida}" data-id-usuario="${id_usuario}" data-data-saida="${evento.data_saida}" data-data-retorno="${evento.data_retorno || ''}" data-duracao="${evento.duracao}" data-observacoes="${(evento.observacoes || '').replace(/"/g, '&quot;')}" style="margin-top: 14px; padding: 10px 18px; background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 13px; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0, 102, 204, 0.2);" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 16px rgba(0, 102, 204, 0.3)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(0, 102, 204, 0.2)'">✏️ Editar Retorno</button>` : `<button style="margin-top: 14px; padding: 10px 18px; background: #ccc; color: #666; border: none; border-radius: 8px; cursor: not-allowed; font-weight: 700; font-size: 13px;">⏳ Aguardando Retorno</button>`}
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

        // Adiciona event listeners aos botões de edição inline
        setTimeout(() => {
            console.log('🔍 Procurando botões de edição...');
            const botoes = document.querySelectorAll('.btn-editar-retorno');
            console.log('✅ Botões encontrados:', botoes.length);

            // Botões para abrir/fechar formulário inline
            botoes.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const idRetorno = this.dataset.idRetorno;
                    console.log('🖱️ Botão clicado, ID Retorno:', idRetorno);
                    const formulario = document.querySelector(`.form-edicao-inline[data-id-retorno="${idRetorno}"]`);
                    console.log('📝 Formulário encontrado:', !!formulario);
                    if (formulario) {
                        formulario.style.display = formulario.style.display === 'none' ? 'block' : 'none';
                        if (formulario.style.display === 'block') {
                            this.textContent = '▲ Fechar Edição';
                            console.log('✅ Formulário aberto para ID:', idRetorno);
                        } else {
                            this.textContent = '✏️ Editar Retorno';
                            console.log('✅ Formulário fechado');
                        }
                    } else {
                        console.warn('⚠️ Formulário não encontrado para ID Retorno:', idRetorno);
                        console.log('📋 Seletor usado:', `.form-edicao-inline[data-id-retorno="${idRetorno}"]`);
                    }
                });
            });

            // Botões para cancelar edição
            document.querySelectorAll('.btn-cancelar-inline').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const idRetorno = this.dataset.idRetorno;
                    const formulario = document.querySelector(`.form-edicao-inline[data-id-retorno="${idRetorno}"]`);
                    const botaoEditar = document.querySelector(`[data-id-saida][data-id-saida] .btn-editar-retorno`);
                    if (formulario) {
                        formulario.style.display = 'none';
                        if (botaoEditar) botaoEditar.textContent = '✏️ Editar Retorno';
                    }
                });
            });

            // Botões para salvar edição inline
            document.querySelectorAll('.btn-salvar-inline').forEach(btn => {
                btn.addEventListener('click', async function(e) {
                    e.preventDefault();
                    const idRetorno = this.dataset.idRetorno;
                    const idSaida = this.dataset.idSaida;
                    const idUsuario = this.dataset.idUsuario;
                    const dataRetorno = document.querySelector(`input[data-input-data="${idRetorno}"]`).value;
                    const horaRetorno = document.querySelector(`input[data-input-hora="${idRetorno}"]`).value;
                    const observacoes = document.querySelector(`input[data-input-obs="${idRetorno}"]`).value;

                    if (!dataRetorno || !horaRetorno) {
                        alert('Informe data e hora do retorno');
                        return;
                    }

                    const dataRetornoFormatada = `${dataRetorno} ${horaRetorno}:00`;

                    try {
                        const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado') || '{}');
                        const idUsuarioLogado = usuarioLogado.id_usuario || 0;

                        console.log('📤 Enviando dados:', { idRetorno, idUsuario, idUsuarioLogado, dataRetornoFormatada, observacoes });

                        const resposta = await fetch(`${API_RELATORIOS}/retornos/${idRetorno}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id_saida: parseInt(idSaida),
                                id_usuario: parseInt(idUsuario),
                                data_retorno_customizada: dataRetornoFormatada,
                                observacoes: observacoes,
                                id_usuario_logado: parseInt(idUsuarioLogado)
                            })
                        });

                        console.log('📥 Status da resposta:', resposta.status);

                        if (!resposta.ok) {
                            try {
                                const erroJson = await resposta.json();
                                console.error('❌ Erro do servidor:', erroJson);
                                const mensagem = erroJson.detail || erroJson.message || JSON.stringify(erroJson);
                                alert('❌ Erro: ' + mensagem);
                            } catch (e) {
                                alert('❌ Erro ao salvar: Status ' + resposta.status);
                            }
                            return;
                        }

                        alert('✅ Retorno atualizado com sucesso!');
                        console.log('✅ Sucesso ao atualizar');
                        mostrarHistoricoUsuario(parseInt(idUsuario));
                    } catch (erro) {
                        console.error('❌ Erro na requisição:', erro);
                        alert('❌ Erro: ' + (erro.message || String(erro)));
                    }
                });
            });
        }, 300);

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
