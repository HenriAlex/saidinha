/* usuario.js - Lógica de UI para usuários (listar, cadastrar, remover)
   Local: frontend/js/usuario.js
*/

const API_BASE_USERS = 'http://127.0.0.1:8000';

// Carrega usuários e popula grid similar aos perfis
async function carregarUsuarios(){
    const grid = document.getElementById('usersGrid');
    const countEl = document.getElementById('usersCount');

    if (grid) {
        grid.innerHTML = '';
        for (let i=0;i<3;i++){ const sk = document.createElement('div'); sk.className='skeleton'; grid.appendChild(sk);}    
    }

    try{
        const resp = await fetch(`${API_BASE_USERS}/usuarios/`);
        if (!resp.ok) throw new Error('Falha ao carregar usuários');
        const usuarios = await resp.json();

        grid.innerHTML = '';
        if (!usuarios || usuarios.length === 0){
            const vazio = document.createElement('div'); vazio.className='profile-card empty'; vazio.textContent='Nenhum usuário cadastrado.'; grid.appendChild(vazio);
            if (countEl) countEl.textContent='0 usuários';
            return;
        }

        usuarios.forEach(u => {
            const card = document.createElement('div'); card.className='profile-card';
            const head = document.createElement('div'); head.className='profile-head';
            const avatar = document.createElement('div'); avatar.className='profile-avatar'; avatar.style.background=corPorTexto(u.nome||u.email||'U'); avatar.textContent=(u.nome||u.email||'?').charAt(0).toUpperCase();
            const title = document.createElement('div'); title.className='profile-title'; title.textContent = u.nome || u.email;
            head.appendChild(avatar); head.appendChild(title);

            const meta = document.createElement('div'); meta.className='profile-meta muted'; meta.textContent = `RA: ${u.ra} • ${u.ds_perfil || ''}`;

            const actions = document.createElement('div'); actions.className='profile-actions';
            const btnEdit = document.createElement('button'); btnEdit.className='btn ghost'; btnEdit.style.marginRight='8px'; btnEdit.textContent='Editar'; btnEdit.onclick = function(){ editarUsuario(u); };
            const btnRemove = document.createElement('button'); btnRemove.className='delete-btn'; btnRemove.textContent='Remover'; btnRemove.onclick = function(){ removerUsuario(u.id_usuario); };
            actions.appendChild(btnEdit);
            actions.appendChild(btnRemove);

            card.appendChild(head); card.appendChild(meta); card.appendChild(actions);
            grid.appendChild(card);
        });

        if (countEl) countEl.textContent = `${usuarios.length} usuários`;

    }catch(err){ if (typeof showToast === 'function') showToast(err.message || 'Erro ao carregar usuários','error'); else alert(err.message);}    
}

// Cadastro de usuário (le o formulário e envia para API)
async function cadastrarUsuario(){
    const ra = document.getElementById('inputRa').value.trim();
    const nome = document.getElementById('inputNome').value.trim();
    const id_perfil = parseInt(document.getElementById('selectPerfil').value || '0');
    const email = document.getElementById('inputEmail').value.trim();
    const senha = document.getElementById('inputSenha').value.trim();

    if (!nome || !ra || !email || !senha || !id_perfil){ alert('Preencha todos os campos.'); return; }

    const dados = { ra, nome, id_perfil, email, senha };

    // Se estiver em modo edição, usa PUT
    if (window.usuarioEditId) {
        try{
            const resp = await fetch(`${API_BASE_USERS}/usuarios/${window.usuarioEditId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(dados)});
            if (resp.ok){ const res = await resp.json(); if (typeof showToast==='function') showToast(res.mensagem||'Usuário atualizado','success'); else alert(res.mensagem||'Usuário atualizado');
                document.getElementById('formUsuario').reset(); window.usuarioEditId = null; await carregarUsuarios();
                location.hash = '#telaUsuarios';
                showScreen('telaUsuarios'); document.querySelectorAll('.nav-item[data-screen]').forEach(function(btn){ btn.classList.toggle('active', btn.getAttribute('data-screen') === 'telaUsuarios'); }); return; }
            else { let e={detail:'Erro'}; try{ e = await resp.json(); }catch{} alert(e.detail || JSON.stringify(e)); return; }
        }catch(err){ if (typeof showToast==='function') showToast(err.message||'Erro ao atualizar usuário','error'); else alert(err.message); return; }
    }

    try{
        const resp = await fetch(`${API_BASE_USERS}/usuarios/`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(dados)});
        if (resp.ok){ const res = await resp.json(); if (typeof showToast==='function') showToast(res.mensagem||'Usuário cadastrado','success'); else alert(res.mensagem||'Usuário cadastrado');
            document.getElementById('formUsuario').reset(); await carregarUsuarios();
            location.hash = '#telaUsuarios';
            showScreen('telaUsuarios'); document.querySelectorAll('.nav-item[data-screen]').forEach(function(btn){ btn.classList.toggle('active', btn.getAttribute('data-screen') === 'telaUsuarios'); });
        } else { let e={detail:'Erro'}; try{ e = await resp.json(); }catch{} alert(e.detail || JSON.stringify(e)); }
    }catch(err){ if (typeof showToast==='function') showToast(err.message||'Erro ao cadastrar usuário','error'); else alert(err.message);}    
}

async function removerUsuario(id_usuario){
    const confirmado = await (typeof showModal === 'function' ? showModal('Confirmar remoção','Deseja remover este usuário?') : Promise.resolve(confirm('Deseja remover este usuário?')));
    if (!confirmado) return;
    try{
        const resp = await fetch(`${API_BASE_USERS}/usuarios/${id_usuario}`, { method:'DELETE' });
        if (resp.ok){ const res = await resp.json(); if (typeof showToast==='function') showToast(res.mensagem||'Usuário removido','success'); await carregarUsuarios(); }
        else { let e={detail:'Erro'}; try{ e = await resp.json(); }catch{} if (typeof showToast==='function') showToast(e.detail||JSON.stringify(e),'error'); else alert(e.detail||JSON.stringify(e)); }
    }catch(err){ alert(err.message || 'Erro ao remover usuário'); }
}

// Filtro client-side para usuários
function filterUsers(text){
    const grid = document.getElementById('usersGrid'); if (!grid) return; const q = (text||'').toLowerCase().trim(); let visible=0; const cards = Array.from(grid.children);
    cards.forEach(card=>{ if (!card.classList.contains('profile-card')) return; const title = (card.querySelector('.profile-title')||{}).textContent.toLowerCase()||''; const meta = (card.querySelector('.profile-meta')||{}).textContent.toLowerCase()||''; const match = title.includes(q) || meta.includes(q); card.style.display = match ? '' : 'none'; if (match) visible++; });
    const countEl = document.getElementById('usersCount'); if (countEl) countEl.textContent = `${visible} usuários`;
}

// Preenche o select de perfis no formulário de cadastro de usuário
async function popularSelectPerfis(){
    const sel = document.getElementById('selectPerfil');
    if (!sel) return;
    try{
        const r = await fetch(`${API_BASE_USERS}/perfis/`);
        if (!r.ok) return;
        const perfis = await r.json(); sel.innerHTML = '<option value="">Selecione um perfil</option>';
        perfis.forEach(p => { const o = document.createElement('option'); o.value = p.id_perfil; o.textContent = p.ds_perfil; sel.appendChild(o); });
        // Se houver perfis, pre-seleciona o primeiro para evitar envio com campo vazio
        if (perfis && perfis.length > 0) sel.value = perfis[0].id_perfil;
    }catch(e){}
}


// Inicia modo de edição para usuário (pré-preenche formulário)
function editarUsuario(u){
    document.getElementById('inputRa').value = u.ra || '';
    document.getElementById('inputNome').value = u.nome || '';
    document.getElementById('inputEmail').value = u.email || '';
    document.getElementById('inputSenha').value = u.senha || '';
    // popula select e seleciona o perfil
    popularSelectPerfis().then(()=>{ try{ document.getElementById('selectPerfil').value = u.id_perfil; }catch(e){} });
    window.usuarioEditId = u.id_usuario;
    showScreen('telaUsuarioCadastro');
}


// Função de login: envia credenciais para a API e grava usuário no localStorage
async function fazerLogin(){
    const email = (document.getElementById('loginEmail')||{}).value || '';
    const senha = (document.getElementById('loginSenha')||{}).value || '';
    const errEl = document.getElementById('loginError');
    if (errEl) errEl.textContent = '';
    if (!email || !senha) { if (errEl) errEl.textContent = 'Preencha e-mail e senha.'; else alert('Preencha e-mail e senha.'); return; }

    try{
        // Envia as credenciais para o endpoint de login.
        // API_BASE_USERS é definido no topo do arquivo e aponta para
        // a API FastAPI (http://127.0.0.1:8000 por padrão).
        const resp = await fetch(`${API_BASE_USERS}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        if (!resp.ok){
            let e = { detail: 'Erro ao autenticar' };
            try{ e = await resp.json(); }catch(err){ console.warn('Resposta inválida JSON', err); }
            const msg = e && (e.detail || e.mensagem) ? (e.detail || e.mensagem) : 'E-mail ou senha inválidos';
            if (errEl) errEl.textContent = msg; else alert(msg);
            console.warn('Login falhou', resp.status, msg);
            return;
        }

        // Resposta bem-sucedida deve conter o objeto `usuario`.
        const data = await resp.json();
        const usuario = data.usuario;
        // Armazena usuário autenticado
        localStorage.setItem('usuario_logado', JSON.stringify(usuario));
        // Pode armazenar token se houver (aqui reuso id como placeholder)
        if (usuario && usuario.id_usuario) localStorage.setItem('token', usuario.id_usuario);

        // Atualiza UI e remove o bloqueio.
        if (typeof setLoggedUser === 'function') setLoggedUser(usuario);
        showScreen('bemVindo');
        if (typeof showToast === 'function') showToast(data.mensagem || 'Login realizado','success');
        document.getElementById('formLogin').reset();
    }catch(err){
        console.error('Erro ao processar login', err);
        const errEl = document.getElementById('loginError');
        // Mostra mensagem de erro amigável ao usuário e registra detalhes no console.
        if (errEl) errEl.textContent = 'Erro de rede ou servidor. Veja o console.';
        else alert(err.message || 'Erro ao processar login');
    }
}
