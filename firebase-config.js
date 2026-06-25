// ============ firebase-config.js (atualizado) ============
// Versão compatível com Firebase v12.15.0 (Script Tags)

const firebaseConfig = {
    apiKey: "AIzaSyASt_vtJMR0jdFhe8oO4_5uvPDAthR7mJM",
    authDomain: "smarthgates.firebaseapp.com",
    databaseURL: "https://smarthgates-default-rtdb.firebaseio.com",
    projectId: "smarthgates",
    storageBucket: "smarthgates.firebasestorage.app",
    messagingSenderId: "534107342905",
    appId: "1:534107342905:web:faca6ace832a86bac125e8",
    measurementId: "G-PF6QSB8011"
};

// Inicializar Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Serviços
const auth = firebase.auth();
const firestore = firebase.firestore();
const database = firebase.database();

// Providers
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Exportar globalmente
window.auth = auth;
window.firestore = firestore;
window.database = database;
window.googleProvider = googleProvider;

// =====================================================
// FUNÇÕES DE CRUD
// =====================================================

// --- Clientes ---
async function getClientes() {
    try {
        const snapshot = await firestore.collection('clientes').orderBy('nome').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        return [];
    }
}

async function salvarCliente(data) {
    try {
        if (data.id) {
            await firestore.collection('clientes').doc(data.id).set(data);
            return data.id;
        } else {
            const docRef = await firestore.collection('clientes').add(data);
            return docRef.id;
        }
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        throw error;
    }
}

async function deletarCliente(id) {
    try {
        await firestore.collection('clientes').doc(id).delete();
    } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        throw error;
    }
}

// --- Produtos ---
async function getProdutos() {
    try {
        const snapshot = await firestore.collection('produtos').orderBy('dispositivo').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
    }
}

async function salvarProduto(data) {
    try {
        if (data.id) {
            await firestore.collection('produtos').doc(data.id).set(data);
            return data.id;
        } else {
            const docRef = await firestore.collection('produtos').add(data);
            return docRef.id;
        }
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        throw error;
    }
}

async function deletarProduto(id) {
    try {
        await firestore.collection('produtos').doc(id).delete();
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        throw error;
    }
}

// --- Orçamentos ---
async function getOrcamentos() {
    try {
        const snapshot = await firestore.collection('orcamentos').orderBy('dataCriacao', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Erro ao buscar orçamentos:', error);
        return [];
    }
}

async function salvarOrcamento(data) {
    try {
        if (!data.dataCriacao) {
            data.dataCriacao = new Date().toISOString();
        }
        if (data.id) {
            await firestore.collection('orcamentos').doc(data.id).set(data);
            return data.id;
        } else {
            const docRef = await firestore.collection('orcamentos').add(data);
            return docRef.id;
        }
    } catch (error) {
        console.error('Erro ao salvar orçamento:', error);
        throw error;
    }
}

async function deletarOrcamento(id) {
    try {
        await firestore.collection('orcamentos').doc(id).delete();
    } catch (error) {
        console.error('Erro ao deletar orçamento:', error);
        throw error;
    }
}

// --- Configurações ---
async function getConfiguracoes() {
    try {
        const snapshot = await firestore.collection('configuracoes').get();
        const configs = {};
        snapshot.docs.forEach(doc => {
            configs[doc.id] = doc.data();
        });
        return configs;
    } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        return {};
    }
}

async function salvarConfiguracao(chave, valor) {
    try {
        await firestore.collection('configuracoes').doc(chave).set(valor);
    } catch (error) {
        console.error('Erro ao salvar configuração:', error);
        throw error;
    }
}

// --- Verificação de Autorização ---
async function verificarAutorizacao(email, role) {
    try {
        const collectionName = role === 'gerente' ? 'gerentesAutorizados' : 'funcionariosAutorizados';
        const docRef = firestore.collection(collectionName).doc(email.replace(/\./g, '_'));
        const docSnap = await docRef.get();
        if (docSnap.exists && docSnap.data().autorizado === true) {
            return true;
        }
    } catch(e) {
        console.log('Erro ao verificar Firestore:', e);
    }

    // Fallback para emails hardcoded
    const emailsGerentes = [
        "paulooliviof@hotmail.com",
        "paulooliviof@gmail.com",
        "gerente@smarthome.com",
        "admin@smarthome.com"
    ];
    const emailsFuncionarios = [
        "funcionario@smarthome.com",
        "funcionario@smarthgates.com",
        "vendedor@smarthome.com"
    ];

    const lista = role === 'gerente' ? emailsGerentes : emailsFuncionarios;
    return lista.includes(email);
}

// --- Exportar DB ---
window.db = {
    getClientes,
    salvarCliente,
    deletarCliente,
    getProdutos,
    salvarProduto,
    deletarProduto,
    getOrcamentos,
    salvarOrcamento,
    deletarOrcamento,
    getConfiguracoes,
    salvarConfiguracao,
    verificarAutorizacao
};

console.log('✅ Firebase inicializado com sucesso');
console.log('📦 DB disponível em window.db');