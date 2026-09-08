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
    // Se houver hash na URL, tenta abrir a tela correspondente, caso contrário mostra a home
    const hash = (location.hash || '').replace('#','');
    const valid = ['bemVindo','telaLista','telaCadastro','telaUsuarios','telaUsuarioCadastro'];
    if (hash && valid.includes(hash)) showScreen(hash);
    else showScreen('bemVindo');
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
    const telas = ['bemVindo', 'telaLista', 'telaCadastro', 'telaUsuarios', 'telaUsuarioCadastro'];
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
