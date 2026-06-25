// ============ init-firebase.js ============
// Script para inicializar o Firestore com dados padrão
// Execute este script UMA VEZ para configurar o banco

async function initFirebase() {
    console.log('🚀 Iniciando configuração do Firebase...');
    
    try {
        const db = firebase.firestore();
        
        // ============ 1. CRIAR GERENTES AUTORIZADOS ============
        console.log('📌 Criando gerentes autorizados...');
        const gerentes = [
            'paulooliviof@hotmail.com',
            'paulooliviof@gmail.com',
            'gerente@smarthome.com',
            'admin@smarthome.com'
        ];
        
        for (const email of gerentes) {
            const docRef = db.collection('gerentesAutorizados').doc(email.replace(/\./g, '_'));
            await docRef.set({
                email: email,
                autorizado: true,
                nome: email.split('@')[0],
                dataCriacao: new Date().toISOString()
            });
            console.log(`   ✅ Gerente: ${email}`);
        }
        
        // ============ 2. CRIAR FUNCIONÁRIOS AUTORIZADOS ============
        console.log('📌 Criando funcionários autorizados...');
        const funcionarios = [
            'funcionario@smarthome.com',
            'funcionario@smarthgates.com',
            'vendedor@smarthome.com'
        ];
        
        for (const email of funcionarios) {
            const docRef = db.collection('funcionariosAutorizados').doc(email.replace(/\./g, '_'));
            await docRef.set({
                email: email,
                autorizado: true,
                nome: email.split('@')[0],
                dataCriacao: new Date().toISOString()
            });
            console.log(`   ✅ Funcionário: ${email}`);
        }
        
        // ============ 3. CRIAR CONFIGURAÇÕES ============
        console.log('📌 Criando configurações padrão...');
        const configuracoes = {
            empresaNome: { valor: 'SmartHome Automação' },
            moedaPadrao: { valor: 'BRL' },
            prazoPadrao: { valor: '30' },
            condicaoPadrao: { valor: '50% entrada + 50% na entrega' },
            validadePadrao: { valor: '30' },
            darkMode: { valor: false },
            notificacao_email: { valor: false },
            notificacao_sistema: { valor: true }
        };
        
        for (const [key, value] of Object.entries(configuracoes)) {
            await db.collection('configuracoes').doc(key).set(value);
            console.log(`   ✅ Config: ${key}`);
        }
        
        // ============ 4. CRIAR PRODUTOS EXEMPLO ============
        console.log('📌 Criando produtos exemplo...');
        const produtosExemplo = [
            {
                comodo: 'Sala de Estar',
                dispositivo: 'Interruptor Inteligente Wi-Fi',
                marca: 'Sonoff',
                protocolo: 'Wi-Fi',
                qtdPadrao: 2,
                preco: 89.90,
                infra: 'Fio neutro',
                posX: 30,
                posY: 40,
                cor: '#4f46e5'
            },
            {
                comodo: 'Sala de Estar',
                dispositivo: 'Lâmpada Inteligente RGB',
                marca: 'Philips',
                protocolo: 'Zigbee',
                qtdPadrao: 4,
                preco: 159.90,
                infra: 'Base E27',
                posX: 60,
                posY: 30,
                cor: '#ec4899'
            },
            {
                comodo: 'Quarto',
                dispositivo: 'Sensor de Presença',
                marca: 'Aqara',
                protocolo: 'Zigbee',
                qtdPadrao: 1,
                preco: 79.90,
                infra: 'Pilha CR2032',
                posX: 50,
                posY: 50,
                cor: '#10b981'
            },
            {
                comodo: 'Cozinha',
                dispositivo: 'Tomada Inteligente',
                marca: 'Sonoff',
                protocolo: 'Wi-Fi',
                qtdPadrao: 3,
                preco: 69.90,
                infra: 'Tomada 10A',
                posX: 40,
                posY: 60,
                cor: '#f59e0b'
            },
            {
                comodo: 'Área Gourmet',
                dispositivo: 'Controlador de Cortinas',
                marca: 'Aqara',
                protocolo: 'Zigbee',
                qtdPadrao: 2,
                preco: 299.90,
                infra: 'Motor 220V',
                posX: 70,
                posY: 20,
                cor: '#3b82f6'
            }
        ];
        
        for (const produto of produtosExemplo) {
            const docRef = await db.collection('produtos').add({
                ...produto,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            console.log(`   ✅ Produto: ${produto.dispositivo} (${docRef.id})`);
        }
        
        // ============ 5. CRIAR CLIENTES EXEMPLO ============
        console.log('📌 Criando clientes exemplo...');
        const clientesExemplo = [
            {
                nome: 'João Silva',
                documento: '123.456.789-00',
                telefone: '(11) 98765-4321',
                email: 'joao@email.com',
                endereco: 'Rua das Flores, 123 - São Paulo/SP',
                observacoes: 'Cliente preferencial'
            },
            {
                nome: 'Maria Oliveira',
                documento: '987.654.321-00',
                telefone: '(11) 91234-5678',
                email: 'maria@email.com',
                endereco: 'Av. Paulista, 1000 - São Paulo/SP',
                observacoes: 'Indicação do João'
            },
            {
                nome: 'Empresa ABC Ltda',
                documento: '12.345.678/0001-90',
                telefone: '(11) 3456-7890',
                email: 'contato@empresaabc.com',
                endereco: 'Rua Comercial, 500 - São Paulo/SP',
                observacoes: 'Empresa de tecnologia'
            }
        ];
        
        for (const cliente of clientesExemplo) {
            const docRef = await db.collection('clientes').add({
                ...cliente,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            console.log(`   ✅ Cliente: ${cliente.nome} (${docRef.id})`);
        }
        
        // ============ 6. CRIAR ORÇAMENTOS EXEMPLO ============
        console.log('📌 Criando orçamentos exemplo...');
        const orcamentosExemplo = [
            {
                clienteId: '', // Será preenchido com o ID do primeiro cliente
                clienteNome: 'João Silva',
                vendedor: 'Paulo Oliveira',
                condicoes: '50% entrada + 50% na entrega',
                prazo: '15 dias úteis',
                observacoes: 'Orçamento para sala e quarto',
                status: 'aprovado',
                valorTotal: 1569.50,
                dataCriacao: new Date(Date.now() - 86400000 * 5).toISOString()
            },
            {
                clienteId: '',
                clienteNome: 'Maria Oliveira',
                vendedor: 'Paulo Oliveira',
                condicoes: '30% entrada + 70% na entrega',
                prazo: '20 dias úteis',
                observacoes: 'Projeto completo da casa',
                status: 'pendente',
                valorTotal: 3299.90,
                dataCriacao: new Date(Date.now() - 86400000 * 2).toISOString()
            }
        ];
        
        // Buscar IDs dos clientes criados
        const clientesSnapshot = await db.collection('clientes').limit(2).get();
        const clienteIds = clientesSnapshot.docs.map(doc => doc.id);
        
        for (let i = 0; i < orcamentosExemplo.length; i++) {
            if (i < clienteIds.length) {
                orcamentosExemplo[i].clienteId = clienteIds[i];
            }
            const docRef = await db.collection('orcamentos').add({
                ...orcamentosExemplo[i],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            console.log(`   ✅ Orçamento: ${orcamentosExemplo[i].clienteNome} (${docRef.id})`);
        }
        
        console.log('✅ FIREBASE CONFIGURADO COM SUCESSO!');
        console.log('📊 Dados criados:');
        console.log(`   - ${gerentes.length} gerentes autorizados`);
        console.log(`   - ${funcionarios.length} funcionários autorizados`);
        console.log(`   - ${Object.keys(configuracoes).length} configurações`);
        console.log(`   - ${produtosExemplo.length} produtos`);
        console.log(`   - ${clientesExemplo.length} clientes`);
        console.log(`   - ${orcamentosExemplo.length} orçamentos`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
        return false;
    }
}

// ============ FUNÇÃO PARA LIMPAR DADOS ============
async function limparTodosDados() {
    if (!confirm('⚠️ Isso vai DELETAR TODOS os dados do Firestore. Tem certeza?')) return;
    
    try {
        const db = firebase.firestore();
        const collections = ['clientes', 'produtos', 'orcamentos', 'configuracoes', 'gerentesAutorizados', 'funcionariosAutorizados'];
        
        for (const collection of collections) {
            const snapshot = await db.collection(collection).get();
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`   🗑️ ${collection} limpa`);
        }
        
        console.log('✅ Todos os dados foram removidos!');
        return true;
    } catch (error) {
        console.error('❌ Erro ao limpar dados:', error);
        return false;
    }
}

// ============ VERIFICAR SE JÁ EXISTEM DADOS ============
async function verificarDados() {
    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('clientes').limit(1).get();
        return !snapshot.empty;
    } catch (error) {
        return false;
    }
}

// ============ EXECUTAR ============
(async function() {
    console.log('🔧 Inicializando Firestore...');
    
    const temDados = await verificarDados();
    
    if (temDados) {
        console.log('📊 Já existem dados no Firestore.');
        const resposta = confirm('Já existem dados no banco. Deseja recriar tudo? (Isso vai apagar os dados existentes)');
        if (resposta) {
            await limparTodosDados();
            await initFirebase();
        } else {
            console.log('ℹ️ Manutenção dos dados existentes.');
        }
    } else {
        console.log('📭 Banco vazio. Inicializando com dados exemplo...');
        await initFirebase();
    }
})();