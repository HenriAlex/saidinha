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
    const valid = ['bemVindo','telaLista','telaCadastro','telaUsuarios','telaUsuarioCadastro','telaSaidas','telaSaidaCadastro','telaRetornos','telaFaltas','telaConsultas','telaDisciplinas','telaAtividades','telaConsultaPontos','telaLogin'];
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
    // Carrega as saídas em segundo plano para agilizar a navegação
    if (typeof carregarSaidas === 'function') carregarSaidas();
    // Carrega saídas pendentes (sem retorno) em segundo plano
    if (typeof carregarSaidasPendentes === 'function') carregarSaidasPendentes();
    // Carrega faltas em segundo plano para agilizar a navegação
    if (typeof carregarFaltas === 'function') carregarFaltas();
    // Carrega disciplinas em segundo plano
    if (typeof carregarDisciplinas === 'function') carregarDisciplinas();
    // Carrega atividades em segundo plano
    if (typeof carregarAtividades === 'function') carregarAtividades();
    // Carrega selects de atividades em segundo plano
    if (typeof carregarSelectsAtividade === 'function') carregarSelectsAtividade();
}

// Vincula inicialização ao evento de carregamento.
window.addEventListener('load', init);

// Função responsável por alternar entre telas.
// Recebe o id lógico da tela e mostra/oculta os containers.
function showScreen(screen) {
    const telas = ['bemVindo', 'telaLista', 'telaCadastro', 'telaUsuarios', 'telaUsuarioCadastro', 'telaSaidas', 'telaSaidaCadastro', 'telaRetornos', 'telaFaltas', 'telaConsultas', 'telaDisciplinas', 'telaAtividades', 'telaConsultaPontos', 'telaLogin'];

    // Bloqueio global: exige autenticação para acessar qualquer tela diferente de 'telaLogin'
    const usuario = localStorage.getItem('usuario_logado');
    if (!usuario && screen !== 'telaLogin') {
        if (typeof showToast === 'function') showToast('Faça login para acessar o sistema', 'error');
        // força exibição da tela de login
        screen = 'telaLogin';
    }

    // Restrições adicionais: apenas admin pode Criar/Editar Perfil e Usuário.
    // Registrar Saída (telaSaidaCadastro) NÃO exige admin: pela matriz de
    // permissões, Aluno, Professor e Equipe de Apoio também podem criar
    // saída (o Aluno só para si mesmo, o que já é validado pela API).
    if (usuario) {
        let userObj = null;
        try { userObj = JSON.parse(usuario); } catch(e){ userObj = null; }
        const requiresAdmin = ['telaUsuarioCadastro', 'telaCadastro'];
        if (requiresAdmin.includes(screen)) {
            const isAdmin = userObj && (userObj.email === 'admin' || userObj.id_usuario === 0);
            if (!isAdmin) {
                if (typeof showToast === 'function') showToast('Acesso negado: somente administrador', 'error');
                screen = 'telaSaidas';
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
        // IMPORTANTE: Carrega perfis ANTES de exibir o select
        if (screen === 'telaUsuarioCadastro' && typeof popularSelectPerfis === 'function') {
            popularSelectPerfis(); // Não precisa aguardar, mas garante que inicia logo
        }
    }
    // Ao exibir as saídas, solicita carregamento dos dados e popular o select
    if (screen === 'telaSaidas' || screen === 'telaSaidaCadastro') {
        if (typeof carregarSaidas === 'function') carregarSaidas();
        if (typeof popularSelectUsuariosSaida === 'function') popularSelectUsuariosSaida();
        if (typeof carregarSaidasHistorico === 'function') carregarSaidasHistorico();
    }
    // Ao exibir os retornos, carrega as saídas pendentes e os retornos registrados (hoje por padrão).
    if (screen === 'telaRetornos') {
        if (typeof carregarSaidasPendentes === 'function') carregarSaidasPendentes();
        if (typeof carregarRetornos === 'function') carregarRetornos();
    }
    // Ao exibir as faltas, carrega as faltas e popula o select de usuários.
    if (screen === 'telaFaltas') {
        if (typeof carregarFaltas === 'function') carregarFaltas();
        if (typeof popularSelectUsuariosFalta === 'function') popularSelectUsuariosFalta();
    }
    // Ao exibir consultas, carrega o dashboard
    if (screen === 'telaConsultas') {
        if (typeof inicializarDashboardConsultas === 'function') inicializarDashboardConsultas();
    }
    // Ao exibir disciplinas, carrega as disciplinas.
    if (screen === 'telaDisciplinas') {
        if (typeof carregarDisciplinas === 'function') carregarDisciplinas();
    }
    // Ao exibir atividades, carrega as atividades e popula os selects.
    if (screen === 'telaAtividades') {
        if (typeof carregarAtividades === 'function') carregarAtividades();
        if (typeof carregarSelectsAtividade === 'function') carregarSelectsAtividade();
        if (typeof preencherDataHojeEBimestre === 'function') {
            setTimeout(() => preencherDataHojeEBimestre(), 100);
        }
        // Carrega histórico das atividades (padrão: hoje) para permitir edição/consultas rápidas
        if (typeof carregarAtividadesHistorico === 'function') carregarAtividadesHistorico();
    }
    // Ao exibir consulta de pontos, carrega os selects.
    if (screen === 'telaConsultaPontos') {
        if (typeof carregarSelectsPontos === 'function') carregarSelectsPontos();
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


// Funções auxiliares para obter dados do usuário logado
function obterIdUsuarioLogado() {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario_logado') || '{}');
        return usuario.id_usuario || 0;
    } catch(e) {
        return 0;
    }
}

function obterIdPerfilLogado() {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario_logado') || '{}');
        return usuario.id_perfil || 0;
    } catch(e) {
        return 0;
    }
}

// Função para gerar cores consistentes baseadas em texto
function corPorTexto(texto) {
    const cores = [
        '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
        '#10b981', '#06b6d4', '#6366f1', '#f97316'
    ];
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
        hash = texto.charCodeAt(i) + ((hash << 5) - hash);
    }
    return cores[Math.abs(hash) % cores.length];
}

// Toggle para menu de grupos de navegação
function toggleNavGroup(btn) {
    const group = btn.closest('.nav-group');
    const items = group.querySelector('.nav-group-items');
    const icon = btn.querySelector('.nav-group-icon');

    if (items.style.display === 'none') {
        items.style.display = 'flex';
        icon.style.transform = 'rotate(180deg)';
    } else {
        items.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
    }
}
