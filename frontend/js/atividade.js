// Histórico e edição: implementar visualização por data, pesquisa e edição usando o formulário inline
window.atividadesHistoricoLista = [];

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

            // exibe apenas atividades do dia atual por padrão (para não poluir a tela)
            const hoje = new Date();
            const ano = hoje.getFullYear();
            const mes = String(hoje.getMonth() + 1).padStart(2, '0');
            const dia = String(hoje.getDate()).padStart(2, '0');
            const hojeStr = `${ano}-${mes}-${dia}`;
            // garante que o campo de filtro reflita o padrão (útil para edição/consulta)
            const filtroEl = document.getElementById('filtroDataAtividades'); if (filtroEl && !filtroEl.value) filtroEl.value = hojeStr;

            const listaMostrar = (atividades || []).filter(a => String((a.data_atividade || '').toString().slice(0,10)) === hojeStr);

            listaMostrar.forEach(function(atividade) {
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

            if (countEl) countEl.textContent = `${listaMostrar.length} atividade${listaMostrar.length !== 1 ? 's' : ''}`;

        });

    } catch (erro) {
        console.error('Erro ao carregar atividades:', erro);
        grid.innerHTML = '<div class="profile-card error">Erro ao carregar atividades.</div>';
    }
}

function preencherDataHojeEBimestre() {    const dataInput = document.getElementById('inputDataAtividade');    const bimestreSelect = document.getElementById('selectBimestreAtividade');    const hoje = new Date();    const ano = hoje.getFullYear();    const mes = String(hoje.getMonth() + 1).padStart(2, '0');    const dia = String(hoje.getDate()).padStart(2, '0');    const dataHoje = `${ano}-${mes}-${dia}`;    if (dataInput) {        dataInput.value = dataHoje;    }    // Também garante que o filtro de histórico ponto para hoje por padrão    const filtroEl = document.getElementById('filtroDataAtividades');    if (filtroEl && !filtroEl.value) {        filtroEl.value = dataHoje;    }    if (bimestreSelect) {        bimestreSelect.value = '4';    }}

async function carregarSelectsAtividade() {
    try {
        const respUsers = await fetch(`${API_BASE}/usuarios/`);
        if (respUsers.ok) {
            const usuarios = await respUsers.json();
            const selectUser = document.getElementById('selectUsuarioAtividade');
            if (selectUser) {
                selectUser.innerHTML = '<option value="">Selecione o aluno</option>';
                usuarios.forEach(u => {
                    const opt = document.createElement('option');
                    opt.value = u.id_usuario;
                    opt.textContent = u.nome;
                    selectUser.appendChild(opt);
                });
            }
        } else {
            console.error('Erro ao carregar usuários:', respUsers.status);
        }

        const respDiscipl = await fetch(`${API_BASE}/disciplinas/`);
        if (respDiscipl.ok) {
            const disciplinas = await respDiscipl.json();
            const selectDisc = document.getElementById('selectDisciplinaAtividade');
            if (selectDisc) {
                selectDisc.innerHTML = '<option value="">Selecione a disciplina</option>';
                disciplinas.forEach(d => {
                    const opt = document.createElement('option');
                    opt.value = d.id_disciplina;
                    opt.textContent = d.descricao;
                    selectDisc.appendChild(opt);
                });
            }
        } else {
            console.error('Erro ao carregar disciplinas:', respDiscipl.status);
        }

        preencherDataHojeEBimestre();
    } catch (erro) {
        console.error('Erro ao carregar selects:', erro);
        showToast('Erro ao carregar dados dos selects', 'error');
    }
}

async function registrarAtividade() {    const idUsuario = document.getElementById('selectUsuarioAtividade').value;    const idDisciplina = document.getElementById('selectDisciplinaAtividade').value;    const dataAtividade = document.getElementById('inputDataAtividade').value;    const bimestre = document.getElementById('selectBimestreAtividade').value;    const pontos = document.getElementById('inputPontosAtividade').value;    const descricao = document.getElementById('inputDescricaoAtividade').value;    if (!idUsuario || !idDisciplina || !dataAtividade || !bimestre || !pontos) {        showToast('Por favor, preencha todos os campos obrigatórios.', 'error');        return;    }    // Prepara payload comum    const payload = {        id_usuario: parseInt(idUsuario),        id_disciplina: parseInt(idDisciplina),        data_atividade: dataAtividade,        bimestre: parseInt(bimestre),        pontos: parseFloat(pontos),        descricao: descricao    };    try {        // Se estivermos editando uma atividade existente, faz PUT        if (window.atividadeEditId) {            const respEdit = await fetch(`${API_BASE}/atividades/${window.atividadeEditId}`, {                method: 'PUT',                headers: { 'Content-Type': 'application/json' },                body: JSON.stringify(payload)            });            if (!respEdit.ok) {                let e = { detail: 'Erro' };                try { e = await respEdit.json(); } catch (er) {}                throw new Error(e.detail || 'Erro ao atualizar atividade');            }            showToast('✓ Atividade atualizada!', 'success');            window.atividadeEditId = null;            document.getElementById('formAtividadeInline').reset();            preencherDataHojeEBimestre();            carregarAtividades();            carregarAtividadesHistorico(document.getElementById('filtroDataAtividades')?.value || '');            return;        }        // Senão cria nova atividade (POST)        const resposta = await fetch(`${API_BASE}/atividades/`, {            method: 'POST',            headers: { 'Content-Type': 'application/json' },            body: JSON.stringify(payload)        });        if (!resposta.ok) {            const erro = await resposta.json();            throw new Error(erro.detail || 'Erro ao registrar atividade');        }        showToast('✓ Atividade registrada com sucesso!', 'success');        document.getElementById('formAtividadeInline').reset();        preencherDataHojeEBimestre();        carregarAtividades();        carregarAtividadesHistorico(document.getElementById('filtroDataAtividades')?.value || '');    } catch (erro) {        console.error('Erro:', erro);        showToast(`Erro ao registrar: ${erro.message}`, 'error');    }}

async function excluirAtividade(id) {
    if (!confirm('Tem certeza que deseja excluir esta atividade?')) return;

    try {
        const resposta = await fetch(`${API_BASE}/atividades/${id}`, {
            method: 'DELETE'
        });

        if (!resposta.ok) throw new Error('Erro ao excluir atividade');

        showToast('✓ Atividade excluída com sucesso!', 'success');        carregarAtividades();        // Recarrega histórico também se presente o filtro        try{ carregarAtividadesHistorico(document.getElementById('filtroDataAtividades')?.value || ''); }catch(e){}    } catch (erro) {        console.error('Erro:', erro);        showToast(`Erro ao excluir: ${erro.message}`, 'error');    }}// ================= HISTÓRICO, FILTROS E EDIÇÃO =================function aplicarFiltroAtividades() {    const d = document.getElementById('filtroDataAtividades')?.value || '';    carregarAtividadesHistorico(d);}function limparFiltroAtividades() {    const hoje = new Date();    const ano = hoje.getFullYear();    const mes = String(hoje.getMonth() + 1).padStart(2, '0');    const dia = String(hoje.getDate()).padStart(2, '0');    const dataHoje = `${ano}-${mes}-${dia}`;    const el = document.getElementById('filtroDataAtividades');    if (el) el.value = dataHoje;    carregarAtividadesHistorico(dataHoje);}function filterAtividades(text) {    const q = (text || '').toLowerCase().trim();    const grid = document.getElementById('atividadesHistoricoGrid');    if (!grid) return;    let shown = 0;    Array.from(grid.children).forEach(card => {        if (!card.classList.contains('profile-card')) return;        const title = (card.querySelector('.profile-title') || {}).textContent.toLowerCase() || '';        const sub = (card.querySelector('.subtitle') || {}).textContent.toLowerCase() || '';        const desc = (card.querySelector('.activity-desc') || {}).textContent.toLowerCase() || '';        const visible = !q || title.includes(q) || sub.includes(q) || desc.includes(q);        card.style.display = visible ? '' : 'none';        if (visible) shown++;    });}function editarAtividadePreencher(atividade) {    try {        document.getElementById('selectUsuarioAtividade').value = atividade.id_usuario;        document.getElementById('selectDisciplinaAtividade').value = atividade.id_disciplina;        // data_atividade esperado no formato YYYY-MM-DD ou YYYY-MM-DD HH:MM:SS        const dataRaw = (atividade.data_atividade || '').split(' ')[0];        document.getElementById('inputDataAtividade').value = dataRaw;        document.getElementById('selectBimestreAtividade').value = atividade.bimestre || '';        document.getElementById('inputPontosAtividade').value = atividade.pontos || '';        document.getElementById('inputDescricaoAtividade').value = atividade.descricao || '';        window.atividadeEditId = atividade.id_atividade;        // Foca no select de usuário para sinalizar edição        document.getElementById('selectUsuarioAtividade')?.focus();        showToast('Modo edição: altere os campos e clique em Registrar para salvar as alterações.', 'info');        // Rola para o topo da página para ver o formulário        window.scrollTo({ top: 0, behavior: 'smooth' });    } catch (e) { console.error('Erro ao preencher formulário para edição', e); }}async function carregarAtividadesHistorico(data) {    const grid = document.getElementById('atividadesHistoricoGrid');    // Força que, quando não for passado parâmetro, o histórico mostre apenas o dia atual    const dateFilterRaw = (typeof data === 'undefined' || data === null) ? (document.getElementById('filtroDataAtividades')?.value || '') : data;    const dateFilter = (dateFilterRaw || '').trim();    if (!grid) return;    grid.innerHTML = '';    // mostra skeleton    for (let i = 0; i < 3; i++) {        const sk = document.createElement('div'); sk.className = 'skeleton'; grid.appendChild(sk);    }    try {        const resp = await fetch(`${API_BASE}/atividades/`);        if (!resp.ok) throw new Error('Falha ao carregar atividades');        const todas = await resp.json();        // Filtra por data (YYYY-MM-DD): se não foi fornecida nenhuma data, usa HOJE        let filtro = dateFilter;        if (!filtro) {            const hoje = new Date();            const ano = hoje.getFullYear();            const mes = String(hoje.getMonth() + 1).padStart(2, '0');            const dia = String(hoje.getDate()).padStart(2, '0');            filtro = `${ano}-${mes}-${dia}`;            const el = document.getElementById('filtroDataAtividades'); if (el) el.value = filtro;        }        // Aplica filtro com segurança (compara apenas a parte YYYY-MM-DD)        const filtradas = todas.filter(a => ((a.data_atividade || '').toString().slice(0,10)) === filtro);        window.atividadesHistoricoLista = filtradas;        // Carrega usuários e disciplinas para mapear nomes        const [respUsers, respDisc] = await Promise.all([fetch(`${API_BASE}/usuarios/`), fetch(`${API_BASE}/disciplinas/`)]);        const usuarios = respUsers.ok ? await respUsers.json() : [];        const disciplinas = respDisc.ok ? await respDisc.json() : [];        const userMap = Object.fromEntries((usuarios || []).map(u => [u.id_usuario, u.nome]));        const discMap = Object.fromEntries((disciplinas || []).map(d => [d.id_disciplina, d.descricao]));        grid.innerHTML = '';        if (!filtradas || filtradas.length === 0) {            const vazio = document.createElement('div'); vazio.className = 'profile-card empty'; vazio.textContent = 'Nenhuma atividade encontrada para a data selecionada.'; grid.appendChild(vazio); return;        }        filtradas.forEach(atividade => {            const card = document.createElement('div'); card.className = 'profile-card';            const head = document.createElement('div'); head.className = 'profile-head';            const avatar = document.createElement('div'); avatar.className = 'profile-avatar'; avatar.style.background = corPorTexto(discMap[atividade.id_disciplina] || 'Atividade'); avatar.textContent = '📋';            const titleDiv = document.createElement('div'); titleDiv.style.flex = '1';            const title = document.createElement('div'); title.className = 'profile-title'; title.textContent = discMap[atividade.id_disciplina] || 'Desconhecida';            const subtitle = document.createElement('div'); subtitle.className = 'subtitle'; subtitle.textContent = `${userMap[atividade.id_usuario] || 'Aluno'} • ${atividade.bimestre}º Bim • ⭐ ${atividade.pontos}`;            titleDiv.appendChild(title); titleDiv.appendChild(subtitle);            head.appendChild(avatar); head.appendChild(titleDiv);            const desc = document.createElement('div'); desc.className = 'activity-desc muted'; desc.style.marginTop = '8px'; desc.textContent = atividade.descricao || '';            const actions = document.createElement('div'); actions.className = 'profile-actions';            const btnEdit = document.createElement('button'); btnEdit.className = 'btn ghost'; btnEdit.textContent = 'Editar'; btnEdit.onclick = () => editarAtividadePreencher(atividade);            const btnRemove = document.createElement('button'); btnRemove.className = 'btn-icon danger'; btnRemove.textContent = '🗑️'; btnRemove.title = 'Excluir'; btnRemove.onclick = () => excluirAtividade(atividade.id_atividade);            actions.appendChild(btnEdit); actions.appendChild(btnRemove);            card.appendChild(head); card.appendChild(desc); card.appendChild(actions);            grid.appendChild(card);        });    } catch (err) {        console.error('Erro ao carregar histórico de atividades:', err);        grid.innerHTML = '<div class="profile-card error">Erro ao carregar histórico de atividades.</div>';    }}