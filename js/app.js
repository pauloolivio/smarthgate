// ============ js/app.js ============
// Funções globais para comunicação entre páginas

// ============ DADOS GLOBAIS ============
function getDadosGlobais() {
    return {
        db: window.db || {},
        auth: window.auth || {},
        firestore: window.firestore || {},
        database: window.database || {}
    };
}

// ============ NAVEGAÇÃO ============
function navegarPara(pagina) {
    // Atualizar navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === pagina);
    });

    // Atualizar iframe
    const frame = document.getElementById('pageFrame');
    if (frame) {
        frame.src = `pages/${pagina}.html`;
    }

    // Atualizar status
    const nomes = {
        'dashboard': '📊 Dashboard',
        'clientes': '👤 Clientes',
        'produtos': '📦 Produtos',
        'orcamento-comodo': '🏗️ Orç. por Cômodo',
        'orcamento-total': '💰 Orçamento Total',
        'configuracoes': '⚙️ Configurações'
    };
    atualizarStatus(`📄 ${nomes[pagina] || pagina}`);
}

// ============ STATUS ============
function atualizarStatus(mensagem) {
    const el = document.getElementById('footerStatus');
    if (el) {
        el.textContent = mensagem;
    }
}

// ============ STATUS DE CONEXÃO ============
function atualizarConexao(online) {
    const badge = document.getElementById('statusConexao');
    if (badge) {
        badge.textContent = online ? '🟢 Conectado' : '🔴 Desconectado';
        badge.className = `status-badge ${online ? 'online' : 'offline'}`;
    }
}

// ============ LOGOUT ============
async function sair() {
    try {
        if (window.auth) {
            await window.auth.signOut();
        }
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('userEmail');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Erro ao sair:', error);
        window.location.href = 'login.html';
    }
}

// ============ VERIFICAR AUTENTICAÇÃO ============
async function verificarAutenticacao() {
    try {
        const role = sessionStorage.getItem('userRole');
        const email = sessionStorage.getItem('userEmail');

        if (!role || !email) {
            window.location.href = 'login.html';
            return false;
        }

        if (window.auth && window.auth.currentUser) {
            const user = window.auth.currentUser;
            if (user.email !== email) {
                sessionStorage.clear();
                window.location.href = 'login.html';
                return false;
            }
            return true;
        }

        // Verificar se o usuário está logado
        return new Promise((resolve) => {
            if (window.auth) {
                const unsubscribe = window.auth.onAuthStateChanged((user) => {
                    unsubscribe();
                    if (user && user.email === email) {
                        resolve(true);
                    } else {
                        sessionStorage.clear();
                        window.location.href = 'login.html';
                        resolve(false);
                    }
                });
            } else {
                resolve(false);
            }
        });
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        window.location.href = 'login.html';
        return false;
    }
}

// ============ MONITORAR CONEXÃO ============
function monitorarConexao() {
    const online = navigator.onLine;
    atualizarConexao(online);

    window.addEventListener('online', () => {
        atualizarConexao(true);
        atualizarStatus('🟢 Conexão restaurada');
    });

    window.addEventListener('offline', () => {
        atualizarConexao(false);
        atualizarStatus('🔴 Sem conexão com a internet');
    });
}

// ============ INICIALIZAR SISTEMA ============
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticação
    const autenticado = await verificarAutenticacao();
    if (!autenticado) return;

    // Monitorar conexão
    monitorarConexao();

    // Configurar navegação inicial
    const role = sessionStorage.getItem('userRole');
    const email = sessionStorage.getItem('userEmail');
    const userDisplay = document.querySelector('.header-actions .user-info');

    if (userDisplay) {
        userDisplay.textContent = `👤 ${email}`;
    }

    // Carregar dashboard por padrão
    navegarPara('dashboard');

    // Verificar Firestore em intervalos
    setInterval(() => {
        if (window.db && window.db.getClientes) {
            window.db.getClientes().then(() => {
                atualizarConexao(true);
            }).catch(() => {
                atualizarConexao(false);
            });
        }
    }, 30000);

    console.log('✅ Sistema inicializado');
    console.log(`👤 Usuário: ${email} (${role})`);
});