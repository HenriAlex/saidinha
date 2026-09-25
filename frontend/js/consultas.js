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

// ============================================================
// CARREGAR ESTATÍSTICAS GERAIS
// ============================================================

// Carrega estatísticas de todos os usuários
async function carregarEstatisticasGerais(){

    const container = document.getElementById('estatisticasContainer');
    const tabela = document.getElementById('tabelaEstatisticas');

    if (container) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">⏳ Carregando relatórios...</p>';
    }

    try{
        // Busca estatísticas gerais da API.
        // Qualquer perfil logado pode ver o relatório geral (módulo Consulta).
        const resp = await fetch(`${API_RELATORIOS}/relatorios/geral`);

        if (!resp.ok) throw new Error('Falha ao carregar estatísticas');

        const dados = await resp.json();

        // SEÇÃO 1: Cards com resumo geral
        let html = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">

                <!-- Card 1: Total de Saídas -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="font-size: 14px; opacity: 0.9;">Total de Saídas</div>
                    <div style="font-size: 42px; font-weight: bold; margin: 10px 0;">📤 ${dados.resumo_geral.total_saidas_geral}</div>
                    <div style="font-size: 12px; opacity: 0.8;">${dados.resumo_geral.total_usuarios_com_saidas} alunos com saídas</div>
                </div>

                <!-- Card 2: Total de Horas -->
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="font-size: 14px; opacity: 0.9;">Tempo Total Fora</div>
                    <div style="font-size: 42px; font-weight: bold; margin: 10px 0;">⏱️ ${dados.resumo_geral.total_horas_geral}h</div>
                    <div style="font-size: 12px; opacity: 0.8;">${dados.resumo_geral.total_minutos_geral} minutos</div>
                </div>

                <!-- Card 3: Média por Aluno -->
                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="font-size: 14px; opacity: 0.9;">Média por Aluno</div>
                    <div style="font-size: 42px; font-weight: bold; margin: 10px 0;">📊 ${Math.round(dados.resumo_geral.total_saidas_geral / (dados.resumo_geral.total_usuarios_com_saidas || 1))}</div>
                    <div style="font-size: 12px; opacity: 0.8;">saídas por aluno</div>
                </div>

            </div>
        `;

        // SEÇÃO 2: Tabela de Ranking
        html += `
            <h3 style="margin: 30px 0 20px 0; color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                🏆 Ranking de Alunos por Saídas
            </h3>
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
        dados.usuarios.forEach((usuario, index) => {
            const posicao = index + 1;
            const medalha = posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : `#${posicao}`;
            const corLinha = index % 2 === 0 ? '#fafafa' : 'white';

            html += `
                <tr style="background-color: ${corLinha}; border-bottom: 1px solid #eee; hover: {background-color: #f0f0f0;}">
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

        // Seção 3: Botão para visualizar mais detalhes
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
// CARREGAR HISTÓRICO DE UM USUÁRIO
// ============================================================

// Mostra histórico detalhado de um aluno específico
async function mostrarHistoricoUsuario(id_usuario){

    const container = document.getElementById('historicoContainer');

    if (container) {
        container.innerHTML = '<p style="text-align: center; padding: 40px;">⏳ Carregando histórico...</p>';
        container.style.display = 'block';
    }

    try{
        // Qualquer perfil logado pode ver o histórico de qualquer aluno
        // (módulo Consulta é de leitura livre para todos os perfis).
        const resp = await fetch(`${API_RELATORIOS}/relatorios/historico/${id_usuario}`);

        if (!resp.ok) throw new Error('Falha ao carregar histórico');

        const dados = await resp.json();

        let html = `
            <div style="margin-bottom: 30px;">
                <h2 style="color: #333; margin: 0 0 10px 0;">📋 Histórico de ${dados.nome_usuario}</h2>
                <p style="color: #666; margin: 0;">RA: <strong>${dados.ra_usuario}</strong> | Total: <strong>${dados.total_registros}</strong> saídas</p>
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
                <div style="border-left: 4px solid ${statusCor}; padding: 15px; background: white; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
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
                </div>
            `;
        });

        html += `
            </div>
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="voltarParaEstatisticas()" style="background: #667eea; color: white; border: none; padding: 12px 30px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;">
                    ← Voltar para Estatísticas
                </button>
            </div>
        `;

        if (container) {
            container.innerHTML = html;
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
// INICIALIZAÇÃO
// ============================================================

// Carrega estatísticas quando abre a página de consultas
function abrirConsultas(){
    showScreen('telaConsultas');
    carregarEstatisticasGerais();
}
