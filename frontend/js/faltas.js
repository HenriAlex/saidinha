/* faltas.js - Lógica de UI para faltas (registrar, listar, buscar)
   Local: frontend/js/faltas.js

   Este arquivo contém todas as funções responsáveis por gerenciar
   a interface de FALTAS dos alunos (registros de ausências).

   A interface permite:
   - Registrar novas faltas
   - Visualizar lista de faltas registradas
   - Filtrar faltas por aluno ou data
   - Atualizar ou excluir faltas (apenas admin)
*/

// URL base da API (importada de script.js)
const API_FALTAS = typeof API_BASE !== 'undefined' ? API_BASE : 'http://127.0.0.1:8000';

// ============================================================
// CARREGAR E EXIBIR FALTAS
// ============================================================

// Carrega todas as faltas registradas no banco.
// Exibe-as em um grid de cards.
async function carregarFaltas(){

    // Obtém a referência do grid que mostrará as faltas.
    const grid = document.getElementById('faltasGrid');

    // Obtém a referência do elemento de contagem.
    const countEl = document.getElementById('faltasCount');

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
        // Envia o usuário logado para validação de permissões.
        const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado') || '{}');
        const resp = await fetch(`${API_FALTAS}/faltas/`);

        if (!resp.ok) throw new Error('Falha ao carregar faltas');

        // Converte a resposta JSON.
        const faltas = await resp.json();

        // Limpa o grid.
        grid.innerHTML = '';

        // Atualiza contagem.
        if (countEl) countEl.textContent = `${faltas.length} falta(s)`;

        // Verifica se há faltas registradas.
        if (!faltas || faltas.length === 0){
            const vazio = document.createElement('div');
            vazio.className='profile-card empty';
            vazio.innerHTML='<p style="text-align: center; font-size: 18px;">✓ Nenhuma falta registrada!</p><p style="text-align: center; color: #888;">Bom trabalho!</p>';
            grid.appendChild(vazio);
            return;
        }

        // Exibe cada falta como um card.
        faltas.forEach(f => {
            // Container do card.
            const card = document.createElement('div');
            card.className='profile-card';
            card.style.borderLeft='4px solid #ff9c3d';

            // Cabeçalho com avatar.
            const head = document.createElement('div');
            head.className='profile-head';

            // Avatar.
            const avatar = document.createElement('div');
            avatar.className='profile-avatar';
            avatar.style.background=corPorTexto(f.nome_usuario||'F');
            avatar.textContent=(f.nome_usuario||'?').charAt(0).toUpperCase();

            // Nome.
            const title = document.createElement('div');
            title.className='profile-title';
            title.style.fontSize='18px';
            title.textContent = f.nome_usuario || 'Desconhecido';

            head.appendChild(avatar);
            head.appendChild(title);

            // Informações de falta.
            const meta = document.createElement('div');
            meta.className='profile-meta';
            meta.style.color='#ff9c3d';
            meta.style.fontWeight='600';

            // Formata data da falta.
            const dataFaltaObj = new Date(f.data_falta);
            const dataFormatada = dataFaltaObj.toLocaleDateString('pt-BR');

            meta.innerHTML = `📅 Falta em <strong>${dataFormatada}</strong>`;

            // RA do aluno.
            const ra = document.createElement('div');
            ra.className='profile-meta muted';
            ra.textContent = `ID: ${f.ra_usuario}`;

            // Motivo da falta (se houver).
            const motivo = document.createElement('div');
            motivo.className='profile-meta muted';
            if (f.motivo && f.motivo.trim() !== ''){
                motivo.textContent = `🎯 Motivo: ${f.motivo}`;
            } else {
                motivo.textContent = `🎯 Motivo: Não justificada`;
            }

            // Observações (se houver).
            if (f.observacoes && f.observacoes.trim() !== ''){
                const obs = document.createElement('div');
                obs.className='profile-meta muted';
                obs.style.fontSize='12px';
                obs.textContent = `📝 Obs: ${f.observacoes}`;
            }

            // BOTÕES DE AÇÃO (apenas admin pode editar/excluir).
            const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado') || '{}');
            const ehAdmin = usuarioLogado.id_usuario === 0;

            const actions = document.createElement('div');
            actions.className='profile-actions';
            actions.style.marginTop='15px';
            actions.style.display='flex';
            actions.style.gap='8px';

            // Botão DETALHES.
            const btnDetalhes = document.createElement('button');
            btnDetalhes.className='btn';
            btnDetalhes.style.backgroundColor='#4ecdc4';
            btnDetalhes.style.color='white';
            btnDetalhes.style.flex='1';
            btnDetalhes.style.padding='10px';
            btnDetalhes.style.fontSize='14px';
            btnDetalhes.style.fontWeight='600';
            btnDetalhes.style.border='none';
            btnDetalhes.style.borderRadius='6px';
            btnDetalhes.style.cursor='pointer';
            btnDetalhes.textContent='👀 Detalhes';
            btnDetalhes.onclick = function(){
                mostrarDetalhesFalta(f);
            };
            actions.appendChild(btnDetalhes);

            // Botão EDITAR (apenas admin).
            if (ehAdmin){
                const btnEditar = document.createElement('button');
                btnEditar.className='btn';
                btnEditar.style.backgroundColor='#ffd93d';
                btnEditar.style.color='#333';
                btnEditar.style.flex='1';
                btnEditar.style.padding='10px';
                btnEditar.style.fontSize='14px';
                btnEditar.style.fontWeight='600';
                btnEditar.style.border='none';
                btnEditar.style.borderRadius='6px';
                btnEditar.style.cursor='pointer';
                btnEditar.textContent='✏️ Editar';
                btnEditar.onclick = function(){
                    abrirFormularioEdicaoFalta(f);
                };
                actions.appendChild(btnEditar);

                // Botão EXCLUIR (apenas admin).
                const btnExcluir = document.createElement('button');
                btnExcluir.className='btn';
                btnExcluir.style.backgroundColor='#ff6b6b';
                btnExcluir.style.color='white';
                btnExcluir.style.flex='1';
                btnExcluir.style.padding='10px';
                btnExcluir.style.fontSize='14px';
                btnExcluir.style.fontWeight='600';
                btnExcluir.style.border='none';
                btnExcluir.style.borderRadius='6px';
                btnExcluir.style.cursor='pointer';
                btnExcluir.textContent='🗑️ Excluir';
                btnExcluir.onclick = function(){
                    excluirFalta(f.id_falta);
                };
                actions.appendChild(btnExcluir);
            }

            // Monta o card.
            card.appendChild(head);
            card.appendChild(meta);
            card.appendChild(ra);
            card.appendChild(motivo);
            if (f.observacoes && f.observacoes.trim() !== ''){
                const obs = document.createElement('div');
                obs.className='profile-meta muted';
                obs.style.fontSize='12px';
                obs.textContent = `📝 Obs: ${f.observacoes}`;
                card.appendChild(obs);
            }
            card.appendChild(actions);

            grid.appendChild(card);
        });

    }catch(err){
        if (typeof showToast === 'function')
            showToast(err.message || 'Erro ao carregar faltas','error');
        else
            alert(err.message);
    }
}

// ============================================================
// REGISTRAR FALTA
// ============================================================

// Registra uma nova falta para um aluno.
async function registrarFalta(){

    // Obtém os valores dos campos do formulário.
    const selectUsuario = document.getElementById('selectUsuarioFalta');
    const inputDataFalta = document.getElementById('inputDataFalta');
    const inputMotivoFalta = document.getElementById('inputMotivoFalta');
    const inputObsFalta = document.getElementById('inputObsFalta');

    // Valida se todos os campos obrigatórios foram preenchidos.
    if (!selectUsuario.value || !inputDataFalta.value){
        if (typeof showToast==='function')
            showToast('Preencha aluno e data!','error');
        else
            alert('Preencha aluno e data!');
        return;
    }

    try{
        // Obtém usuário logado do localStorage para validação.
        const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado') || '{}');

        // Cria o objeto de dados para enviar à API.
        const dados = {
            id_usuario: parseInt(selectUsuario.value),
            data_falta: inputDataFalta.value,
            motivo: inputMotivoFalta.value || '',
            observacoes: inputObsFalta.value || '',
            id_usuario_logado: usuarioLogado.id_usuario || 0,
            id_perfil_logado: usuarioLogado.id_perfil || 0
        };

        // Envia a falta para a API.
        const resp = await fetch(`${API_FALTAS}/faltas/`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(dados)
        });

        if (resp.ok){
            // Sucesso!
            if (typeof showToast==='function')
                showToast('✓ Falta registrada com sucesso!','success');
            else
                alert('Falta registrada com sucesso!');

            // Limpa o formulário.
            document.getElementById('formFaltaInline').reset();

            // Recarrega a lista.
            await carregarFaltas();
        }
        else {
            // Erro na API.
            let e={detail:'Erro ao registrar falta'};
            try{ e = await resp.json(); }catch{}
            throw new Error(e.detail || JSON.stringify(e));
        }
    }catch(err){
        if (typeof showToast==='function')
            showToast(err.message||'Erro ao registrar falta','error');
        else
            alert(err.message);
    }
}

// ============================================================
// MOSTRAR DETALHES DE UMA FALTA
// ============================================================

// Mostra um modal com os detalhes completos de uma falta.
function mostrarDetalhesFalta(falta){

    // Cria um overlay (fundo escuro).
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

    // Cria a caixa de detalhes.
    const card = document.createElement('div');
    card.style.backgroundColor='white';
    card.style.borderRadius='12px';
    card.style.padding='24px';
    card.style.maxWidth='500px';
    card.style.width='90%';
    card.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.15)';
    card.style.color='#333';
    card.style.maxHeight='80vh';
    card.style.overflowY='auto';

    // Título.
    const titulo = document.createElement('h3');
    titulo.textContent = `Detalhes da Falta`;
    titulo.style.margin='0 0 16px 0';
    titulo.style.fontSize='20px';
    titulo.style.fontWeight='700';

    // Linha: Aluno.
    let html = `
        <div style="margin-bottom: 12px;">
            <strong>👤 Aluno:</strong> ${falta.nome_usuario}
        </div>
        <div style="margin-bottom: 12px;">
            <strong>📌 RA:</strong> ${falta.ra_usuario}
        </div>
        <div style="margin-bottom: 12px;">
            <strong>📅 Data da Falta:</strong> ${new Date(falta.data_falta).toLocaleDateString('pt-BR')}
        </div>
        <div style="margin-bottom: 12px;">
            <strong>🎯 Motivo:</strong> ${falta.motivo || 'Não justificada'}
        </div>
        <div style="margin-bottom: 12px;">
            <strong>📝 Observações:</strong> ${falta.observacoes || '(nenhuma)'}
        </div>
        <div style="margin-bottom: 12px;">
            <strong>⏰ Cadastro:</strong> ${new Date(falta.data_cadastro).toLocaleString('pt-BR')}
        </div>
    `;

    // Container para detalhes.
    const detalhes = document.createElement('div');
    detalhes.innerHTML = html;

    // Botão FECHAR.
    const btnFechar = document.createElement('button');
    btnFechar.textContent='Fechar';
    btnFechar.className='btn';
    btnFechar.style.width='100%';
    btnFechar.style.marginTop='16px';
    btnFechar.style.padding='12px';
    btnFechar.style.cursor='pointer';
    btnFechar.onclick = function(){
        document.body.removeChild(overlay);
    };

    // Monta o card.
    card.appendChild(titulo);
    card.appendChild(detalhes);
    card.appendChild(btnFechar);

    overlay.appendChild(card);
    document.body.appendChild(overlay);
}

// ============================================================
// EDITAR FALTA
// ============================================================

// Abre um formulário modal para editar uma falta existente.
function abrirFormularioEdicaoFalta(falta){

    // Cria um overlay.
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

    // Cria o card do formulário.
    const formCard = document.createElement('div');
    formCard.style.backgroundColor='white';
    formCard.style.borderRadius='12px';
    formCard.style.padding='24px';
    formCard.style.maxWidth='500px';
    formCard.style.width='90%';
    formCard.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.15)';
    formCard.style.color='#333';

    // Título.
    const titulo = document.createElement('h3');
    titulo.textContent = `Editar Falta - ${falta.nome_usuario}`;
    titulo.style.margin='0 0 16px 0';
    titulo.style.fontSize='18px';
    titulo.style.fontWeight='700';

    // Label e input para DATA.
    const labelData = document.createElement('label');
    labelData.textContent = '📅 Data da Falta';
    labelData.style.display='block';
    labelData.style.fontWeight='600';
    labelData.style.marginTop='12px';
    labelData.style.marginBottom='4px';
    labelData.style.fontSize='14px';

    const inputData = document.createElement('input');
    inputData.type='date';
    inputData.required=true;
    inputData.value = falta.data_falta;
    inputData.style.width='100%';
    inputData.style.padding='10px';
    inputData.style.marginBottom='12px';
    inputData.style.borderRadius='6px';
    inputData.style.border='1px solid #ddd';
    inputData.style.fontSize='14px';
    inputData.style.boxSizing='border-box';

    // Label e input para MOTIVO.
    const labelMotivo = document.createElement('label');
    labelMotivo.textContent = '🎯 Motivo (opcional)';
    labelMotivo.style.display='block';
    labelMotivo.style.fontWeight='600';
    labelMotivo.style.marginTop='12px';
    labelMotivo.style.marginBottom='4px';
    labelMotivo.style.fontSize='14px';

    const inputMotivo = document.createElement('input');
    inputMotivo.type='text';
    inputMotivo.placeholder='Ex: Doença, Compromisso pessoal';
    inputMotivo.value = falta.motivo || '';
    inputMotivo.style.width='100%';
    inputMotivo.style.padding='10px';
    inputMotivo.style.marginBottom='12px';
    inputMotivo.style.borderRadius='6px';
    inputMotivo.style.border='1px solid #ddd';
    inputMotivo.style.fontSize='14px';
    inputMotivo.style.boxSizing='border-box';

    // Label e input para OBSERVAÇÕES.
    const labelObs = document.createElement('label');
    labelObs.textContent = '📝 Observações (opcional)';
    labelObs.style.display='block';
    labelObs.style.fontWeight='600';
    labelObs.style.marginTop='12px';
    labelObs.style.marginBottom='4px';
    labelObs.style.fontSize='14px';

    const inputObs = document.createElement('textarea');
    inputObs.placeholder='Adicione observações sobre a falta...';
    inputObs.value = falta.observacoes || '';
    inputObs.style.width='100%';
    inputObs.style.padding='10px';
    inputObs.style.marginBottom='16px';
    inputObs.style.borderRadius='6px';
    inputObs.style.border='1px solid #ddd';
    inputObs.style.fontSize='14px';
    inputObs.style.boxSizing='border-box';
    inputObs.style.minHeight='80px';

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

    // Botão SALVAR.
    const btnSalvar = document.createElement('button');
    btnSalvar.textContent='✓ Salvar';
    btnSalvar.className='btn';
    btnSalvar.style.flex='1';
    btnSalvar.style.padding='10px';
    btnSalvar.style.backgroundColor='#51cf66';
    btnSalvar.style.color='white';
    btnSalvar.style.border='none';
    btnSalvar.style.borderRadius='6px';
    btnSalvar.style.cursor='pointer';
    btnSalvar.style.fontWeight='600';
    btnSalvar.onclick = async function(){
        // Atualiza a falta.
        await atualizarFalta(falta.id_falta, {
            data_falta: inputData.value,
            motivo: inputMotivo.value,
            observacoes: inputObs.value
        });

        // Fecha o modal.
        document.body.removeChild(overlay);

        // Recarrega a lista.
        await carregarFaltas();
    };

    // Monta o formulário.
    botoes.appendChild(btnCancelar);
    botoes.appendChild(btnSalvar);

    formCard.appendChild(titulo);
    formCard.appendChild(labelData);
    formCard.appendChild(inputData);
    formCard.appendChild(labelMotivo);
    formCard.appendChild(inputMotivo);
    formCard.appendChild(labelObs);
    formCard.appendChild(inputObs);
    formCard.appendChild(botoes);

    overlay.appendChild(formCard);
    document.body.appendChild(overlay);
}

// Atualiza uma falta existente.
async function atualizarFalta(id_falta, dados){

    try{
        // Obtém usuário logado.
        const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado') || '{}');

        // Monta o objeto de dados.
        const payload = {
            ...dados,
            id_usuario: 0,  // Não altera o usuário (está na URL)
            id_usuario_logado: usuarioLogado.id_usuario || 0,
            id_perfil_logado: usuarioLogado.id_perfil || 0
        };

        // Envia a atualização.
        const resp = await fetch(`${API_FALTAS}/faltas/${id_falta}`, {
            method:'PUT',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(payload)
        });

        if (!resp.ok){
            let e={detail:'Erro ao atualizar falta'};
            try{ e = await resp.json(); }catch{}
            throw new Error(e.detail || JSON.stringify(e));
        }

        if (typeof showToast==='function')
            showToast('✓ Falta atualizada!','success');
        else
            alert('Falta atualizada!');

    }catch(err){
        if (typeof showToast==='function')
            showToast(err.message||'Erro ao atualizar falta','error');
        else
            alert(err.message);
    }
}

// ============================================================
// EXCLUIR FALTA
// ============================================================

// Exclui uma falta após confirmação.
async function excluirFalta(id_falta){

    // Pede confirmação.
    const confirmado = await (
        typeof showModal === 'function'
            ? showModal(
                '⚠️ Confirmar Exclusão',
                'Tem certeza que deseja excluir esta falta?'
              )
            : Promise.resolve(confirm('Tem certeza que deseja excluir esta falta?'))
    );

    if (!confirmado) return;

    try{
        // Obtém usuário logado.
        const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado') || '{}');

        // Envia a exclusão.
        const resp = await fetch(`${API_FALTAS}/faltas/${id_falta}?id_usuario_logado=${usuarioLogado.id_usuario || 0}&id_perfil_logado=${usuarioLogado.id_perfil || 0}`, {
            method:'DELETE',
            headers:{'Content-Type':'application/json'}
        });

        if (resp.ok){
            if (typeof showToast==='function')
                showToast('✓ Falta excluída!','success');
            else
                alert('Falta excluída!');

            // Recarrega a lista.
            await carregarFaltas();
        }
        else {
            let e={detail:'Erro ao excluir falta'};
            try{ e = await resp.json(); }catch{}
            throw new Error(e.detail || JSON.stringify(e));
        }
    }catch(err){
        if (typeof showToast==='function')
            showToast(err.message||'Erro ao excluir falta','error');
        else
            alert(err.message);
    }
}

// ============================================================
// POPULAR SELECT DE USUÁRIOS
// ============================================================

// Popula o select de usuários para o formulário de faltas.
// Pela matriz de permissões, o Aluno só pode registrar a PRÓPRIA falta.
// Por isso, se o usuário logado for Aluno, o select é travado
// mostrando somente ele mesmo.
async function popularSelectUsuariosFalta(){
    const sel = document.getElementById('selectUsuarioFalta');
    if (!sel) return;

    // Verifica se o usuário logado é Aluno.
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado') || '{}');
    const ehAluno = usuarioLogado.id_perfil === 1;

    try{
        // Busca a lista de usuários da API.
        const r = await fetch(`${API_FALTAS}/usuarios/`);
        if (!r.ok) return;
        let usuarios = await r.json();

        // Se for aluno, filtra para mostrar apenas ele mesmo.
        if (ehAluno) {
            usuarios = usuarios.filter(u => u.id_usuario === usuarioLogado.id_usuario);
            sel.disabled = true;
        } else {
            sel.disabled = false;
        }

        // Popula o select com os usuários.
        sel.innerHTML = '<option value="">Selecione um aluno</option>';
        usuarios.forEach(u => {
            const o = document.createElement('option');
            o.value = u.id_usuario;
            o.textContent = `${u.nome} (${u.ra})`;
            sel.appendChild(o);
        });

        // Seleciona o primeiro usuário por padrão.
        if (usuarios && usuarios.length > 0)
            sel.value = usuarios[0].id_usuario;
    }catch(e){
        // Silenciosamente falha se a API não está disponível.
    }
}

// ============================================================
// FILTRO E BUSCA
// ============================================================

// Filtra faltas por nome ou RA.
function filterFaltas(text){

    const grid = document.getElementById('faltasGrid');
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
