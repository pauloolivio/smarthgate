// ============ js/db.js ============
// Camada de abstração do banco de dados - Versão Realtime Database

class Database {
    constructor() {
        this.auth = firebase.auth();
        this.database = firebase.database();
        this._cache = {
            clientes: null,
            produtos: null,
            orcamentos: null,
            configuracoes: null,
            timestamp: 0
        };
        this.CACHE_TTL = 60000; // 1 minuto
        this._initialized = false;
    }

    // ============ INICIALIZAÇÃO ============
    async init() {
        if (this._initialized) return;
        try {
            await this.database.ref('.info/connected').once('value');
            this._initialized = true;
            console.log('✅ Database inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar database:', error);
            throw error;
        }
    }

    // ============ CACHE ============
    _isCacheValid() {
        return Date.now() - this._cache.timestamp < this.CACHE_TTL;
    }

    _clearCache() {
        this._cache = {
            clientes: null,
            produtos: null,
            orcamentos: null,
            configuracoes: null,
            timestamp: 0
        };
    }

    // ============ UTILITÁRIOS ============
    _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    }

    _generateCodigo() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let codigo = '';
        for (let i = 0; i < 6; i++) {
            codigo += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return codigo;
    }

    _snapshotToArray(snapshot) {
        const data = [];
        if (!snapshot.exists()) return data;
        snapshot.forEach(child => {
            data.push({
                id: child.key,
                ...child.val()
            });
        });
        return data;
    }

    // ============ CLIENTES ============
    async getClientes(forceRefresh = false) {
        if (!forceRefresh && this._cache.clientes && this._isCacheValid()) {
            return this._cache.clientes;
        }

        try {
            const snapshot = await this.database.ref('clientes').once('value');
            const data = this._snapshotToArray(snapshot);
            data.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
            this._cache.clientes = data;
            this._cache.timestamp = Date.now();
            return data;
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            return this._cache.clientes || [];
        }
    }

    async salvarCliente(data) {
        try {
            this._clearCache();
            const dataToSave = {
                nome: data.nome || '',
                documento: data.documento || '',
                telefone: data.telefone || '',
                email: data.email || '',
                endereco: data.endereco || '',
                observacoes: data.observacoes || '',
                updatedAt: new Date().toISOString()
            };
            
            if (data.id) {
                await this.database.ref(`clientes/${data.id}`).set(dataToSave);
                return data.id;
            } else {
                const id = this._generateId();
                dataToSave.createdAt = new Date().toISOString();
                await this.database.ref(`clientes/${id}`).set(dataToSave);
                return id;
            }
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            throw error;
        }
    }

    async deletarCliente(id) {
        try {
            this._clearCache();
            await this.database.ref(`clientes/${id}`).remove();
        } catch (error) {
            console.error('Erro ao deletar cliente:', error);
            throw error;
        }
    }

    async getClientePorId(id) {
        try {
            const snapshot = await this.database.ref(`clientes/${id}`).once('value');
            const data = snapshot.val();
            if (data) {
                return { id: id, ...data };
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            return null;
        }
    }

    // ============ PRODUTOS ============
    async getProdutos(forceRefresh = false) {
        if (!forceRefresh && this._cache.produtos && this._isCacheValid()) {
            console.log('📦 Usando cache de produtos:', this._cache.produtos.length);
            return this._cache.produtos;
        }

        try {
            console.log('📦 Buscando produtos do Firebase...');
            const snapshot = await this.database.ref('produtos').once('value');
            
            if (!snapshot.exists()) {
                console.log('📦 Nenhum produto encontrado no Firebase');
                this._cache.produtos = [];
                this._cache.timestamp = Date.now();
                return [];
            }

            const data = this._snapshotToArray(snapshot);
            console.log(`📦 ${data.length} produtos carregados do Firebase`);
            
            data.sort((a, b) => (a.codigo || '').localeCompare(b.codigo || ''));
            
            this._cache.produtos = data;
            this._cache.timestamp = Date.now();
            return data;
        } catch (error) {
            console.error('❌ Erro ao buscar produtos:', error);
            return this._cache.produtos || [];
        }
    }

    async salvarProduto(data) {
        try {
            this._clearCache();
            
            let codigo = data.codigo;
            if (!codigo) {
                codigo = this._generateCodigo();
            }
            
            const nome = data.nome || data.dispositivo || 'Produto sem nome';
            const dispositivo = data.dispositivo || nome;

            const dataToSave = {
                codigo: codigo.toUpperCase(),
                nome: nome,
                dispositivo: dispositivo,
                marca: data.marca || '',
                categoria: data.categoria || 'Outros',
                protocolo: data.protocolo || 'Wi-Fi',
                imagem: data.imagem || '',
                especificacoes: data.especificacoes || '',
                cor: data.cor || '#4f46e5',
                posX: data.posX || 50,
                posY: data.posY || 50,
                qtdPadrao: data.qtdPadrao || 0,
                preco: data.preco || 0,
                comodo: data.comodo || 'Sem Cômodo',
                updatedAt: new Date().toISOString()
            };
            
            if (data.id) {
                await this.database.ref(`produtos/${data.id}`).set(dataToSave);
                console.log(`✅ Produto ${codigo} atualizado`);
                return data.id;
            } else {
                const id = this._generateId();
                dataToSave.createdAt = new Date().toISOString();
                await this.database.ref(`produtos/${id}`).set(dataToSave);
                console.log(`✅ Produto ${codigo} criado com ID: ${id}`);
                return id;
            }
        } catch (error) {
            console.error('❌ Erro ao salvar produto:', error);
            throw error;
        }
    }

    async deletarProduto(id) {
        try {
            this._clearCache();
            await this.database.ref(`produtos/${id}`).remove();
            console.log(`🗑️ Produto ${id} deletado`);
        } catch (error) {
            console.error('❌ Erro ao deletar produto:', error);
            throw error;
        }
    }

    async getProdutoPorId(id) {
        try {
            const snapshot = await this.database.ref(`produtos/${id}`).once('value');
            const data = snapshot.val();
            if (data) {
                return { id: id, ...data };
            }
            return null;
        } catch (error) {
            console.error('❌ Erro ao buscar produto por ID:', error);
            return null;
        }
    }

    async getProdutoPorCodigo(codigo) {
        try {
            const produtos = await this.getProdutos(false);
            return produtos.find(p => p.codigo === codigo) || null;
        } catch (error) {
            console.error('❌ Erro ao buscar produto por código:', error);
            return null;
        }
    }

    async getProdutosPorCategoria(categoria) {
        try {
            const produtos = await this.getProdutos();
            return produtos.filter(p => (p.categoria || '').toLowerCase() === categoria.toLowerCase());
        } catch (error) {
            console.error('❌ Erro ao buscar produtos por categoria:', error);
            return [];
        }
    }

    // ============ ORÇAMENTOS ============
    async getOrcamentos(forceRefresh = false) {
        if (!forceRefresh && this._cache.orcamentos && this._isCacheValid()) {
            return this._cache.orcamentos;
        }

        try {
            const snapshot = await this.database.ref('orcamentos').once('value');
            const data = this._snapshotToArray(snapshot);
            data.sort((a, b) => {
                const dateA = new Date(a.dataCriacao || 0);
                const dateB = new Date(b.dataCriacao || 0);
                return dateB - dateA;
            });
            this._cache.orcamentos = data;
            this._cache.timestamp = Date.now();
            return data;
        } catch (error) {
            console.error('Erro ao buscar orçamentos:', error);
            return this._cache.orcamentos || [];
        }
    }

    async salvarOrcamento(data) {
        try {
            this._clearCache();
            const dataToSave = {
                clienteId: data.clienteId || '',
                clienteNome: data.clienteNome || '',
                vendedor: data.vendedor || '',
                condicoes: data.condicoes || '50% entrada + 50% na entrega',
                prazo: data.prazo || '15 dias úteis',
                observacoes: data.observacoes || '',
                status: data.status || 'pendente',
                valorTotal: data.valorTotal || 0,
                dataCriacao: data.dataCriacao || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            if (data.id) {
                await this.database.ref(`orcamentos/${data.id}`).set(dataToSave);
                return data.id;
            } else {
                const id = this._generateId();
                dataToSave.createdAt = new Date().toISOString();
                await this.database.ref(`orcamentos/${id}`).set(dataToSave);
                return id;
            }
        } catch (error) {
            console.error('Erro ao salvar orçamento:', error);
            throw error;
        }
    }

    async deletarOrcamento(id) {
        try {
            this._clearCache();
            await this.database.ref(`orcamentos/${id}`).remove();
        } catch (error) {
            console.error('Erro ao deletar orçamento:', error);
            throw error;
        }
    }

    // ============ ORÇAMENTOS POR CÔMODO ============
    async getOrcamentoComodo(clienteId) {
        try {
            const snapshot = await this.database.ref(`orcamentos_comodo/${clienteId}`).once('value');
            return snapshot.val() || {};
        } catch (error) {
            console.error('Erro ao buscar orçamento por cômodo:', error);
            return {};
        }
    }

    async salvarOrcamentoComodo(clienteId, data) {
        try {
            await this.database.ref(`orcamentos_comodo/${clienteId}`).set(data);
            return true;
        } catch (error) {
            console.error('Erro ao salvar orçamento por cômodo:', error);
            throw error;
        }
    }

    async deletarOrcamentoComodo(clienteId) {
        try {
            await this.database.ref(`orcamentos_comodo/${clienteId}`).remove();
            return true;
        } catch (error) {
            console.error('Erro ao deletar orçamento por cômodo:', error);
            throw error;
        }
    }

    // ============ CONFIGURAÇÕES ============
    async getConfiguracoes(forceRefresh = false) {
        if (!forceRefresh && this._cache.configuracoes && this._isCacheValid()) {
            return this._cache.configuracoes;
        }

        try {
            const snapshot = await this.database.ref('configuracoes').once('value');
            const data = snapshot.val() || {};
            this._cache.configuracoes = data;
            this._cache.timestamp = Date.now();
            return data;
        } catch (error) {
            console.error('Erro ao buscar configurações:', error);
            return this._cache.configuracoes || {};
        }
    }

    async salvarConfiguracao(chave, valor) {
        try {
            this._clearCache();
            await this.database.ref(`configuracoes/${chave}`).set({
                valor: valor,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Erro ao salvar configuração:', error);
            throw error;
        }
    }

    // ============ AUTENTICAÇÃO ============
    async verificarAutorizacao(email, role) {
        try {
            const collectionName = role === 'gerente' 
                ? 'gerentesAutorizados' 
                : 'funcionariosAutorizados';
            const snapshot = await this.database
                .ref(`${collectionName}/${email.replace(/\./g, '_')}`)
                .once('value');
            const data = snapshot.val();
            
            if (data && data.autorizado === true) {
                return true;
            }
        } catch(e) {
            console.log('Erro ao verificar autorização:', e);
        }

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

    // ============ VERIFICAR CONEXÃO ============
    async verificarConexao() {
        try {
            await this.database.ref('.info/connected').once('value');
            return true;
        } catch (error) {
            console.error('Erro ao verificar conexão:', error);
            return false;
        }
    }

    // ============ SEED DE DADOS EXEMPLO ============
    async seedDadosExemplo() {
        try {
            console.log('🌱 Iniciando seed de dados exemplo...');
            
            // Verificar se já existem produtos
            const produtos = await this.getProdutos(true);
            if (produtos.length > 0) {
                console.log('📦 Dados já existem, pulando seed');
                return;
            }

            // Tenta carregar do dados.json
            try {
                const response = await fetch('dados.json');
                if (response.ok) {
                    const jsonData = await response.json();
                    
                    // Importar clientes
                    if (jsonData.clientes) {
                        for (const [key, c] of Object.entries(jsonData.clientes)) {
                            await this.salvarCliente({ ...c, id: key });
                        }
                        console.log('✅ Clientes importados do dados.json');
                    }

                    // Importar produtos
                    if (jsonData.produtos) {
                        for (const [key, p] of Object.entries(jsonData.produtos)) {
                            await this.salvarProduto({ ...p, id: key });
                        }
                        console.log('✅ Produtos importados do dados.json');
                    }

                    // Importar orçamentos
                    if (jsonData.orcamentos) {
                        for (const [key, o] of Object.entries(jsonData.orcamentos)) {
                            await this.database.ref(`orcamentos/${key}`).set({
                                ...o,
                                id: key
                            });
                        }
                        console.log('✅ Orçamentos importados do dados.json');
                    }

                    // Importar configurações
                    if (jsonData.configuracoes) {
                        for (const [key, config] of Object.entries(jsonData.configuracoes)) {
                            await this.database.ref(`configuracoes/${key}`).set(config);
                        }
                        console.log('✅ Configurações importadas do dados.json');
                    }

                    console.log('✅ Seed concluído com sucesso!');
                    this._clearCache();
                    return true;
                }
            } catch (fetchError) {
                console.log('⚠️ dados.json não encontrado, usando dados padrão');
            }

            // Dados padrão (fallback)
            const produtosExemplo = [
                {
                    codigo: 'PRD001',
                    nome: 'Interruptor Inteligente Wi-Fi',
                    dispositivo: 'Interruptor Inteligente Wi-Fi',
                    marca: 'Sonoff',
                    categoria: 'Interruptores',
                    protocolo: 'Wi-Fi',
                    preco: 180,
                    qtdPadrao: 1,
                    especificacoes: 'Alimentação: 110-220V\nConsumo: 5W\nCompatível com Alexa e Google Home',
                    comodo: 'Sala de Estar',
                    cor: '#4f46e5'
                },
                {
                    codigo: 'PRD002',
                    nome: 'Sensor de Presença Zigbee',
                    dispositivo: 'Sensor de Presença Zigbee',
                    marca: 'Aqara',
                    categoria: 'Sensores',
                    protocolo: 'Zigbee',
                    preco: 150,
                    qtdPadrao: 1,
                    especificacoes: 'Alimentação: Bateria CR2032\nÂngulo: 120°\nAlcance: 7m',
                    comodo: 'Sala de Estar',
                    cor: '#10b981'
                },
                {
                    codigo: 'PRD003',
                    nome: 'Tomada Inteligente 10A',
                    dispositivo: 'Tomada Inteligente 10A',
                    marca: 'Sonoff',
                    categoria: 'Tomadas',
                    protocolo: 'Wi-Fi',
                    preco: 90,
                    qtdPadrao: 2,
                    especificacoes: 'Alimentação: 110-220V\nCorrente: 10A\nPotência: 2200W',
                    comodo: 'Cozinha',
                    cor: '#f59e0b'
                }
            ];

            for (const p of produtosExemplo) {
                await this.salvarProduto(p);
            }

            console.log('✅ Seed concluído com dados padrão!');
            this._clearCache();
            return true;
        } catch (error) {
            console.error('❌ Erro ao fazer seed:', error);
            throw error;
        }
    }
}

// Criar instância global
const db = new Database();

// Exportar para uso global
window.db = db;
window.Database = Database;

console.log('✅ Database (Realtime) inicializado - v3.0');
console.log('📦 Estrutura:');
console.log('   - Clientes: nome, documento, telefone, email, endereco, observacoes');
console.log('   - Produtos: codigo, nome, dispositivo, marca, categoria, protocolo, preco, comodo');
console.log('   - Orçamentos: clienteId, clienteNome, vendedor, condicoes, status, valorTotal');
console.log('   - Orçamentos por Cômodo: orcamentos_comodo/{clienteId}');

// Inicializar e fazer seed automático
(async function() {
    try {
        await db.init();
        setTimeout(async () => {
            try {
                await db.seedDadosExemplo();
            } catch (e) {
                console.warn('Seed não executado:', e.message);
            }
        }, 2000);
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
    }
})();