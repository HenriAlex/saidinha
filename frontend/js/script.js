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
    showScreen('bemVindo');
    // Carrega os perfis em segundo plano para popular o card de estatística.
    if (typeof carregarPerfis === 'function') carregarPerfis();
}

// Vincula inicialização ao evento de carregamento.
window.addEventListener('load', init);

// Função responsável por alternar entre telas.
// Recebe o id lógico da tela e mostra/oculta os containers.
function showScreen(screen) {
    const telas = ['bemVindo', 'telaLista', 'telaCadastro'];
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
