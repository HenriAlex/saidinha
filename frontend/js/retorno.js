/* retorno.js - Lógica de UI para retornos (registrar, listar)
   Local: frontend/js/retorno.js

   Este arquivo contém todas as funções responsáveis por gerenciar
   a interface de RETORNOS dos alunos (quando retornam à instituição).

   A interface mostra APENAS alunos que saíram e ainda NÃO retornaram.
   Com um clique simples no botão "Voltar", o retorno é registrado
   com a data/hora automática.
*/

// Comentado: usar API_BASE do script.js em vez de declarar aqui
// const API_BASE = 'http://127.0.0.1:8000';
const API_RETORNOS = typeof API_BASE !== 'undefined' ? API_BASE : 'http://127.0.0.1:8000';

// ============================================================
// CARREGAR E EXIBIR SAÍDAS SEM RETORNO
// ============================================================

// Carrega todas as saídas que ainda não têm retorno (pendentes).
// Exibe apenas os alunos que saíram e ainda não voltaram.
async function carregarSaidasPendentes(){

    // Obtém a referência do grid que mostrará os alunos.
    const grid = document.getElementById('saidasPendentesGrid');

    // Obtém a referência do elemento de contagem.
    const countEl = document.getElementById('aidasCount');

    // Exibe esqueletos de carregamento.
    if (grid) {
        grid.innerHTML = '';
        for (let i=0;i<3;i++){
            const sk = document.createElement('div');
            sk.className='skeleton';
            grid.appendChild(sk);
        }
    }

    try{
        // Envia o usuário logado: o Aluno recebe apenas a sua
        // própria pendência de retorno; os demais perfis recebem todas.
        const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado') || '{}');
        const resp = await fetch(`${API_RETORNOS}/saidas/pendentes/lista?id_usuario_logado=${usuarioLogado.id_usuario || 0}&id_perfil_logado=${usuarioLogado.id_perfil || 0}`);

        if (!resp.ok) throw new Error('Falha ao carregar saídas pendentes');

        // Converte a resposta JSON.
        const saidas = await resp.json();

        // Limpa o grid.
        grid.innerHTML = '';

        // Verifica se há saídas pendentes.
        if (!saidas || saidas.length === 0){
            const vazio = document.createElement('div');
            vazio.className='profile-card empty';
            vazio.innerHTML='<p style="text-align: center; font-size: 18px;">✓ Todos retornaram!</p><p style="text-align: center; color: #888;">Nenhum aluno saiu no momento.</p>';
            grid.appendChild(vazio);
            return;
        }

        // Exibe cada saída pendente como um card.
        saidas.forEach(s => {
            // Container do card.
            const card = document.createElement('div');
            card.className='profile-card';
            card.style.borderLeft='4px solid #ff6b6b';

            // Cabeçalho com avatar.
            const head = document.createElement('div');
            head.className='profile-head';

            // Avatar.
            const avatar = document.createElement('div');
            avatar.className='profile-avatar';
            avatar.style.background=corPorTexto(s.nome_usuario||'S');
            avatar.textContent=(s.nome_usuario||'?').charAt(0).toUpperCase();

            // Nome.
            const title = document.createElement('div');
            title.className='profile-title';
            title.style.fontSize='18px';
            title.textContent = s.nome_usuario || 'Desconhecido';

            head.appendChild(avatar);
            head.appendChild(title);

            // Informações de saída.
            const meta = document.createElement('div');
            meta.className='profile-meta';
            meta.style.color='#ff6b6b';
            meta.style.fontWeight='600';

            // Formata data/hora da saída.
            const dataSaidaObj = new Date(s.data_saida);
            const horaSaida = dataSaidaObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});

            meta.innerHTML = `⏰ Saiu às <strong>${horaSaida}</strong>`;

            // Motivo da saída.
            const motivo = document.createElement('div');
            motivo.className='profile-meta muted';
            motivo.textContent = `📝 Motivo: ${s.motivo}`;

            // RA.
            const ra = document.createElement('div');
            ra.className='profile-meta muted';
            ra.textContent = `ID: ${s.ra_usuario}`;

            // BOTÃO VOLTAR (ação principal).
            const actions = document.createElement('div');
            actions.className='profile-actions';
            actions.style.marginTop='15px';

            const btnVoltar = document.createElement('button');
            btnVoltar.className='btn';
            btnVoltar.style.backgroundColor='#51cf66';
            btnVoltar.style.color='white';
            btnVoltar.style.width='100%';
            btnVoltar.style.fontSize='16px';
            btnVoltar.style.padding='14px';
            btnVoltar.style.fontWeight='600';
            btnVoltar.style.border='none';
            btnVoltar.style.borderRadius='6px';
            btnVoltar.style.cursor='pointer';
            btnVoltar.textContent='✓ VOLTAR';
            btnVoltar.onclick = function(){
                registrarRetornoRapido(s);
            };

            actions.appendChild(btnVoltar);

            // Monta o card.
            card.appendChild(head);
            card.appendChild(meta);
            card.appendChild(motivo);
            card.appendChild(ra);
            card.appendChild(actions);

            grid.appendChild(card);
        });

    }catch(err){
        if (typeof showToast === 'function')
            showToast(err.message || 'Erro ao carregar saídas','error');
        else
            alert(err.message);
    }
}

// ============================================================
// REGISTRAR RETORNO RÁPIDO (Um clique!)
// ============================================================

// Registra o retorno de forma rápida com um clique.
// Data/hora são preenchidas automaticamente com o momento do clique.
async function registrarRetornoRapido(saida){

    // Mostra confirmação visual.
    const confirmado = await (
        typeof showModal === 'function'
            ? showModal(
                '🎯 Confirmar Retorno',
                `${saida.nome_usuario} está voltando?`
              )
            : Promise.resolve(confirm(`${saida.nome_usuario} está voltando?`))
    );

    if (!confirmado) return;

    try{
        // Cria o objeto de retorno.
        // Data/hora são preenchidas automaticamente no servidor.

        // Obtém usuário logado do localStorage para validação
        const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado') || '{}');

        const dados = {
            id_saida: saida.id_saida,
            id_usuario: saida.id_usuario,
            observacoes: '',  // Vazio por padrão (opcional)
            // Adiciona ID e perfil do usuário logado para validação de permissão
            id_usuario_logado: usuarioLogado.id_usuario || 0,
            id_perfil_logado: usuarioLogado.id_perfil || 0
        };

        // Envia o retorno para a API.
        const resp = await fetch(`${API_RETORNOS}/retornos/`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(dados)
        });

        if (resp.ok){
            const res = await resp.json();

            // Mostra sucesso.
            if (typeof showToast==='function')
                showToast(`✓ ${saida.nome_usuario} voltou!`,'success');
            else
                alert(`${saida.nome_usuario} voltou!`);

            // Recarrega a lista (remove o aluno da lista).
            await carregarSaidasPendentes();
        }
        else {
            let e={detail:'Erro ao registrar retorno'};
            try{ e = await resp.json(); }catch{}
            alert(e.detail || JSON.stringify(e));
        }
    }catch(err){
        if (typeof showToast==='function')
            showToast(err.message||'Erro ao registrar retorno','error');
        else
            alert(err.message);
    }
}

// ============================================================
// FILTRO E BUSCA
// ============================================================

// Filtra alunos pendentes por nome ou RA.
function filterSaidasPendentes(text){

    const grid = document.getElementById('saidasPendentesGrid');
    if (!grid) return;

    const q = (text||'').toLowerCase().trim();
    let visible=0;

    const cards = Array.from(grid.children);

    cards.forEach(card=>{
        if (!card.classList.contains('profile-card')) return;

        const title = (card.querySelector('.profile-title')||{}).textContent.toLowerCase()||'';
        const meta = (card.querySelector('.profile-meta')||{}).textContent.toLowerCase()||'';

        const match = title.includes(q) || meta.includes(q);

        card.style.display = match ? '' : 'none';
        if (match) visible++;
    });
}
