/* retorno.js - Lógica de UI para retornos (registrar, listar, editar, remover)
   Local: frontend/js/retorno.js

   Este arquivo contém todas as funções responsáveis por gerenciar
   a interface de RETORNOS dos alunos (quando retornam à instituição).
   As operações incluem:
   - Carregamento e exibição de retornos
   - Registro de novos retornos
   - Edição de retornos existentes
   - Remoção de retornos
   - Filtro e busca
*/

// Define a URL base da API para acesso aos endpoints de retornos.
// Esta constante é utilizada em todas as requisições HTTP.
const API_BASE_RETORNOS = 'http://127.0.0.1:8000';

// ============================================================
// CARREGAR E LISTAR RETORNOS
// ============================================================

// Carrega todos os retornos registrados e popula o grid de exibição.
// Similar aos usuários, exibe os registros em cards.
async function carregarRetornos(){

    // Obtém a referência do elemento que irá conter os cards de retorno.
    const grid = document.getElementById('retornosGrid');

    // Obtém a referência do elemento que mostra a contagem de retornos.
    const countEl = document.getElementById('retornosCount');

    // Exibe esqueletos de carregamento enquanto os dados são buscados.
    if (grid) {
        grid.innerHTML = '';
        // Cria 3 esqueletos para simular o carregamento dos dados.
        for (let i=0;i<3;i++){
            const sk = document.createElement('div');
            sk.className='skeleton';
            grid.appendChild(sk);
        }
    }

    try{
        // Faz a requisição GET para obter todos os retornos.
        const resp = await fetch(`${API_BASE_RETORNOS}/retornos/`);

        // Verifica se a requisição foi bem-sucedida.
        if (!resp.ok) throw new Error('Falha ao carregar retornos');

        // Converte a resposta JSON para um array de objetos.
        const retornos = await resp.json();

        // Limpa o grid antes de popular com os dados.
        grid.innerHTML = '';

        // Verifica se não há retornos cadastrados.
        if (!retornos || retornos.length === 0){
            const vazio = document.createElement('div');
            vazio.className='profile-card empty';
            vazio.textContent='Nenhum retorno registrado.';
            grid.appendChild(vazio);
            if (countEl) countEl.textContent='0 retornos';
            return;
        }

        // Itera sobre cada retorno para criar um card na interface.
        retornos.forEach(r => {
            // Cria o container do card.
            const card = document.createElement('div');
            card.className='profile-card';

            // Cria o cabeçalho do card com avatar e nome.
            const head = document.createElement('div');
            head.className='profile-head';

            // Avatar com cor baseada no nome do usuário.
            const avatar = document.createElement('div');
            avatar.className='profile-avatar';
            avatar.style.background=corPorTexto(r.nome_usuario||'R');
            avatar.textContent=(r.nome_usuario||'?').charAt(0).toUpperCase();

            // Título do card (nome do aluno).
            const title = document.createElement('div');
            title.className='profile-title';
            title.textContent = r.nome_usuario || 'Desconhecido';

            // Adiciona avatar e título ao cabeçalho.
            head.appendChild(avatar);
            head.appendChild(title);

            // Cria a seção de metadados (informações adicionais).
            const meta = document.createElement('div');
            meta.className='profile-meta muted';
            // Formata a data e hora do retorno para exibição.
            const dataRetorno = new Date(r.data_retorno).toLocaleDateString('pt-BR') + ' ' + new Date(r.data_retorno).toLocaleTimeString('pt-BR');
            meta.textContent = `RA: ${r.ra_usuario} • Retorno: ${dataRetorno}`;

            // Cria a seção de detalhes do retorno.
            const detalhes = document.createElement('div');
            detalhes.className='profile-meta muted';
            // Formata a data e hora da saída associada.
            const dataSaida = new Date(r.data_saida).toLocaleDateString('pt-BR');
            detalhes.textContent = `Saída: ${dataSaida} - Motivo: ${r.motivo_saida}`;

            // Cria a seção de observações (se existirem).
            if (r.observacoes) {
                const obs = document.createElement('div');
                obs.className='profile-meta muted';
                obs.textContent = `Observações: ${r.observacoes}`;
                card.appendChild(obs);
            }

            // Cria a seção de ações (botões editar e remover).
            const actions = document.createElement('div');
            actions.className='profile-actions';

            // Botão para editar o retorno.
            const btnEdit = document.createElement('button');
            btnEdit.className='btn ghost';
            btnEdit.style.marginRight='8px';
            btnEdit.textContent='Editar';
            btnEdit.onclick = function(){ editarRetorno(r); };

            // Botão para remover o retorno.
            const btnRemove = document.createElement('button');
            btnRemove.className='delete-btn';
            btnRemove.textContent='Remover';
            btnRemove.onclick = function(){ removerRetorno(r.id_retorno); };

            // Adiciona os botões à seção de ações.
            actions.appendChild(btnEdit);
            actions.appendChild(btnRemove);

            // Adiciona todos os elementos ao card.
            card.appendChild(head);
            card.appendChild(meta);
            card.appendChild(detalhes);
            card.appendChild(actions);

            // Adiciona o card ao grid.
            grid.appendChild(card);
        });

        // Atualiza a contagem de retornos exibida.
        if (countEl) countEl.textContent = `${retornos.length} retornos`;

    }catch(err){
        // Exibe mensagem de erro ao usuário.
        if (typeof showToast === 'function')
            showToast(err.message || 'Erro ao carregar retornos','error');
        else
            alert(err.message);
    }
}

// ============================================================
// REGISTRAR RETORNO
// ============================================================

// Registra um novo retorno de um aluno.
// Lê os dados do formulário e envia para a API.
async function registrarRetorno(){

    // Obtém o ID da saída do campo select.
    const id_saida = parseInt(document.getElementById('selectSaidaRetorno').value || '0');

    // Obtém o ID do usuário do campo.
    const id_usuario = parseInt(document.getElementById('inputUsuarioRetorno').value || '0');

    // Obtém a data e hora de retorno.
    const data_retorno = document.getElementById('inputDataRetorno').value.trim();

    // Obtém as observações (opcional).
    const observacoes = document.getElementById('inputObservacoes').value.trim();

    // Valida se todos os campos obrigatórios foram preenchidos.
    if (!id_saida || !id_usuario || !data_retorno){
        alert('Preencha ID da saída, usuário e data de retorno.');
        return;
    }

    // Cria o objeto com os dados do retorno para enviar à API.
    const dados = {
        id_saida,
        id_usuario,
        data_retorno,
        observacoes
    };

    // Se estiver em modo edição, usa PUT em vez de POST.
    if (window.retornoEditId) {
        try{
            // Faz requisição PUT para atualizar o retorno.
            const resp = await fetch(`${API_BASE_RETORNOS}/retornos/${window.retornoEditId}`, {
                method:'PUT',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify(dados)
            });

            if (resp.ok){
                const res = await resp.json();
                if (typeof showToast==='function')
                    showToast(res.mensagem||'Retorno atualizado','success');
                else
                    alert(res.mensagem||'Retorno atualizado');

                // Limpa o formulário e reseta o ID de edição.
                document.getElementById('formRetorno').reset();
                window.retornoEditId = null;

                // Recarrega a lista de retornos.
                await carregarRetornos();

                // Redireciona para a tela de listagem.
                location.hash = '#telaRetornos';
                showScreen('telaRetornos');
                document.querySelectorAll('.nav-item[data-screen]').forEach(function(btn){
                    btn.classList.toggle('active', btn.getAttribute('data-screen') === 'telaRetornos');
                });
                return;
            }
            else {
                let e={detail:'Erro'};
                try{ e = await resp.json(); }catch{}
                alert(e.detail || JSON.stringify(e));
                return;
            }
        }catch(err){
            if (typeof showToast==='function')
                showToast(err.message||'Erro ao atualizar retorno','error');
            else
                alert(err.message);
            return;
        }
    }

    // Registra um novo retorno.
    try{
        // Faz requisição POST para criar um novo registro de retorno.
        const resp = await fetch(`${API_BASE_RETORNOS}/retornos/`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(dados)
        });

        if (resp.ok){
            const res = await resp.json();
            if (typeof showToast==='function')
                showToast(res.mensagem||'Retorno registrado','success');
            else
                alert(res.mensagem||'Retorno registrado');

            // Limpa o formulário.
            document.getElementById('formRetorno').reset();

            // Recarrega a lista de retornos.
            await carregarRetornos();

            // Redireciona para a tela de listagem.
            location.hash = '#telaRetornos';
            showScreen('telaRetornos');
            document.querySelectorAll('.nav-item[data-screen]').forEach(function(btn){
                btn.classList.toggle('active', btn.getAttribute('data-screen') === 'telaRetornos');
            });
        }
        else {
            let e={detail:'Erro'};
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
// REMOVER RETORNO
// ============================================================

// Remove um registro de retorno do sistema.
// Solicita confirmação antes de executar a ação.
async function removerRetorno(id_retorno){

    // Solicita confirmação ao usuário antes de remover.
    const confirmado = await (
        typeof showModal === 'function'
            ? showModal('Confirmar remoção','Deseja remover este registro de retorno?')
            : Promise.resolve(confirm('Deseja remover este registro de retorno?'))
    );

    // Se o usuário cancelou, interrompe a operação.
    if (!confirmado) return;

    try{
        // Faz requisição DELETE para remover o retorno.
        const resp = await fetch(`${API_BASE_RETORNOS}/retornos/${id_retorno}`, {
            method:'DELETE'
        });

        if (resp.ok){
            const res = await resp.json();
            if (typeof showToast==='function')
                showToast(res.mensagem||'Retorno removido','success');

            // Recarrega a lista de retornos.
            await carregarRetornos();
        }
        else {
            let e={detail:'Erro'};
            try{ e = await resp.json(); }catch{}
            if (typeof showToast==='function')
                showToast(e.detail||JSON.stringify(e),'error');
            else
                alert(e.detail||JSON.stringify(e));
        }
    }catch(err){
        alert(err.message || 'Erro ao remover retorno');
    }
}

// ============================================================
// FILTRO E BUSCA
// ============================================================

// Filtra os retornos exibidos baseado em um texto de busca.
// Busca no nome do aluno, RA e observações.
function filterRetornos(text){

    // Obtém a referência do grid de retornos.
    const grid = document.getElementById('retornosGrid');
    if (!grid) return;

    // Converte o texto para minúsculas e remove espaços extras.
    const q = (text||'').toLowerCase().trim();
    let visible=0;

    // Obtém todos os cards do grid.
    const cards = Array.from(grid.children);

    // Itera sobre cada card para verificar se deve ser exibido.
    cards.forEach(card=>{
        // Pula cards que não são do tipo profile-card.
        if (!card.classList.contains('profile-card')) return;

        // Obtém os textos dos elementos do card.
        const title = (card.querySelector('.profile-title')||{}).textContent.toLowerCase()||'';
        const meta = (card.querySelector('.profile-meta')||{}).textContent.toLowerCase()||'';

        // Verifica se o texto de busca aparece no título ou nos metadados.
        const match = title.includes(q) || meta.includes(q);

        // Exibe ou esconde o card conforme o resultado da busca.
        card.style.display = match ? '' : 'none';
        if (match) visible++;
    });

    // Atualiza a contagem de retornos visíveis.
    const countEl = document.getElementById('retornosCount');
    if (countEl) countEl.textContent = `${visible} retornos`;
}

// ============================================================
// POPULAR SELECT DE SAÍDAS
// ============================================================

// Preenche o campo select de saídas no formulário de retorno.
// Isso permite que o usuário escolha qual saída está retornando.
async function popularSelectSaidasRetorno(){

    // Obtém a referência do elemento select.
    const sel = document.getElementById('selectSaidaRetorno');
    if (!sel) return;

    try{
        // Faz requisição GET para obter lista de saídas.
        const r = await fetch(`${API_BASE_RETORNOS}/saidas/`);
        if (!r.ok) return;

        // Converte a resposta JSON em array de saídas.
        const saidas = await r.json();

        // Limpa o select e adiciona opção padrão.
        sel.innerHTML = '<option value="">Selecione uma saída</option>';

        // Adiciona cada saída como uma opção do select.
        saidas.forEach(s => {
            const o = document.createElement('option');
            o.value = s.id_saida;
            const dataSaida = new Date(s.data_saida).toLocaleDateString('pt-BR');
            o.textContent = `${s.nome_usuario} (${s.ra_usuario}) - ${dataSaida}`;
            sel.appendChild(o);
        });

        // Se houver saídas, pré-seleciona a primeira.
        if (saidas && saidas.length > 0)
            sel.value = saidas[0].id_saida;

    }catch(e){}
}

// ============================================================
// EDITAR RETORNO
// ============================================================

// Inicia o modo de edição para um retorno existente.
// Pré-preenche o formulário com os dados do retorno selecionado.
function editarRetorno(r){

    // Preenche o select com saídas disponíveis.
    popularSelectSaidasRetorno().then(()=>{
        // Seleciona a saída do retorno sendo editado.
        try{
            document.getElementById('selectSaidaRetorno').value = r.id_saida;
        }catch(e){}
    });

    // Preenche o campo com ID do usuário (readonly).
    document.getElementById('inputUsuarioRetorno').value = r.id_usuario || '';

    // Preenche o campo de data e hora de retorno.
    document.getElementById('inputDataRetorno').value = r.data_retorno || '';

    // Preenche o campo de observações.
    document.getElementById('inputObservacoes').value = r.observacoes || '';

    // Armazena o ID do retorno sendo editado.
    window.retornoEditId = r.id_retorno;

    // Exibe a tela de cadastro/edição de retorno.
    showScreen('telaRetornoCadastro');
}
