/* saida.js - Lógica de UI para saídas (registrar, listar, editar, remover)
   Local: frontend/js/saida.js

   Este arquivo contém todas as funções responsáveis por gerenciar
   a interface de saídas dos alunos. As operações incluem:
   - Carregamento e exibição de saídas
   - Registro de novas saídas
   - Edição de saídas existentes
   - Remoção de saídas
   - Filtro e busca
*/

// Define a URL base da API para acesso aos endpoints de saídas.
// Esta constante é utilizada em todas as requisições HTTP.
const API_BASE_SAIDAS = 'http://127.0.0.1:8000';

// ============================================================
// CARREGAR E LISTAR SAÍDAS
// ============================================================

// Carrega todas as saídas registradas e popula o grid de exibição.
// Similar aos usuários, exibe os registros em cards.
async function carregarSaidas(){

    // Obtém a referência do elemento que irá conter os cards de saída.
    const grid = document.getElementById('aidasGrid');

    // Obtém a referência do elemento que mostra a contagem de saídas.
    const countEl = document.getElementById('aidasCount');

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
        // Faz a requisição GET para obter todas as saídas.
        const resp = await fetch(`${API_BASE_SAIDAS}/saidas/`);

        // Verifica se a requisição foi bem-sucedida.
        if (!resp.ok) throw new Error('Falha ao carregar saídas');

        // Converte a resposta JSON para um array de objetos.
        const saidas = await resp.json();

        // Limpa o grid antes de popular com os dados.
        grid.innerHTML = '';

        // Verifica se não há saídas cadastradas.
        if (!saidas || saidas.length === 0){
            const vazio = document.createElement('div');
            vazio.className='profile-card empty';
            vazio.textContent='Nenhuma saída registrada.';
            grid.appendChild(vazio);
            if (countEl) countEl.textContent='0 saídas';
            return;
        }

        // Itera sobre cada saída para criar um card na interface.
        saidas.forEach(s => {
            // Cria o container do card.
            const card = document.createElement('div');
            card.className='profile-card';

            // Cria o cabeçalho do card com avatar e nome.
            const head = document.createElement('div');
            head.className='profile-head';

            // Avatar com cor baseada no nome do usuário.
            const avatar = document.createElement('div');
            avatar.className='profile-avatar';
            avatar.style.background=corPorTexto(s.nome_usuario||'S');
            avatar.textContent=(s.nome_usuario||'?').charAt(0).toUpperCase();

            // Título do card (nome do aluno).
            const title = document.createElement('div');
            title.className='profile-title';
            title.textContent = s.nome_usuario || 'Desconhecido';

            // Adiciona avatar e título ao cabeçalho.
            head.appendChild(avatar);
            head.appendChild(title);

            // Cria a seção de metadados (informações adicionais).
            const meta = document.createElement('div');
            meta.className='profile-meta muted';
            // Formata a data e hora para exibição.
            const dataFormatada = new Date(s.data_saida).toLocaleDateString('pt-BR') + ' ' + new Date(s.data_saida).toLocaleTimeString('pt-BR');
            meta.textContent = `RA: ${s.ra_usuario} • Saída: ${dataFormatada}`;

            // Cria a seção de detalhes da saída.
            const detalhes = document.createElement('div');
            detalhes.className='profile-meta muted';
            detalhes.textContent = `Motivo: ${s.motivo}`;

            // Cria a seção de ações (botões editar e remover).
            const actions = document.createElement('div');
            actions.className='profile-actions';

            // Botão para editar a saída.
            const btnEdit = document.createElement('button');
            btnEdit.className='btn ghost';
            btnEdit.style.marginRight='8px';
            btnEdit.textContent='Editar';
            btnEdit.onclick = function(){ editarSaida(s); };

            // Botão para remover a saída.
            const btnRemove = document.createElement('button');
            btnRemove.className='delete-btn';
            btnRemove.textContent='Remover';
            btnRemove.onclick = function(){ removerSaida(s.id_saida); };

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

        // Atualiza a contagem de saídas exibida.
        if (countEl) countEl.textContent = `${saidas.length} saídas`;

    }catch(err){
        // Exibe mensagem de erro ao usuário.
        if (typeof showToast === 'function')
            showToast(err.message || 'Erro ao carregar saídas','error');
        else
            alert(err.message);
    }
}

// ============================================================
// REGISTRAR SAÍDA
// ============================================================

// Registra uma nova saída de um aluno.
// Lê os dados do formulário e envia para a API.
async function registrarSaida(){

    // Obtém o ID do usuário do campo select.
    const id_usuario = parseInt(document.getElementById('selectUsuarioSaida').value || '0');

    // Obtém a data e hora de entrada.
    const data_entrada = document.getElementById('inputDataEntrada').value.trim();

    // Obtém a data e hora de saída.
    const data_saida = document.getElementById('inputDataSaida').value.trim();

    // Obtém o motivo da saída.
    const motivo = document.getElementById('inputMotivoSaida').value.trim();

    // Valida se todos os campos obrigatórios foram preenchidos.
    if (!id_usuario || !data_entrada || !data_saida || !motivo){
        alert('Preencha todos os campos.');
        return;
    }

    // Cria o objeto com os dados da saída para enviar à API.
    const dados = {
        id_usuario,
        data_entrada,
        data_saida,
        motivo
    };

    // Se estiver em modo edição, usa PUT em vez de POST.
    if (window.saidaEditId) {
        try{
            // Faz requisição PUT para atualizar a saída.
            const resp = await fetch(`${API_BASE_SAIDAS}/saidas/${window.saidaEditId}`, {
                method:'PUT',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify(dados)
            });

            if (resp.ok){
                const res = await resp.json();
                if (typeof showToast==='function')
                    showToast(res.mensagem||'Saída atualizada','success');
                else
                    alert(res.mensagem||'Saída atualizada');

                // Limpa o formulário e reseta o ID de edição.
                document.getElementById('formSaida').reset();
                window.saidaEditId = null;

                // Recarrega a lista de saídas.
                await carregarSaidas();

                // Redireciona para a tela de listagem.
                location.hash = '#telaSaidas';
                showScreen('telaSaidas');
                document.querySelectorAll('.nav-item[data-screen]').forEach(function(btn){
                    btn.classList.toggle('active', btn.getAttribute('data-screen') === 'telaSaidas');
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
                showToast(err.message||'Erro ao atualizar saída','error');
            else
                alert(err.message);
            return;
        }
    }

    // Registra uma nova saída.
    try{
        // Faz requisição POST para criar um novo registro de saída.
        const resp = await fetch(`${API_BASE_SAIDAS}/saidas/`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(dados)
        });

        if (resp.ok){
            const res = await resp.json();
            if (typeof showToast==='function')
                showToast(res.mensagem||'Saída registrada','success');
            else
                alert(res.mensagem||'Saída registrada');

            // Limpa o formulário.
            document.getElementById('formSaida').reset();

            // Recarrega a lista de saídas.
            await carregarSaidas();

            // Redireciona para a tela de listagem.
            location.hash = '#telaSaidas';
            showScreen('telaSaidas');
            document.querySelectorAll('.nav-item[data-screen]').forEach(function(btn){
                btn.classList.toggle('active', btn.getAttribute('data-screen') === 'telaSaidas');
            });
        }
        else {
            let e={detail:'Erro'};
            try{ e = await resp.json(); }catch{}
            alert(e.detail || JSON.stringify(e));
        }
    }catch(err){
        if (typeof showToast==='function')
            showToast(err.message||'Erro ao registrar saída','error');
        else
            alert(err.message);
    }
}

// ============================================================
// REMOVER SAÍDA
// ============================================================

// Remove um registro de saída do sistema.
// Solicita confirmação antes de executar a ação.
async function removerSaida(id_saida){

    // Solicita confirmação ao usuário antes de remover.
    const confirmado = await (
        typeof showModal === 'function'
            ? showModal('Confirmar remoção','Deseja remover este registro de saída?')
            : Promise.resolve(confirm('Deseja remover este registro de saída?'))
    );

    // Se o usuário cancelou, interrompe a operação.
    if (!confirmado) return;

    try{
        // Faz requisição DELETE para remover a saída.
        const resp = await fetch(`${API_BASE_SAIDAS}/saidas/${id_saida}`, {
            method:'DELETE'
        });

        if (resp.ok){
            const res = await resp.json();
            if (typeof showToast==='function')
                showToast(res.mensagem||'Saída removida','success');

            // Recarrega a lista de saídas.
            await carregarSaidas();
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
        alert(err.message || 'Erro ao remover saída');
    }
}

// ============================================================
// FILTRO E BUSCA
// ============================================================

// Filtra as saídas exibidas baseado em um texto de busca.
// Busca no nome do aluno, RA e motivo da saída.
function filterSaidas(text){

    // Obtém a referência do grid de saídas.
    const grid = document.getElementById('aidasGrid');
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

    // Atualiza a contagem de saídas visíveis.
    const countEl = document.getElementById('aidasCount');
    if (countEl) countEl.textContent = `${visible} saídas`;
}

// ============================================================
// POPULAR SELECT DE USUÁRIOS
// ============================================================

// Preenche o campo select de usuários no formulário de saída.
// Isso permite que o usuário escolha qual aluno está saindo.
async function popularSelectUsuariosSaida(){

    // Obtém a referência do elemento select.
    const sel = document.getElementById('selectUsuarioSaida');
    if (!sel) return;

    try{
        // Faz requisição GET para obter lista de usuários.
        const r = await fetch(`${API_BASE_SAIDAS}/usuarios/`);
        if (!r.ok) return;

        // Converte a resposta JSON em array de usuários.
        const usuarios = await r.json();

        // Limpa o select e adiciona opção padrão.
        sel.innerHTML = '<option value="">Selecione um usuário</option>';

        // Adiciona cada usuário como uma opção do select.
        usuarios.forEach(u => {
            const o = document.createElement('option');
            o.value = u.id_usuario;
            o.textContent = `${u.nome} (${u.ra})`;
            sel.appendChild(o);
        });

        // Se houver usuários, pré-seleciona o primeiro.
        if (usuarios && usuarios.length > 0)
            sel.value = usuarios[0].id_usuario;

    }catch(e){}
}

// ============================================================
// EDITAR SAÍDA
// ============================================================

// Inicia o modo de edição para uma saída existente.
// Pré-preenche o formulário com os dados da saída selecionada.
function editarSaida(s){

    // Preenche o select com usuários disponíveis.
    popularSelectUsuariosSaida().then(()=>{
        // Seleciona o usuário da saída sendo editada.
        try{
            document.getElementById('selectUsuarioSaida').value = s.id_usuario;
        }catch(e){}
    });

    // Preenche o campo de data e hora de entrada.
    document.getElementById('inputDataEntrada').value = s.data_entrada || '';

    // Preenche o campo de data e hora de saída.
    document.getElementById('inputDataSaida').value = s.data_saida || '';

    // Preenche o campo de motivo.
    document.getElementById('inputMotivoSaida').value = s.motivo || '';

    // Armazena o ID da saída sendo editada.
    window.saidaEditId = s.id_saida;

    // Exibe a tela de cadastro/edição de saída.
    showScreen('telaSaidaCadastro');
}
