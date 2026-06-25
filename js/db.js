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

    // ============ PRODUTOS (VERSÃO SIMPLIFICADA) ============
    async getProdutos(forceRefresh = false) {
        if (!forceRefresh && this._cache.produtos && this._isCacheValid()) {
            return this._cache.produtos;
        }

        try {
            const snapshot = await this.database.ref('produtos').once('value');
            const data = this._snapshotToArray(snapshot);
            // Ordenar por código
            data.sort((a, b) => (a.codigo || '').localeCompare(b.codigo || ''));
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
            
            // Garantir que o código existe
            let codigo = data.codigo;
            if (!codigo) {
                codigo = this._generateCodigo();
            }
            
            // Verificar código duplicado (apenas para novos produtos ou mudança de código)
            if (!data.id) {
                const conflito = await this.getProdutoPorCodigo(codigo);
                if (conflito) {
                    // Gerar novo código automaticamente
                    let tentativas = 0;
                    while (tentativas < 10) {
                        codigo = this._generateCodigo();
                        const existe = await this.getProdutoPorCodigo(codigo);
                        if (!existe) break;
                        tentativas++;
                    }
                }
            } else {
                // Editando - verificar se o código mudou
                const existing = await this.getProdutoPorId(data.id);
                if (existing && existing.codigo !== codigo) {
                    const conflito = await this.getProdutoPorCodigo(codigo);
                    if (conflito) {
                        throw new Error('Código já está em uso por outro produto');
                    }
                }
            }

            const dataToSave = {
                codigo: codigo,
                dispositivo: data.dispositivo || data.nome || '',
                nome: data.nome || data.dispositivo || '',
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

    async getProdutoPorId(id) {
        try {
            const snapshot = await this.database.ref(`produtos/${id}`).once('value');
            const data = snapshot.val();
            if (data) {
                return { id: id, ...data };
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar produto por ID:', error);
            return null;
        }
    }

    async getProdutoPorCodigo(codigo) {
        try {
            // Não forçar refresh para evitar loops
            const produtos = await this.getProdutos(false);
            return produtos.find(p => p.codigo === codigo) || null;
        } catch (error) {
            console.error('Erro ao buscar produto por código:', error);
            return null;
        }
    }

    async getProdutosPorMarca(marca) {
        try {
            const produtos = await this.getProdutos();
            return produtos.filter(p => 
                (p.marca || '').toLowerCase().includes(marca.toLowerCase())
            );
        } catch (error) {
            console.error('Erro ao buscar produtos por marca:', error);
            return [];
        }
    }

    async getProdutosPorProtocolo(protocolo) {
        try {
            const produtos = await this.getProdutos();
            return produtos.filter(p => 
                (p.protocolo || '').toLowerCase() === protocolo.toLowerCase()
            );
        } catch (error) {
            console.error('Erro ao buscar produtos por protocolo:', error);
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

    async getOrcamentosPorCliente(clienteId) {
        try {
            const orcamentos = await this.getOrcamentos();
            return orcamentos.filter(o => o.clienteId === clienteId);
        } catch (error) {
            console.error('Erro ao buscar orçamentos por cliente:', error);
            return [];
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
            _version: '3.0',
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

    // ============ MIGRAÇÃO DE PRODUTOS (VERSÃO SIMPLIFICADA) ============
    async migrarProdutosLegado() {
        try {
            console.log('🔄 Iniciando migração de produtos para novo formato...');
            const produtos = await this.getProdutos(true);
            let migrados = 0;

            for (const p of produtos) {
                // Verificar se tem campos legados que precisam ser migrados
                const precisaMigrar = p.nome || p.dispositivo_antigo || p.comodo || p.infra;
                
                if (precisaMigrar) {
                    const dataToUpdate = {
                        codigo: p.codigo || this._generateCodigo(),
                        dispositivo: p.dispositivo || p.nome || 'Sem nome',
                        nome: p.nome || p.dispositivo || 'Sem nome',
                        marca: p.marca || 'Sem marca',
                        categoria: p.categoria || 'Outros',
                        protocolo: p.protocolo || 'Wi-Fi',
                        imagem: p.imagem || '',
                        especificacoes: p.especificacoes || '',
                        cor: p.cor || '#4f46e5',
                        posX: p.posX || 50,
                        posY: p.posY || 50,
                        qtdPadrao: p.qtdPadrao || 0,
                        preco: p.preco || 0,
                        updatedAt: new Date().toISOString()
                    };

                    // Manter createdAt se existir
                    if (p.createdAt) {
                        dataToUpdate.createdAt = p.createdAt;
                    }

                    await this.database.ref(`produtos/${p.id}`).set(dataToUpdate);
                    migrados++;
                    console.log(`   ✅ Produto ${p.id} (${dataToUpdate.codigo}) migrado`);
                }
            }

            console.log(`✅ Migração concluída: ${migrados} produtos atualizados`);
            return migrados;
        } catch (error) {
            console.error('❌ Erro na migração:', error);
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
console.log('📦 Estrutura simplificada:');
console.log('   - Clientes: nome, documento, telefone, email, endereco, observacoes');
console.log('   - Produtos: codigo, dispositivo, nome, marca, categoria, protocolo, imagem, especificacoes, cor, posX, posY, qtdPadrao, preco');
console.log('   - Orçamentos: clienteId, clienteNome, vendedor, condicoes, prazo, observacoes, status, valorTotal, dataCriacao');
console.log('   - Configurações: chave -> valor');

// Migração automática removida para evitar loops