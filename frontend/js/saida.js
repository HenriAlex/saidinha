/* saida.js - Lógica de UI para saídas (registrar, listar, editar, remover)
   Local: frontend/js/saida.js

   Este arquivo contém todas as funções responsáveis por gerenciar
   a interface de SAÍDAS dos alunos (quando saem da instituição).

   Funcionalidade simplificada:
   - Registrar saída: Apenas selecionar aluno + motivo
   - Data/hora são preenchidas AUTOMATICAMENTE com a hora do registro
   - Listar saídas: Mostra histórico completo
*/

// Usa API_BASE se disponível, senão define localmente
const API_SAIDAS = typeof API_BASE !== 'undefined' ? API_BASE : 'http://127.0.0.1:8000';

// ============================================================
// CARREGAR E LISTAR SAÍDAS
// ============================================================

async function carregarSaidas(){
    const grid = document.getElementById('aidasGrid');
    const countEl = document.getElementById('aidasCount');

    if (grid) {
        grid.innerHTML = '';
        for (let i=0;i<3;i++){
            const sk = document.createElement('div');
            sk.className='skeleton';
            grid.appendChild(sk);
        }
    }

    try{
        // Envia o usuário logado: o Aluno recebe apenas as suas
        // próprias saídas; os demais perfis recebem todas.
        const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado') || '{}');
        const resp = await fetch(`${API_SAIDAS}/saidas/?id_usuario_logado=${usuarioLogado.id_usuario || 0}&id_perfil_logado=${usuarioLogado.id_perfil || 0}`);
        if (!resp.ok) throw new Error('Falha ao carregar saídas');
        const saidas = await resp.json();

        grid.innerHTML = '';

        if (!saidas || saidas.length === 0){
            const vazio = document.createElement('div');
            vazio.className='profile-card empty';
            vazio.textContent='Nenhuma saída registrada.';
            grid.appendChild(vazio);
            if (countEl) countEl.textContent='0 saídas';
            return;
        }

        saidas.forEach(s => {
            const card = document.createElement('div');
            card.className='profile-card';

            const head = document.createElement('div');
            head.className='profile-head';

            const avatar = document.createElement('div');
            avatar.className='profile-avatar';
            avatar.style.background=corPorTexto(s.nome_usuario||'S');
            avatar.textContent=(s.nome_usuario||'?').charAt(0).toUpperCase();

            const title = document.createElement('div');
            title.className='profile-title';
            title.textContent = s.nome_usuario || 'Desconhecido';

            head.appendChild(avatar);
            head.appendChild(title);

            const meta = document.createElement('div');
            meta.className='profile-meta muted';
            const dataFormatada = new Date(s.data_saida).toLocaleDateString('pt-BR') + ' ' + new Date(s.data_saida).toLocaleTimeString('pt-BR');
            meta.textContent = `RA: ${s.ra_usuario} • Saída: ${dataFormatada}`;

            const detalhes = document.createElement('div');
            detalhes.className='profile-meta muted';
            detalhes.textContent = `Motivo: ${s.motivo}`;

            const actions = document.createElement('div');
            actions.className='profile-actions';

            const btnEdit = document.createElement('button');
            btnEdit.className='btn ghost';
            btnEdit.style.marginRight='8px';
            btnEdit.textContent='Editar';
            btnEdit.onclick = function(){ editarSaida(s); };

            const btnRemove = document.createElement('button');
            btnRemove.className='delete-btn';
            btnRemove.textContent='Remover';
            btnRemove.onclick = function(){ removerSaida(s.id_saida); };

            actions.appendChild(btnEdit);
            actions.appendChild(btnRemove);

            card.appendChild(head);
            card.appendChild(meta);
            card.appendChild(detalhes);
            card.appendChild(actions);
            grid.appendChild(card);
        });

        if (countEl) countEl.textContent = `${saidas.length} saídas`;

    }catch(err){
        if (typeof showToast === 'function')
            showToast(err.message || 'Erro ao carregar saídas','error');
        else
            alert(err.message);
    }
}

// ============================================================
// REGISTRAR SAÍDA
// ============================================================

async function registrarSaida(){
    const id_usuario = parseInt(document.getElementById('selectUsuarioSaida').value || '0');
    const motivo = document.getElementById('inputMotivoSaida').value.trim();

    if (!id_usuario || !motivo){
        alert('Selecione um aluno e informe o motivo.');
        return;
    }

    // Obtém usuário logado do localStorage
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado') || '{}');

    // Cria objeto com dados da saída + informações do usuário logado
    const dados = {
        id_usuario,
        motivo,
        // Adiciona ID e perfil do usuário logado para validação de permissão
        id_usuario_logado: usuarioLogado.id_usuario || 0,
        id_perfil_logado: usuarioLogado.id_perfil || 0
    };

    if (window.saidaEditId) {
        try{
            const resp = await fetch(`${API_SAIDAS}/saidas/${window.saidaEditId}`, {
                method:'PUT',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify(dados)
            });

            if (resp.ok){
                const res = await resp.json();
                if (typeof showToast==='function')
                    showToast(res.mensagem||'Saída atualizada','success');

                document.getElementById('formSaida').reset();
                window.saidaEditId = null;
                await carregarSaidas();
                showScreen('telaSaidas');
                return;
            }
            else {
                let e={detail:'Erro'};
                try{ e = await resp.json(); }catch{}
                alert(e.detail || JSON.stringify(e));
            }
        }catch(err){
            if (typeof showToast==='function')
                showToast(err.message||'Erro ao atualizar','error');
        }
        return;
    }

    try{
        const resp = await fetch(`${API_SAIDAS}/saidas/`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(dados)
        });

        if (resp.ok){
            const res = await resp.json();
            if (typeof showToast==='function')
                showToast(res.mensagem||'Saída registrada','success');

            document.getElementById('formSaida').reset();
            await carregarSaidas();
            showScreen('telaSaidas');
        }
        else {
            let e={detail:'Erro'};
            try{ e = await resp.json(); }catch{}
            alert(e.detail || JSON.stringify(e));
        }
    }catch(err){
        if (typeof showToast==='function')
            showToast(err.message||'Erro ao registrar','error');
    }
}

// ============================================================
// REMOVER SAÍDA
// ============================================================

async function removerSaida(id_saida){
    const confirmado = await (
        typeof showModal === 'function'
            ? showModal('Confirmar remoção','Deseja remover esta saída?')
            : Promise.resolve(confirm('Deseja remover?'))
    );

    if (!confirmado) return;

    try{
        const resp = await fetch(`${API_SAIDAS}/saidas/${id_saida}`, {
            method:'DELETE'
        });

        if (resp.ok){
            const res = await resp.json();
            if (typeof showToast==='function')
                showToast(res.mensagem||'Removido','success');
            await carregarSaidas();
        }
        else {
            let e={detail:'Erro'};
            try{ e = await resp.json(); }catch{}
            alert(e.detail || JSON.stringify(e));
        }
    }catch(err){
        alert(err.message);
    }
}

// ============================================================
// FILTRO E BUSCA
// ============================================================

function filterSaidas(text){
    const grid = document.getElementById('aidasGrid');
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

// ============================================================
// POPULAR SELECT
// ============================================================

async function popularSelectUsuariosSaida(){
    const sel = document.getElementById('selectUsuarioSaida');
    if (!sel) return;

    // Pela matriz de permissões, o Aluno só pode registrar a
    // PRÓPRIA saída. Por isso, se o usuário logado for Aluno,
    // o select é travado mostrando somente ele mesmo.
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado') || '{}');
    const ehAluno = usuarioLogado.id_perfil === 1;

    try{
        const r = await fetch(`${API_SAIDAS}/usuarios/`);
        if (!r.ok) return;
        let usuarios = await r.json();

        if (ehAluno) {
            usuarios = usuarios.filter(u => u.id_usuario === usuarioLogado.id_usuario);
            sel.disabled = true;
        } else {
            sel.disabled = false;
        }

        sel.innerHTML = '<option value="">Selecione um usuário</option>';
        usuarios.forEach(u => {
            const o = document.createElement('option');
            o.value = u.id_usuario;
            o.textContent = `${u.nome} (${u.ra})`;
            sel.appendChild(o);
        });
        if (usuarios && usuarios.length > 0)
            sel.value = usuarios[0].id_usuario;
    }catch(e){}
}

// ============================================================
// EDITAR
// ============================================================

function editarSaida(s){
    popularSelectUsuariosSaida().then(()=>{
        try{
            document.getElementById('selectUsuarioSaida').value = s.id_usuario;
        }catch(e){}
    });

    document.getElementById('inputMotivoSaida').value = s.motivo || '';
    window.saidaEditId = s.id_saida;
    showScreen('telaSaidaCadastro');
}
