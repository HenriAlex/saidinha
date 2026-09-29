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

            // BOTÕES DE RETORNO (automático e manual).
            const actions = document.createElement('div');
            actions.className='profile-actions';
            actions.style.marginTop='15px';
            actions.style.display='flex';
            actions.style.gap='8px';
            actions.style.flexDirection='column';

            // Botão 1: VOLTAR (retorno automático/rápido)
            // Registra o retorno com a data/hora atual do servidor.
            const btnVoltar = document.createElement('button');
            btnVoltar.className='btn';
            btnVoltar.style.backgroundColor='#51cf66';
            btnVoltar.style.color='white';
            btnVoltar.style.width='100%';
            btnVoltar.style.fontSize='16px';
            btnVoltar.style.padding='12px';
            btnVoltar.style.fontWeight='600';
            btnVoltar.style.border='none';
            btnVoltar.style.borderRadius='6px';
            btnVoltar.style.cursor='pointer';
            btnVoltar.textContent='✓ VOLTAR (Agora)';
            btnVoltar.onclick = function(){
                registrarRetornoRapido(s);
            };

            // Botão 2: RETORNO MANUAL
            // Abre um formulário para informar data/hora customizada.
            // Usado quando o aluno foi embora e retorna em outro horário.
            const btnManual = document.createElement('button');
            btnManual.className='btn';
            btnManual.style.backgroundColor='#4ecdc4';
            btnManual.style.color='white';
            btnManual.style.width='100%';
            btnManual.style.fontSize='16px';
            btnManual.style.padding='12px';
            btnManual.style.fontWeight='600';
            btnManual.style.border='none';
            btnManual.style.borderRadius='6px';
            btnManual.style.cursor='pointer';
            btnManual.textContent='📅 Retorno Manual';
            btnManual.onclick = function(){
                abrirFormularioRetornoManual(s);
            };

            actions.appendChild(btnVoltar);
            actions.appendChild(btnManual);

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
// RETORNO MANUAL COM DATA CUSTOMIZADA
// ============================================================

// Abre um formulário modal para registrar retorno com data/hora customizada.
// Usado quando o aluno foi embora (saída) e retorna em outro horário.
function abrirFormularioRetornoManual(saida){

    // Cria um overlay (fundo escuro) para destacar o formulário.
    const overlay = document.createElement('div');
    overlay.style.position='fixed';
    overlay.style.top='0';
    overlay.style.left='0';
    overlay.style.width='100%';
    overlay.style.height='100%';
    overlay.style.backgroundColor='rgba(0, 0, 0, 0.5)';
    overlay.style.display='flex';
    overlay.style.justifyContent='center';
    overlay.style.alignItems='center';
    overlay.style.zIndex='9999';

    // Cria a caixa (card) do formulário.
    const formCard = document.createElement('div');
    formCard.style.backgroundColor='white';
    formCard.style.borderRadius='12px';
    formCard.style.padding='24px';
    formCard.style.maxWidth='400px';
    formCard.style.width='90%';
    formCard.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.15)';
    formCard.style.color='#333';

    // Título do formulário.
    const titulo = document.createElement('h3');
    titulo.textContent = `Retorno Manual - ${saida.nome_usuario}`;
    titulo.style.margin='0 0 8px 0';
    titulo.style.fontSize='18px';
    titulo.style.fontWeight='700';

    // Descrição.
    const descricao = document.createElement('p');
    descricao.textContent = 'O aluno foi embora? Registre aqui a data e hora em que retornou.';
    descricao.style.margin='0 0 16px 0';
    descricao.style.color='#666';
    descricao.style.fontSize='14px';

    // Label e input para DATA.
    const labelData = document.createElement('label');
    labelData.textContent = '📅 Data de Retorno';
    labelData.style.display='block';
    labelData.style.fontWeight='600';
    labelData.style.marginTop='12px';
    labelData.style.marginBottom='4px';
    labelData.style.fontSize='14px';

    const inputData = document.createElement('input');
    inputData.type='date';
    inputData.required=true;
    inputData.style.width='100%';
    inputData.style.padding='10px';
    inputData.style.marginBottom='12px';
    inputData.style.borderRadius='6px';
    inputData.style.border='1px solid #ddd';
    inputData.style.fontSize='14px';
    inputData.style.boxSizing='border-box';
    // Define a data padrão (hoje).
    const hoje = new Date().toISOString().split('T')[0];
    inputData.value = hoje;

    // Label e input para HORA.
    const labelHora = document.createElement('label');
    labelHora.textContent = '🕐 Hora de Retorno';
    labelHora.style.display='block';
    labelHora.style.fontWeight='600';
    labelHora.style.marginTop='12px';
    labelHora.style.marginBottom='4px';
    labelHora.style.fontSize='14px';

    const inputHora = document.createElement('input');
    inputHora.type='time';
    inputHora.required=true;
    inputHora.style.width='100%';
    inputHora.style.padding='10px';
    inputHora.style.marginBottom='16px';
    inputHora.style.borderRadius='6px';
    inputHora.style.border='1px solid #ddd';
    inputHora.style.fontSize='14px';
    inputHora.style.boxSizing='border-box';
    // Define a hora padrão (hora atual).
    const agora = new Date();
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    inputHora.value = `${horas}:${minutos}`;

    // Container para botões.
    const botoes = document.createElement('div');
    botoes.style.display='flex';
    botoes.style.gap='8px';
    botoes.style.marginTop='16px';

    // Botão CANCELAR.
    const btnCancelar = document.createElement('button');
    btnCancelar.textContent='Cancelar';
    btnCancelar.className='btn ghost';
    btnCancelar.style.flex='1';
    btnCancelar.style.padding='10px';
    btnCancelar.style.cursor='pointer';
    btnCancelar.onclick = function(){
        document.body.removeChild(overlay);
    };

    // Botão CONFIRMAR.
    const btnConfirmar = document.createElement('button');
    btnConfirmar.textContent='✓ Registrar Retorno';
    btnConfirmar.className='btn';
    btnConfirmar.style.flex='1';
    btnConfirmar.style.padding='10px';
    btnConfirmar.style.backgroundColor='#51cf66';
    btnConfirmar.style.color='white';
    btnConfirmar.style.border='none';
    btnConfirmar.style.borderRadius='6px';
    btnConfirmar.style.cursor='pointer';
    btnConfirmar.style.fontWeight='600';
    btnConfirmar.onclick = async function(){
        // Valida os campos.
        if (!inputData.value || !inputHora.value){
            alert('Preencha a data e a hora!');
            return;
        }

        // Cria a string de data/hora no formato esperado.
        const dataHora = `${inputData.value} ${inputHora.value}:00`;

        // Registra o retorno manual.
        await registrarRetornoManual(saida, dataHora);

        // Fecha o formulário.
        document.body.removeChild(overlay);

        // Recarrega a lista.
        await carregarSaidasPendentes();
    };

    // Monta o formulário.
    botoes.appendChild(btnCancelar);
    botoes.appendChild(btnConfirmar);

    formCard.appendChild(titulo);
    formCard.appendChild(descricao);
    formCard.appendChild(labelData);
    formCard.appendChild(inputData);
    formCard.appendChild(labelHora);
    formCard.appendChild(inputHora);
    formCard.appendChild(botoes);

    overlay.appendChild(formCard);
    document.body.appendChild(overlay);
}

// Registra um retorno manual com data/hora customizada.
// O aluno foi embora e retorna em outro horário.
async function registrarRetornoManual(saida, dataHora){

    try{
        // Obtém usuário logado do localStorage para validação.
        const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado') || '{}');

        // Cria o objeto de dados para enviar à API.
        // data_retorno_customizada contém a data/hora fornecida pelo usuário.
        const dados = {
            id_saida: saida.id_saida,
            id_usuario: saida.id_usuario,
            observacoes: `Retorno manual registrado em ${new Date().toLocaleString('pt-BR')}`,
            data_retorno_customizada: dataHora,  // Data/hora customizada (retorno manual).
            id_usuario_logado: usuarioLogado.id_usuario || 0,
            id_perfil_logado: usuarioLogado.id_perfil || 0
        };

        // Envia o retorno manual para a API.
        const resp = await fetch(`${API_RETORNOS}/retornos/`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(dados)
        });

        if (resp.ok){
            // Sucesso!
            if (typeof showToast==='function')
                showToast(`✓ ${saida.nome_usuario} retornou em ${dataHora}!`,'success');
            else
                alert(`${saida.nome_usuario} retornou em ${dataHora}!`);
        }
        else {
            // Erro na API.
            let e={detail:'Erro ao registrar retorno manual'};
            try{ e = await resp.json(); }catch{}
            throw new Error(e.detail || JSON.stringify(e));
        }
    }catch(err){
        if (typeof showToast==='function')
            showToast(err.message||'Erro ao registrar retorno manual','error');
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
