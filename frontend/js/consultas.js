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

    const container = document.getElementById('estatisticasContainer');

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

    const container = document.getElementById('historicoContainer');

    if (container) {
        container.innerHTML = '<p style="text-align: center; padding: 40px;">⏳ Carregando histórico...</p>';
        container.style.display = 'block';
    }

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

        // Header com controles de filtro
        let html = `
            <div style="margin-bottom: 12px; display:flex;flex-direction:column;gap:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <h2 style="color: #333; margin: 0 0 6px 0;">📋 Histórico de ${dados.nome_usuario}</h2>
                        <div style="color:#666;">RA: <strong>${dados.ra_usuario}</strong> | Total: <strong>${dados.total_registros}</strong> saídas</div>
                    </div>
                    <div style="display:flex;gap:8px;align-items:center;">
                        <button class="btn" onclick="mostrarHistoricoUsuario(${id_usuario},7)">Últimos 7 dias</button>
                        <button class="btn" onclick="mostrarHistoricoUsuario(${id_usuario},15)">Últimos 15 dias</button>
                        <button class="btn" onclick="mostrarHistoricoUsuario(${id_usuario},30)">Últimos 30 dias</button>
                        <button class="btn" onclick="mostrarHistoricoUsuario(${id_usuario},0,null,null,true)">Mês atual</button>
                    </div>
                </div>

                <div style="display:flex;gap:8px;align-items:center;">
                    <label style="font-size:13px;color:#666;">De</label>
                    <input type="date" id="histStart" />
                    <label style="font-size:13px;color:#666;">Até</label>
                    <input type="date" id="histEnd" />
                    <button class="btn" onclick="(function(){ const s=document.getElementById('histStart').value; const e=document.getElementById('histEnd').value; if(!s) return alert('Informe a data inicial'); mostrarHistoricoUsuario(${id_usuario},0,s,e,false); })()">Aplicar</button>
                    <button class="btn ghost" onclick="voltarParaEstatisticas()">Fechar</button>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 15px;">
        `;

        // Mostra cada saída como um card de timeline
        dados.historico.forEach((evento, index) => {
            const statusCor = evento.status === 'Retornou' ? '#4caf50' : '#ff9800';
            const statusIcon = evento.status === 'Retornou' ? '✓' : '⏳';

            const dataSaida = new Date(evento.data_saida);
            const dataSaidaFormatada = dataSaida.toLocaleDateString('pt-BR') + ' ' + dataSaida.toLocaleTimeString('pt-BR');

            html += `
                <div style="border-left: 4px solid ${statusCor}; padding: 15px; background: white; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.3s;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <span style="background: ${statusCor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                ${statusIcon} ${evento.status}
                            </span>
                        </div>
                        <div style="text-align: right; color: #666; font-size: 14px;">
                            <div>${dataSaidaFormatada}</div>
                            <div style="font-weight: 600; color: #333; margin-top: 5px; font-size: 16px;">⏱️ ${evento.duracao}</div>
                        </div>
                    </div>
                    <div style="color: #333; margin: 10px 0;">
                        <strong>Motivo:</strong> ${evento.motivo}
                    </div>
                    ${evento.observacoes ? `<div style="color: #666; font-size: 13px; margin-top: 8px;">📝 ${evento.observacoes}</div>` : ''}
                    <button class="btn-editar-retorno" data-id-saida="${evento.id_saida}" data-id-usuario="${id_usuario}" data-data-saida="${evento.data_saida}" data-data-retorno="${evento.data_retorno || ''}" data-duracao="${evento.duracao}" data-observacoes="${(evento.observacoes || '').replace(/"/g, '&quot;')}" style="margin-top: 12px; padding: 8px 12px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; font-size: 13px;">✏️ Editar Retorno</button>
                </div>
            `;
        });

        html += `
            </div>
        `;

        if (container) {
            container.innerHTML = html;

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
        }

    }catch(err){
        if (container) {
            container.innerHTML = `<p style="color: red; padding: 20px;">❌ Erro: ${err.message}</p>`;
        }
    }
}

// Volta para exibição de estatísticas gerais
function voltarParaEstatisticas(){
    const container = document.getElementById('historicoContainer');
    if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
    }
    carregarEstatisticasGerais();
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
            background: rgba(0,0,0,0.5); display: flex; align-items: center;
            justify-content: center; z-index: 10000;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 500px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto;">
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
                id_usuario_logado: 1,
                id_perfil_logado: 1
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
