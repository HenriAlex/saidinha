const API_BASE = 'http://127.0.0.1:8000';

async function carregarDisciplinas() {
    const grid = document.getElementById('disciplinasGrid');
    const countEl = document.getElementById('disciplinasCount');

    if (grid) {
        grid.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const sk = document.createElement('div');
            sk.className = 'skeleton';
            grid.appendChild(sk);
        }
    }

    try {
        const resposta = await fetch(`${API_BASE}/disciplinas/`);
        if (!resposta.ok) throw new Error('Falha ao carregar disciplinas');
        const disciplinas = await resposta.json();

        grid.innerHTML = '';

        if (!disciplinas || disciplinas.length === 0) {
            const vazio = document.createElement('div');
            vazio.className = 'profile-card empty';
            vazio.textContent = 'Nenhuma disciplina cadastrada.';
            grid.appendChild(vazio);
            if (countEl) countEl.textContent = '0 disciplinas';
            return;
        }

        disciplinas.forEach(function(disciplina) {
            const card = document.createElement('div');
            card.className = 'profile-card';

            const head = document.createElement('div');
            head.className = 'profile-head';

            const avatar = document.createElement('div');
            avatar.className = 'profile-avatar';
            avatar.style.background = corPorTexto(disciplina.descricao);
            avatar.textContent = (disciplina.descricao || '?').charAt(0).toUpperCase();

            const title = document.createElement('div');
            title.className = 'profile-title';
            title.textContent = disciplina.descricao;

            head.appendChild(avatar);
            head.appendChild(title);
            card.appendChild(head);

            const actions = document.createElement('div');
            actions.className = 'profile-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'btn-icon';
            editBtn.textContent = '✏️';
            editBtn.title = 'Editar';
            editBtn.onclick = () => editarDisciplina(disciplina.id_disciplina);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-icon danger';
            deleteBtn.textContent = '🗑️';
            deleteBtn.title = 'Excluir';
            deleteBtn.onclick = () => excluirDisciplina(disciplina.id_disciplina, disciplina.descricao);

            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            card.appendChild(actions);

            grid.appendChild(card);
        });

        if (countEl) countEl.textContent = `${disciplinas.length} disciplina${disciplinas.length !== 1 ? 's' : ''}`;

    } catch (erro) {
        console.error('Erro ao carregar disciplinas:', erro);
        grid.innerHTML = '<div class="profile-card error">Erro ao carregar disciplinas.</div>';
    }
}

async function registrarDisciplina() {
    const inputEl = document.getElementById('inputDescricaoDisciplina');
    const descricao = inputEl ? inputEl.value.trim() : '';

    if (!descricao) {
        showToast('Por favor, preencha a descrição da disciplina.', 'error');
        return;
    }

    try {
        console.log('Enviando disciplina:', { descricao });

        const resposta = await fetch(`${API_BASE}/disciplinas/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descricao: descricao })
        });

        console.log('Resposta status:', resposta.status);

        const dados = await resposta.json();
        console.log('Dados da resposta:', dados);

        if (!resposta.ok) {
            throw new Error(dados.detail || 'Erro ao registrar disciplina');
        }

        showToast('✓ Disciplina registrada com sucesso!', 'success');
        if (inputEl) inputEl.value = '';
        setTimeout(() => carregarDisciplinas(), 500);

    } catch (erro) {
        console.error('Erro completo:', erro);
        alert(`Erro ao registrar disciplina:\n${erro.message}`);
        showToast(`Erro: ${erro.message}`, 'error');
    }
}

async function editarDisciplina(id) {
    const novaDescricao = prompt('Nova descrição da disciplina:');
    if (!novaDescricao) return;

    try {
        const resposta = await fetch(`${API_BASE}/disciplinas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                descricao: novaDescricao,
                id_usuario_logado: obterIdUsuarioLogado(),
                id_perfil_logado: obterIdPerfilLogado()
            })
        });

        if (!resposta.ok) throw new Error('Erro ao atualizar disciplina');

        showToast('✓ Disciplina atualizada com sucesso!', 'success');
        carregarDisciplinas();

    } catch (erro) {
        console.error('Erro:', erro);
        showToast(`Erro ao editar: ${erro.message}`, 'error');
    }
}

async function excluirDisciplina(id, descricao) {
    if (!confirm(`Tem certeza que deseja excluir a disciplina "${descricao}"?`)) return;

    try {
        const resposta = await fetch(`${API_BASE}/disciplinas/${id}`, {
            method: 'DELETE'
        });

        if (!resposta.ok) throw new Error('Erro ao excluir disciplina');

        showToast('✓ Disciplina excluída com sucesso!', 'success');
        carregarDisciplinas();

    } catch (erro) {
        console.error('Erro:', erro);
        showToast(`Erro ao excluir: ${erro.message}`, 'error');
    }
}

function filterCurrentScreen(query) {
    const grid = document.getElementById('disciplinasGrid');
    if (!grid) return;

    const cards = grid.querySelectorAll('.profile-card');
    const q = query.toLowerCase();

    cards.forEach(card => {
        const title = card.querySelector('.profile-title');
        const text = title ? title.textContent.toLowerCase() : '';
        card.style.display = text.includes(q) ? 'flex' : 'none';
    });
}
