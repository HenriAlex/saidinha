const API_BASE = 'http://127.0.0.1:8000';

async function carregarAtividades() {
    const grid = document.getElementById('atividadesGrid');
    const countEl = document.getElementById('atividadesCount');

    if (grid) {
        grid.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const sk = document.createElement('div');
            sk.className = 'skeleton';
            grid.appendChild(sk);
        }
    }

    try {
        const resposta = await fetch(`${API_BASE}/atividades/`);
        if (!resposta.ok) throw new Error('Falha ao carregar atividades');
        const atividades = await resposta.json();

        grid.innerHTML = '';

        if (!atividades || atividades.length === 0) {
            const vazio = document.createElement('div');
            vazio.className = 'profile-card empty';
            vazio.textContent = 'Nenhuma atividade cadastrada.';
            grid.appendChild(vazio);
            if (countEl) countEl.textContent = '0 atividades';
            return;
        }

        Promise.all([
            fetch(`${API_BASE}/usuarios/`),
            fetch(`${API_BASE}/disciplinas/`)
        ]).then(async ([respUsers, respDiscipl]) => {
            const usuarios = respUsers.ok ? await respUsers.json() : [];
            const disciplinas = respDiscipl.ok ? await respDiscipl.json() : [];

            const userMap = usuarios.reduce((m, u) => { m[u.id_usuario] = u.nome; return m; }, {});
            const discMap = disciplinas.reduce((m, d) => { m[d.id_disciplina] = d.descricao; return m; }, {});

            grid.innerHTML = '';

            atividades.forEach(function(atividade) {
                const card = document.createElement('div');
                card.className = 'profile-card';

                const head = document.createElement('div');
                head.className = 'profile-head';

                const avatar = document.createElement('div');
                avatar.className = 'profile-avatar';
                avatar.style.background = corPorTexto(discMap[atividade.id_disciplina] || 'Atividade');
                avatar.textContent = '📋';

                const titleDiv = document.createElement('div');
                titleDiv.style.flex = '1';

                const title = document.createElement('div');
                title.className = 'profile-title';
                title.textContent = discMap[atividade.id_disciplina] || 'Desconhecida';

                const subtitle = document.createElement('div');
                subtitle.className = 'subtitle';
                subtitle.textContent = `${userMap[atividade.id_usuario] || 'Aluno'}  •  ${atividade.bimestre}º Bim  •  ⭐ ${atividade.pontos}`;

                titleDiv.appendChild(title);
                titleDiv.appendChild(subtitle);

                head.appendChild(avatar);
                head.appendChild(titleDiv);
                card.appendChild(head);

                const actions = document.createElement('div');
                actions.className = 'profile-actions';

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn-icon danger';
                deleteBtn.textContent = '🗑️';
                deleteBtn.title = 'Excluir';
                deleteBtn.onclick = () => excluirAtividade(atividade.id_atividade);

                actions.appendChild(deleteBtn);
                card.appendChild(actions);

                grid.appendChild(card);
            });

            if (countEl) countEl.textContent = `${atividades.length} atividade${atividades.length !== 1 ? 's' : ''}`;

        });

    } catch (erro) {
        console.error('Erro ao carregar atividades:', erro);
        grid.innerHTML = '<div class="profile-card error">Erro ao carregar atividades.</div>';
    }
}

async function carregarSelectsAtividade() {
    try {
        const [respUsers, respDiscipl] = await Promise.all([
            fetch(`${API_BASE}/usuarios/`),
            fetch(`${API_BASE}/disciplinas/`)
        ]);

        if (respUsers.ok) {
            const usuarios = await respUsers.json();
            const selectUser = document.getElementById('selectUsuarioAtividade');
            selectUser.innerHTML = '<option value="">Selecione o aluno</option>';
            usuarios.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id_usuario;
                opt.textContent = u.nome;
                selectUser.appendChild(opt);
            });
        }

        if (respDiscipl.ok) {
            const disciplinas = await respDiscipl.json();
            const selectDisc = document.getElementById('selectDisciplinaAtividade');
            selectDisc.innerHTML = '<option value="">Selecione a disciplina</option>';
            disciplinas.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.id_disciplina;
                opt.textContent = d.descricao;
                selectDisc.appendChild(opt);
            });
        }
    } catch (erro) {
        console.error('Erro ao carregar selects:', erro);
    }
}

async function registrarAtividade() {
    const idUsuario = document.getElementById('selectUsuarioAtividade').value;
    const idDisciplina = document.getElementById('selectDisciplinaAtividade').value;
    const dataAtividade = document.getElementById('inputDataAtividade').value;
    const bimestre = document.getElementById('selectBimestreAtividade').value;
    const pontos = document.getElementById('inputPontosAtividade').value;
    const descricao = document.getElementById('inputDescricaoAtividade').value;

    if (!idUsuario || !idDisciplina || !dataAtividade || !bimestre || !pontos) {
        showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }

    try {
        const resposta = await fetch(`${API_BASE}/atividades/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_usuario: parseInt(idUsuario),
                id_disciplina: parseInt(idDisciplina),
                data_atividade: dataAtividade,
                bimestre: parseInt(bimestre),
                pontos: parseFloat(pontos),
                descricao: descricao,
                id_usuario_logado: obterIdUsuarioLogado(),
                id_perfil_logado: obterIdPerfilLogado()
            })
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.detail || 'Erro ao registrar atividade');
        }

        showToast('✓ Atividade registrada com sucesso!', 'success');
        document.getElementById('formAtividadeInline').reset();
        carregarAtividades();

    } catch (erro) {
        console.error('Erro:', erro);
        showToast(`Erro ao registrar: ${erro.message}`, 'error');
    }
}

async function excluirAtividade(id) {
    if (!confirm('Tem certeza que deseja excluir esta atividade?')) return;

    try {
        const resposta = await fetch(`${API_BASE}/atividades/${id}`, {
            method: 'DELETE'
        });

        if (!resposta.ok) throw new Error('Erro ao excluir atividade');

        showToast('✓ Atividade excluída com sucesso!', 'success');
        carregarAtividades();

    } catch (erro) {
        console.error('Erro:', erro);
        showToast(`Erro ao excluir: ${erro.message}`, 'error');
    }
}
