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

    _snapshotToArray(snapshot) {
        const data = [];
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
            // Ordenar por nome
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
                ...data,
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
            return this._cache.produtos;
        }

        try {
            const snapshot = await this.database.ref('produtos').once('value');
            const data = this._snapshotToArray(snapshot);
            // Ordenar por dispositivo
            data.sort((a, b) => (a.dispositivo || '').localeCompare(b.dispositivo || ''));
            this._cache.produtos = data;
            this._cache.timestamp = Date.now();
            return data;
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            return this._cache.produtos || [];
        }
    }

    async salvarProduto(data) {
        try {
            this._clearCache();
            const dataToSave = {
                ...data,
                updatedAt: new Date().toISOString()
            };
            
            if (data.id) {
                await this.database.ref(`produtos/${data.id}`).set(dataToSave);
                return data.id;
            } else {
                const id = this._generateId();
                dataToSave.createdAt = new Date().toISOString();
                await this.database.ref(`produtos/${id}`).set(dataToSave);
                return id;
            }
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            throw error;
        }
    }

    async deletarProduto(id) {
        try {
            this._clearCache();
            await this.database.ref(`produtos/${id}`).remove();
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            throw error;
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
            // Ordenar por data de criação (mais recentes primeiro)
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
                ...data,
                updatedAt: new Date().toISOString()
            };
            
            if (!data.dataCriacao) {
                dataToSave.dataCriacao = new Date().toISOString();
            }
            
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
                ...valor,
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

    // ============ UTILITÁRIOS ============
    async exportarDados() {
        const [clientes, produtos, orcamentos, configs] = await Promise.all([
            this.getClientes(true),
            this.getProdutos(true),
            this.getOrcamentos(true),
            this.getConfiguracoes(true)
        ]);

        return {
            _exported: true,
            _timestamp: new Date().toISOString(),
            _version: '2.0',
            data: {
                clients: clientes,
                products: produtos,
                budgets: orcamentos,
                configs: configs
            }
        };
    }

    async importarDados(data) {
        try {
            this._clearCache();
            
            if (data.data?.clients) {
                for (const c of data.data.clients) {
                    await this.salvarCliente(c);
                }
            }

            if (data.data?.products) {
                for (const p of data.data.products) {
                    await this.salvarProduto(p);
                }
            }

            if (data.data?.budgets) {
                for (const o of data.data.budgets) {
                    await this.salvarOrcamento(o);
                }
            }

            if (data.data?.configs) {
                for (const [key, value] of Object.entries(data.data.configs)) {
                    await this.salvarConfiguracao(key, value);
                }
            }

            return true;
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            throw error;
        }
    }
}

// Criar instância global
const db = new Database();

// Exportar para uso global
window.db = db;
window.Database = Database;

console.log('✅ Database (Realtime) inicializado');
console.log('📦 db disponível em window.db');