/* perfil.js - Lógica relacionada a perfis (listar, cadastrar, remover)
   Local: frontend/js/perfil.js
*/

// Endereço base da API (ajuste se necessário)
const API_BASE = 'http://127.0.0.1:8000';

// Lista os perfis e monta o grid com opção de remoção.
async function carregarPerfis() {
    // Target do novo grid de perfis
    const grid = document.getElementById('profilesGrid');
    const countEl = document.getElementById('profilesCount');

    // Exibe placeholders (skeleton) enquanto a requisição está em andamento.
    if (grid) {
        grid.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const sk = document.createElement('div');
            sk.className = 'skeleton';
            grid.appendChild(sk);
        }
    }

    try {
        // Requisição GET para obter perfis
        const resposta = await fetch(`${API_BASE}/perfis/`);
        if (!resposta.ok) throw new Error('Falha ao carregar perfis');
        const perfis = await resposta.json();

        grid.innerHTML = '';

        // Feedback quando não há perfis
        if (!perfis || perfis.length === 0) {
            const vazio = document.createElement('div');
            vazio.className = 'profile-card empty';
            vazio.textContent = 'Nenhum perfil cadastrado.';
            grid.appendChild(vazio);
            if (countEl) countEl.textContent = '0 perfis';
            atualizarEstatistica(0);
            return;
        }

        // Cria cartões de perfil
        perfis.forEach(function(perfil) {
            const card = document.createElement('div');
            card.className = 'profile-card';

            // Cabeçalho do cartão: avatar com inicial + título
            const head = document.createElement('div');
            head.className = 'profile-head';

            const avatar = document.createElement('div');
            avatar.className = 'profile-avatar';
            avatar.style.background = corPorTexto(perfil.ds_perfil);
            avatar.textContent = (perfil.ds_perfil || '?').charAt(0).toUpperCase();

            const title = document.createElement('div');
            title.className = 'profile-title';
            title.textContent = perfil.ds_perfil;

            head.appendChild(avatar);
            head.appendChild(title);

            const meta = document.createElement('div');
            meta.className = 'profile-meta muted';
            meta.textContent = `ID: ${perfil.id_perfil}`;

            const actions = document.createElement('div');
            actions.className = 'profile-actions';

            const btnRemove = document.createElement('button');
            btnRemove.className = 'delete-btn';
            btnRemove.textContent = 'Remover';
            btnRemove.onclick = function(){ removerPerfil(perfil.id_perfil); };

            actions.appendChild(btnRemove);

            card.appendChild(head);
            card.appendChild(meta);
            card.appendChild(actions);

            grid.appendChild(card);
        });

        if (countEl) countEl.textContent = `${perfis.length} perfis`;
        atualizarEstatistica(perfis.length);
    } catch (err) {
        // Mensagem simples de erro via toast
        if (typeof showToast === 'function') showToast(err.message || 'Erro inesperado ao carregar perfis', 'error');
        else alert(err.message || 'Erro inesperado ao carregar perfis');
    }
}

// Cadastra um novo perfil usando o formulário existente.
async function cadastrarPerfil() {
    const descricaoInput = document.getElementById('descricaoPerfil');
    const descricao = descricaoInput.value;
    if (descricao.trim() === '') {
        alert('Digite uma descrição para o perfil.');
        return;
    }

    const dados = { ds_perfil: descricao };

    try {
        const resposta = await fetch(`${API_BASE}/perfis/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (resposta.ok) {
            const resultado = await resposta.json();
            // Feedback ao usuário via toast
            if (typeof showToast === 'function') showToast(resultado.mensagem || 'Perfil cadastrado.', 'success');
            else alert(resultado.mensagem || 'Perfil cadastrado.');
            descricaoInput.value = '';
            // Atualiza a lista e mostra a tela de listagem
            await carregarPerfis();
            showScreen('telaLista');
        } else {
            let erro = { detail: 'Erro desconhecido' };
            try { erro = await resposta.json(); } catch(e){}
            alert(erro.detail || JSON.stringify(erro));
        }
        } catch (err) {
        if (typeof showToast === 'function') showToast(err.message || 'Erro ao cadastrar perfil', 'error');
        else alert(err.message || 'Erro ao cadastrar perfil');
    }
}

// Remove um perfil pelo id, com confirmação do usuário.
async function removerPerfil(id_perfil) {
    // Usa modal customizado de confirmação (melhor UX) e aguarda resposta.
    const confirmado = await (typeof showModal === 'function' ? showModal('Confirmar remoção', 'Confirma a remoção deste perfil? Esta ação é irreversível.') : Promise.resolve(confirm('Confirma a remoção deste perfil? Esta ação é irreversível.')));
    if (!confirmado) return;

    try {
        const resposta = await fetch(`${API_BASE}/perfis/${id_perfil}`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            const resultado = await resposta.json();
            if (typeof showToast === 'function') showToast(resultado.mensagem || 'Perfil removido.', 'success');
            else alert(resultado.mensagem || 'Perfil removido.');
            // Atualiza a lista sem recarregar a página
            await carregarPerfis();
        } else {
            let erro = { detail: 'Erro desconhecido' };
            try { erro = await resposta.json(); } catch(e){}
            if (typeof showToast === 'function') showToast(erro.detail || JSON.stringify(erro), 'error');
            else alert(erro.detail || JSON.stringify(erro));
        }
    } catch (err) {
        alert(err.message || 'Erro ao remover perfil');
    }
}


// Filtra os perfis já renderizados no grid por texto (client-side)
function filterProfiles(text){
    const grid = document.getElementById('profilesGrid');
    if (!grid) return;
    const q = (text || '').toLowerCase().trim();
    const cards = Array.from(grid.children);
    let visible = 0;
    cards.forEach(card => {
        // pular nós não relacionados
        if (!card.classList.contains('profile-card')) return;
        const titleEl = card.querySelector('.profile-title');
        const title = titleEl ? titleEl.textContent.toLowerCase() : '';
        const match = title.includes(q);
        card.style.display = match ? '' : 'none';
        if (match) visible++;
    });
    const countEl = document.getElementById('profilesCount');
    if (countEl) countEl.textContent = `${visible} perfis`;
}


// Atualiza o cartão de estatística exibido na tela de boas-vindas.
function atualizarEstatistica(total){
    const statEl = document.getElementById('statTotal');
    if (statEl) statEl.textContent = total;
}

// Gera uma cor consistente (hash simples) a partir do texto, usada no avatar.
function corPorTexto(texto){
    const paleta = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];
    let hash = 0;
    for (let i = 0; i < (texto || '').length; i++) {
        hash = texto.charCodeAt(i) + ((hash << 5) - hash);
    }
    return paleta[Math.abs(hash) % paleta.length];
}
