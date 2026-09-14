/* script.js - Funções gerais da UI
   Local: frontend/js/script.js
   Contém: navegação entre telas e utilitários comuns.
*/

// Exibe uma mensagem simples (ainda usando alert para protótipo).
function mostrarMensagem() {
    // Mensagem rápida para o usuário usando toast não intrusivo.
    showToast('Sistema Saidinha funcionando!', 'info');
}

// Inicialização da interface: aplica tema salvo e mostra a tela de boas-vindas.
function init() {
    aplicarTemaSalvo();
    // Se houver usuário autenticado mostra a app, caso contrário abre tela de login
    const usuario = localStorage.getItem('usuario_logado');
    const hash = (location.hash || '').replace('#','');
    const valid = ['bemVindo','telaLista','telaCadastro','telaUsuarios','telaUsuarioCadastro','telaLogin'];
    if (usuario) {
        setLoggedUser(JSON.parse(usuario));
        if (hash && valid.includes(hash)) showScreen(hash);
        else showScreen('bemVindo');
    } else {
        // aplica estado visual de bloqueio (blur + overlay)
        document.body.classList.add('locked');
        showScreen('telaLogin');
    }
    // Carrega os perfis em segundo plano para popular o card de estatística.
    if (typeof carregarPerfis === 'function') carregarPerfis();
    // Carrega usuários em segundo plano (se disponível) para agilizar a navegação
    if (typeof carregarUsuarios === 'function') carregarUsuarios();
}

// Vincula inicialização ao evento de carregamento.
window.addEventListener('load', init);

// Função responsável por alternar entre telas.
// Recebe o id lógico da tela e mostra/oculta os containers.
function showScreen(screen) {
    const telas = ['bemVindo', 'telaLista', 'telaCadastro', 'telaUsuarios', 'telaUsuarioCadastro', 'telaLogin'];

    // Bloqueio global: exige autenticação para acessar qualquer tela diferente de 'telaLogin'
    const usuario = localStorage.getItem('usuario_logado');
    if (!usuario && screen !== 'telaLogin') {
        if (typeof showToast === 'function') showToast('Faça login para acessar o sistema', 'error');
        // força exibição da tela de login
        screen = 'telaLogin';
    }

    // Restrições adicionais: apenas admin pode acessar telas de cadastro/edição
    if (usuario) {
        let userObj = null;
        try { userObj = JSON.parse(usuario); } catch(e){ userObj = null; }
        const requiresAdmin = ['telaUsuarioCadastro', 'telaCadastro'];
        if (requiresAdmin.includes(screen)) {
            const isAdmin = userObj && (userObj.email === 'admin' || userObj.id_usuario === 0);
            if (!isAdmin) {
                if (typeof showToast === 'function') showToast('Acesso negado: somente administrador', 'error');
                screen = 'telaUsuarios';
            }
        }
    }

    // Atualiza o hash da URL para permitir navegação direta/recarregamento
    try { location.hash = '#' + screen; } catch(e) {}
    telas.forEach(function(t) {
        const el = document.getElementById(t);
        if (!el) return;
        el.style.display = (t === screen) ? 'block' : 'none';
    });

    // Destaca o item correspondente na trilha de navegação.
    document.querySelectorAll('.nav-item[data-screen]').forEach(function(btn){
        btn.classList.toggle('active', btn.getAttribute('data-screen') === screen);
    });

    // Ao exibir a lista, solicita carregamento dos perfis.
    if (screen === 'telaLista' || screen === 'lista') {
        if (typeof carregarPerfis === 'function') carregarPerfis();
    }
    if (screen === 'telaUsuarios' || screen === 'telaUsuarioCadastro') {
        if (typeof carregarUsuarios === 'function') carregarUsuarios();
        if (screen === 'telaUsuarioCadastro' && typeof popularSelectPerfis === 'function') popularSelectPerfis();
    }
}



// Atualiza a área da topbar com informações do usuário logado
function setLoggedUser(usuario) {
    const area = document.getElementById('userArea');
    if (!area) return;
    if (!usuario) {
        area.innerHTML = '<button id="btnEntrar" class="btn" onclick="showScreen(\'telaLogin\')">Entrar</button>';
        // aplica bloqueio visual quando não autenticado
        document.body.classList.add('locked');
        return;
    }

    const nome = usuario.nome || usuario.email || 'Usuário';
    area.innerHTML = `
        <div class="user-info">
            <span class="user-name">Olá, ${nome}</span>
            <button class="btn ghost" onclick="logout()">Sair</button>
        </div>
    `;
    // remove o bloqueio visual quando o usuário está autenticado
    document.body.classList.remove('locked');
}


function logout(){
    localStorage.removeItem('usuario_logado');
    localStorage.removeItem('token');
    setLoggedUser(null);
    // garante que o estado visual bloqueado seja aplicado
    document.body.classList.add('locked');
    showScreen('telaLogin');
}


// Cancela qualquer edição em andamento e navega para a tela informada
function cancelEditsAndGo(screen){
    try{ window.perfilEditId = null; }catch(e){}
    try{ window.usuarioEditId = null; }catch(e){}
    // Reseta formulários
    const formP = document.getElementById('formPerfil'); if (formP) formP.reset();
    const formU = document.getElementById('formUsuario'); if (formU) formU.reset();
    showScreen(screen);
}


// Função de busca genérica que encaminha para o filtro da tela ativa
function filterCurrentScreen(text){
    // se estiver na lista de perfis
    const active = document.querySelector('.nav-item.active');
    const screen = active ? active.getAttribute('data-screen') : null;
    if (screen === 'telaLista' && typeof filterProfiles === 'function') return filterProfiles(text);
    if (screen === 'telaUsuarios' && typeof filterUsers === 'function') return filterUsers(text);
}


// Alterna entre tema claro e escuro, persistindo a escolha no navegador.
function toggleTheme(){
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('saidinha-theme', isDark ? 'dark' : 'light');
}

// Aplica o tema salvo anteriormente (ou o padrão claro).
function aplicarTemaSalvo(){
    const tema = localStorage.getItem('saidinha-theme');
    if (tema === 'dark') document.documentElement.classList.add('dark');
}


// Toast utility: exibe uma mensagem não intrusiva no canto superior.
// type: 'success' | 'error' | 'info'
function showToast(message, type='info', timeout=3500){
    const container = document.getElementById('toast-container');
    if (!container) {
        alert(message);
        return;
    }

    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.textContent = message;
    container.appendChild(el);

    // Remove após timeout
    setTimeout(()=>{
        el.style.opacity = '0';
        try { container.removeChild(el); } catch(e){}
    }, timeout);
}


// showModal: exibe um modal de confirmação e retorna uma Promise<boolean>
// title: título do modal, message: texto; retorna true se confirmado.
function showModal(title, message){
    return new Promise((resolve)=>{
        const overlay = document.getElementById('modal-overlay');
        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body');
        const btnConfirm = document.getElementById('modal-confirm');
        const btnCancel = document.getElementById('modal-cancel');

        if (!overlay || !btnConfirm || !btnCancel) {
            // fallback para confirm nativo
            const ok = confirm(message);
            resolve(ok);
            return;
        }

        // Define textos
        titleEl.textContent = title || 'Confirmação';
        bodyEl.textContent = message || '';

        // Mostra o modal
        overlay.style.display = 'flex';

        // Define handlers
        function cleanAndResolve(value){
            overlay.style.display = 'none';
            btnConfirm.removeEventListener('click', onConfirm);
            btnCancel.removeEventListener('click', onCancel);
            resolve(value);
        }

        function onConfirm(){ cleanAndResolve(true); }
        function onCancel(){ cleanAndResolve(false); }

        btnConfirm.addEventListener('click', onConfirm);
        btnCancel.addEventListener('click', onCancel);

        // Foco no botão confirmar para acessibilidade
        btnConfirm.focus();
    });
}
