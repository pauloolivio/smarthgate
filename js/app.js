// ============ js/app.js ============
// Funções auxiliares para as páginas filhas

// ============ ACESSO AO DB ============
function getParentDb() {
    try {
        if (window.parent && window.parent.getDadosGlobais) {
            return window.parent.getDadosGlobais().db;
        }
        if (window.db) {
            return window.db;
        }
        throw new Error('Database não disponível');
    } catch (error) {
        console.error('Erro ao acessar database:', error);
        return null;
    }
}

// ============ FUNÇÕES DE UTILIDADE ============
function formatCurrency(value) {
    return 'R$ ' + (value || 0).toFixed(2).replace('.', ',');
}

function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
        return '-';
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

function sanitizeString(str) {
    if (!str) return '';
    return str.replace(/[<>]/g, '').trim();
}

// ============ VALIDAÇÕES ============
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarTelefone(telefone) {
    return /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(telefone);
}

function validarPreco(valor) {
    return valor > 0 && !isNaN(valor);
}

function validarQuantidade(valor) {
    return Number.isInteger(valor) && valor >= 0;
}

// ============ MÁSCARAS ============
function mascaraTelefone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    input.value = value;
}

function mascaraCpf(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    input.value = value;
}

function mascaraCnpj(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    input.value = value;
}

// ============ TOAST NOTIFICATIONS ============
function showToast(message, type = 'info') {
    const colors = {
        success: '#0b9e5e',
        error: '#dc2626',
        warning: '#f59e0b',
        info: '#4f46e5'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 14px;
        font-family: 'Inter', sans-serif;
        box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        z-index: 9999;
        max-width: 400px;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============ DARK MODE ============
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    return isDark;
}

function loadDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
    }
    return isDark;
}

// ============ INICIALIZAR ============
document.addEventListener('DOMContentLoaded', function() {
    loadDarkMode();
    console.log('✅ app.js carregado');
});