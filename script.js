// sistema de gerenciamento do petshop
// usa localStorage pra guardar tudo

// configuracao inicial
const NOME_DB = 'petshop_dados';
const VERSAO_DB = '1.0';

// estrutura dos dados do sistema
const dadosSistema = {
    clientes: [],
    enderecos: [],
    pets: [],
    servicos: [],
    produtos: [],
    agendamentos: [],
    agendamento_servicos: [],
    carrinhos: [],
    item_carrinhos: [],
    compras: [],
    item_compras: []
};

// classe principal pra gerenciar os dados
class GerenciadorDados {
    constructor() {
        this.iniciarBanco();
        this.paginaAtual = {};
        this.itensPorPagina = 10;
    }

    iniciarBanco() {
        const dadosSalvos = localStorage.getItem(NOME_DB);
        if (dadosSalvos) {
            try {
                const dadosCarregados = JSON.parse(dadosSalvos);
                Object.assign(dadosSistema, dadosCarregados);
            } catch (erro) {
                console.error('Deu ruim ao carregar:', erro);
                this.resetarBanco();
            }
        } else {
            this.criarDadosIniciais();
        }
    }

    salvarNoStorage() {
        try {
            localStorage.setItem(NOME_DB, JSON.stringify(dadosSistema));
            return true;
        } catch (erro) {
            console.error('Erro ao salvar:', erro);
            mostrarToast('Erro ao salvar dados', 'error');
            return false;
        }
    }

    resetarBanco() {
        if (confirm('Tem certeza que quer apagar tudo?')) {
            localStorage.removeItem(NOME_DB);
            Object.keys(dadosSistema).forEach(chave => {
                dadosSistema[chave] = [];
            });
            this.criarDadosIniciais();
            mostrarToast('Banco resetado', 'success');
            location.reload();
        }
    }

    criarDadosIniciais() {
        // dados de exemplo pro sistema funcionar
        dadosSistema.clientes = [
            {id: 1, nome: 'Jorlan Lemos Socho', email: 'jorlans@gmail.com', telefone: '12499358', tipo: 'funcionario', cargo: 'Dono', ativo: true},
            {id: 2, nome: 'Maria Oliveira', email: 'mariao@gmail.com', telefone: '11965432109', tipo: 'cliente', cpf: '123.456.789-01', ativo: true},
            {id: 3, nome: 'Bernardo Costa', email: 'bernardoc@gmail.com', telefone: '11954321098', tipo: 'cliente', cpf: '987.654.321-02', ativo: true},
            {id: 4, nome: 'Sofia Lima', email: 'sofial@gmail.com', telefone: '11943210987', tipo: 'cliente', cpf: '456.789.123-03', ativo: true}
        ];

        dadosSistema.produtos = [
            {id: 1, nome: 'Ração Premium Cães 15kg', categoria: 'racao', preco: 89.90, estoque: 25, estoqueMinimo: 5, ativo: true},
            {id: 2, nome: 'Ração Gatos 3kg', categoria: 'racao', preco: 45.90, estoque: 18, estoqueMinimo: 5, ativo: true},
            {id: 3, nome: 'Shampoo Neutro 500ml', categoria: 'higiene', preco: 25.50, estoque: 15, estoqueMinimo: 5, ativo: true},
            {id: 4, nome: 'Bola de Tênis', categoria: 'brinquedo', preco: 12.90, estoque: 30, estoqueMinimo: 10, ativo: true},
            {id: 5, nome: 'Coleira Ajustável M', categoria: 'acessorio', preco: 18.90, estoque: 20, estoqueMinimo: 5, ativo: true},
            {id: 6, nome: 'Brinquedo Ratinho', categoria: 'brinquedo', preco: 8.50, estoque: 25, estoqueMinimo: 10, ativo: true}
        ];

        dadosSistema.pets = [
            {id: 1, nome: 'Rex', tipo: 'cachorro', porte: 'grande', idade: '3 anos', observacoes: 'Muito dócil, adora água', idTutor: 2},
            {id: 2, nome: 'Luna', tipo: 'cachorro', porte: 'medio', idade: '2 anos', observacoes: 'Agitada mas obediente', idTutor: 3},
            {id: 3, nome: 'Mimi', tipo: 'gato', porte: 'pequeno', idade: '4 anos', observacoes: 'Tímida, não gosta de barulho', idTutor: 2},
            {id: 4, nome: 'Thor', tipo: 'cachorro', porte: 'grande', idade: '5 anos', observacoes: 'Calmo e protetor', idTutor: 4},
            {id: 5, nome: 'Mel', tipo: 'gato', porte: 'pequeno', idade: '1 ano', observacoes: 'Brincalhona e carinhosa', idTutor: 3}
        ];

        dadosSistema.servicos = [
            {id: 1, nome: 'Banho Completo', descricao: 'Banho com shampoo e secagem', preco: 45.00, duracaoMinutos: 60, ativo: true},
            {id: 2, nome: 'Tosa Simples', descricao: 'Corte básico de pelos', preco: 35.00, duracaoMinutos: 45, ativo: true},
            {id: 3, nome: 'Corte de Unhas', descricao: 'Corte seguro das unhas', preco: 15.00, duracaoMinutos: 15, ativo: true},
            {id: 4, nome: 'Hidratação', descricao: 'Tratamento hidratante para pelos', preco: 25.00, duracaoMinutos: 30, ativo: true}
        ];

        this.salvarNoStorage();
    }

    gerarId(colecao) {
        const itens = dadosSistema[colecao];
        if (!itens || itens.length === 0) return 1;
        return Math.max(...itens.map(item => item.id)) + 1;
    }

    // operacoes basicas do crud
    criar(colecao, dados) {
        dados.id = this.gerarId(colecao);
        dados.criadoEm = new Date().toISOString();
        dadosSistema[colecao].push(dados);
        this.salvarNoStorage();
        return dados;
    }

    ler(colecao, id = null) {
        if (id) {
            return dadosSistema[colecao].find(item => item.id === parseInt(id));
        }
        return dadosSistema[colecao];
    }

    atualizar(colecao, id, dados) {
        const indice = dadosSistema[colecao].findIndex(item => item.id === parseInt(id));
        if (indice !== -1) {
            dados.atualizadoEm = new Date().toISOString();
            dadosSistema[colecao][indice] = { ...dadosSistema[colecao][indice], ...dados };
            this.salvarNoStorage();
            return dadosSistema[colecao][indice];
        }
        return null;
    }

    excluir(colecao, id) {
        const indice = dadosSistema[colecao].findIndex(item => item.id === parseInt(id));
        if (indice !== -1) {
            dadosSistema[colecao].splice(indice, 1);
            this.salvarNoStorage();
            return true;
        }
        return false;
    }

    buscar(colecao, busca, campos = []) {
        if (!busca) return dadosSistema[colecao];
        
        const buscaMinuscula = busca.toLowerCase();
        return dadosSistema[colecao].filter(item => {
            return campos.some(campo => {
                const valor = item[campo];
                if (valor) {
                    return valor.toString().toLowerCase().includes(buscaMinuscula);
                }
                return false;
            });
        });
    }

    filtrar(colecao, filtros) {
        let resultados = dadosSistema[colecao];
        
        Object.keys(filtros).forEach(chave => {
            if (filtros[chave]) {
                resultados = resultados.filter(item => item[chave] === filtros[chave]);
            }
        });
        
        return resultados;
    }
}

// instancia principal do gerenciador
const bd = new GerenciadorDados();

// funcoes da interface
function mostrarAba(nomeAba) {
    // esconder todas as abas
    document.querySelectorAll('.conteudo-aba').forEach(aba => {
        aba.classList.remove('ativa');
    });
    
    // tirar ativo de todos os botoes
    document.querySelectorAll('.aba-menu').forEach(btn => {
        btn.classList.remove('ativa');
    });
    
    // mostrar aba selecionada
    document.getElementById(nomeAba).classList.add('ativa');
    
    // ativar o botao
    event.target.classList.add('ativa');
    
    // carregar dados da aba
    carregarDadosAba(nomeAba);
}

function carregarDadosAba(nomeAba) {
    switch(nomeAba) {
        case 'painel':
            atualizarPainel();
            break;
        case 'produtos':
            carregarProdutos();
            break;
        case 'clientes':
            carregarClientes();
            break;
        case 'pets':
            carregarPets();
            break;
        case 'servicos':
            carregarServicos();
            break;
        case 'agenda':
            carregarAgenda();
            break;
        case 'vendas':
            carregarVendas();
            break;
        case 'relatorios':
            carregarRelatorios();
            break;
        case 'config':
            carregarConfig();
            break;
    }
}

// painel principal
function atualizarPainel() {
    // calcular estatisticas
    const produtos = bd.ler('produtos');
    const clientes = bd.ler('clientes');
    const valorEstoque = produtos.reduce((total, prod) => total + (prod.preco * prod.estoque), 0);
    const produtosPoucando = produtos.filter(p => p.estoque <= p.estoqueMinimo).length;
    
    document.getElementById('totalProdutos').textContent = produtos.length;
    document.getElementById('totalClientes').textContent = clientes.length;
    document.getElementById('valorEstoque').textContent = formatarMoeda(valorEstoque);
    document.getElementById('produtosPoucando').textContent = produtosPoucando;
    
    // alertas do sistema
    atualizarAlertasSistema();
    
    // produtos mais vendidos (simulado)
    atualizarTopProdutos();
}

function atualizarAlertasSistema() {
    const containerAlertas = document.getElementById('alertasSistema');
    containerAlertas.innerHTML = '';
    
    const produtos = bd.ler('produtos');
    const produtosPoucando = produtos.filter(p => p.estoque <= p.estoqueMinimo);
    
    if (produtosPoucando.length > 0) {
        produtosPoucando.forEach(produto => {
            const alerta = document.createElement('div');
            alerta.className = 'item-alerta warning';
            alerta.innerHTML = `
                <span>⚠️</span>
                <span>Produto "${produto.nome}" com estoque baixo (${produto.estoque} unidades)</span>
            `;
            containerAlertas.appendChild(alerta);
        });
    } else {
        containerAlertas.innerHTML = '<div class="item-alerta info"><span>✅</span><span>Todos os produtos ok</span></div>';
    }
}

function atualizarTopProdutos() {
    const container = document.getElementById('topProdutos');
    const produtos = bd.ler('produtos').slice(0, 5);
    
    container.innerHTML = produtos.map((produto, indice) => `
        <div style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">
            <strong>${indice + 1}. ${produto.nome}</strong>
            <br>
            <small>Estoque: ${produto.estoque} | Preço: ${formatarMoeda(produto.preco)}</small>
        </div>
    `).join('');
}

// produtos
function carregarProdutos() {
    const tbody = document.getElementById('tabelaProdutos');
    const produtos = bd.ler('produtos');
    
    tbody.innerHTML = produtos.map(produto => `
        <tr>
            <td><input type="checkbox" class="selecionar-produto" value="${produto.id}"></td>
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>${formatarCategoria(produto.categoria)}</td>
            <td>${formatarMoeda(produto.preco)}</td>
            <td>
                <span class="${getClasseEstoque(produto)}">${produto.estoque}</span>
            </td>
            <td>
                <span class="status ${produto.ativo ? 'ativo' : 'inativo'}">
                    ${produto.ativo ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editarProduto(${produto.id})">✏️</button>
                    <button class="btn-action btn-delete" onclick="excluirProduto(${produto.id})">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    configurarBuscaProdutos();
    configurarFiltroCategoria();
}

function abrirModalProduto(id = null) {
    const modal = document.getElementById('modalProduto');
    const form = document.getElementById('formProduto');
    const titulo = document.getElementById('tituloProduto');
    
    if (id) {
        const produto = bd.ler('produtos', id);
        if (produto) {
            titulo.textContent = 'Editar Produto';
            document.getElementById('idProduto').value = produto.id;
            document.getElementById('nomeProduto').value = produto.nome;
            document.getElementById('categoriaProduto').value = produto.categoria;
            document.getElementById('precoProduto').value = produto.preco;
            document.getElementById('estoqueProduto').value = produto.estoque;
            document.getElementById('estoqueMinimo').value = produto.estoqueMinimo || 5;
            document.getElementById('descricaoProduto').value = produto.descricao || '';
            document.getElementById('ativoProduto').value = produto.ativo ? '1' : '0';
        }
    } else {
        titulo.textContent = 'Novo Produto';
        form.reset();
        document.getElementById('idProduto').value = '';
    }
    
    modal.classList.add('show');
}

function fecharModalProduto() {
    document.getElementById('modalProduto').classList.remove('show');
}

function editarProduto(id) {
    abrirModalProduto(id);
}

function excluirProduto(id) {
    if (confirm('Tem certeza que quer excluir este produto?')) {
        if (bd.excluir('produtos', id)) {
            mostrarToast('Produto excluído', 'success');
            carregarProdutos();
            atualizarPainel();
        } else {
            mostrarToast('Erro ao excluir produto', 'error');
        }
    }
}

function configurarBuscaProdutos() {
    const caixaBusca = document.getElementById('buscarProdutos');
    if (caixaBusca) {
        caixaBusca.addEventListener('input', (e) => {
            const busca = e.target.value;
            const produtos = bd.buscar('produtos', busca, ['nome', 'categoria']);
            renderizarProdutos(produtos);
        });
    }
}

function configurarFiltroCategoria() {
    const filtro = document.getElementById('filtroCategoria');
    if (filtro) {
        filtro.addEventListener('change', (e) => {
            const categoria = e.target.value;
            const produtos = categoria ? bd.filtrar('produtos', { categoria }) : bd.ler('produtos');
            renderizarProdutos(produtos);
        });
    }
}

function renderizarProdutos(produtos) {
    const tbody = document.getElementById('tabelaProdutos');
    tbody.innerHTML = produtos.map(produto => `
        <tr>
            <td><input type="checkbox" class="selecionar-produto" value="${produto.id}"></td>
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>${formatarCategoria(produto.categoria)}</td>
            <td>${formatarMoeda(produto.preco)}</td>
            <td>
                <span class="${getClasseEstoque(produto)}">${produto.estoque}</span>
            </td>
            <td>
                <span class="status ${produto.ativo ? 'ativo' : 'inativo'}">
                    ${produto.ativo ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editarProduto(${produto.id})">✏️</button>
                    <button class="btn-action btn-delete" onclick="excluirProduto(${produto.id})">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// clientes
function carregarClientes() {
    const tbody = document.getElementById('tabelaClientes');
    const clientes = bd.ler('clientes');
    
    tbody.innerHTML = clientes.map(cliente => `
        <tr>
            <td>${cliente.id}</td>
            <td>${cliente.nome}</td>
            <td>${cliente.email}</td>
            <td>${cliente.telefone}</td>
            <td>
                <span class="status ${cliente.tipo}">
                    ${cliente.tipo === 'cliente' ? 'Cliente' : 'Funcionário'}
                </span>
            </td>
            <td>${cliente.tipo === 'cliente' ? cliente.cpf || '-' : cliente.cargo || '-'}</td>
            <td>
                <span class="status ${cliente.ativo ? 'ativo' : 'inativo'}">
                    ${cliente.ativo ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editarCliente(${cliente.id})">✏️</button>
                    <button class="btn-action btn-delete" onclick="excluirCliente(${cliente.id})">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    configurarBuscaClientes();
    configurarFiltroTipoCliente();
}

function abrirModalCliente(id = null) {
    const modal = document.getElementById('modalCliente');
    const form = document.getElementById('formCliente');
    const titulo = document.getElementById('tituloCliente');
    
    if (id) {
        const cliente = bd.ler('clientes', id);
        if (cliente) {
            titulo.textContent = 'Editar Cliente';
            document.getElementById('idCliente').value = cliente.id;
            document.getElementById('nomeCliente').value = cliente.nome;
            document.getElementById('emailCliente').value = cliente.email;
            document.getElementById('telefoneCliente').value = cliente.telefone;
            document.getElementById('tipoCliente').value = cliente.tipo;
            
            if (cliente.tipo === 'cliente') {
                document.getElementById('cpfCliente').value = cliente.cpf || '';
            } else {
                document.getElementById('cargoCliente').value = cliente.cargo || '';
            }
            
            alternarCamposCliente();
        }
    } else {
        titulo.textContent = 'Novo Cliente';
        form.reset();
        document.getElementById('idCliente').value = '';
    }
    
    modal.classList.add('show');
}

function fecharModalCliente() {
    document.getElementById('modalCliente').classList.remove('show');
}

function alternarCamposCliente() {
    const tipo = document.getElementById('tipoCliente').value;
    const camposCliente = document.getElementById('camposCliente');
    const camposFuncionario = document.getElementById('camposFuncionario');
    
    if (tipo === 'cliente') {
        camposCliente.style.display = 'block';
        camposFuncionario.style.display = 'none';
    } else if (tipo === 'funcionario') {
        camposCliente.style.display = 'none';
        camposFuncionario.style.display = 'block';
    } else {
        camposCliente.style.display = 'none';
        camposFuncionario.style.display = 'none';
    }
}

function editarCliente(id) {
    abrirModalCliente(id);
}

function excluirCliente(id) {
    if (confirm('Tem certeza que quer excluir este cliente?')) {
        if (bd.excluir('clientes', id)) {
            mostrarToast('Cliente excluído', 'success');
            carregarClientes();
            atualizarPainel();
        } else {
            mostrarToast('Erro ao excluir cliente', 'error');
        }
    }
}

function configurarBuscaClientes() {
    const caixaBusca = document.getElementById('buscarClientes');
    if (caixaBusca) {
        caixaBusca.addEventListener('input', (e) => {
            const busca = e.target.value;
            const clientes = bd.buscar('clientes', busca, ['nome', 'email', 'telefone']);
            renderizarClientes(clientes);
        });
    }
}

function configurarFiltroTipoCliente() {
    const filtro = document.getElementById('filtroTipoCliente');
    if (filtro) {
        filtro.addEventListener('change', (e) => {
            const tipo = e.target.value;
            const clientes = tipo ? bd.filtrar('clientes', { tipo }) : bd.ler('clientes');
            renderizarClientes(clientes);
        });
    }
}

function renderizarClientes(clientes) {
    const tbody = document.getElementById('tabelaClientes');
    tbody.innerHTML = clientes.map(cliente => `
        <tr>
            <td>${cliente.id}</td>
            <td>${cliente.nome}</td>
            <td>${cliente.email}</td>
            <td>${cliente.telefone}</td>
            <td>
                <span class="status ${cliente.tipo}">
                    ${cliente.tipo === 'cliente' ? 'Cliente' : 'Funcionário'}
                </span>
            </td>
            <td>${cliente.tipo === 'cliente' ? cliente.cpf || '-' : cliente.cargo || '-'}</td>
            <td>
                <span class="status ${cliente.ativo ? 'ativo' : 'inativo'}">
                    ${cliente.ativo ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editarCliente(${cliente.id})">✏️</button>
                    <button class="btn-action btn-delete" onclick="excluirCliente(${cliente.id})">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// pets
function carregarPets() {
    const tbody = document.getElementById('tabelaPets');
    const pets = bd.ler('pets');
    
    tbody.innerHTML = pets.map(pet => {
        const dono = bd.ler('clientes', pet.idTutor);
        return `
            <tr>
                <td>${pet.id}</td>
                <td>${pet.nome}</td>
                <td>${pet.tipo === 'cachorro' ? '🐕' : '🐱'} ${formatarTipo(pet.tipo)}</td>
                <td>${pet.porte || '-'}</td>
                <td>${pet.idade || '-'}</td>
                <td>${dono ? dono.nome : '-'}</td>
                <td>${pet.observacoes || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="editarPet(${pet.id})">✏️</button>
                        <button class="btn-action btn-delete" onclick="excluirPet(${pet.id})">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function abrirModalPet(id = null) {
    mostrarToast('Modal de Pet em desenvolvimento', 'info');
}

function editarPet(id) {
    abrirModalPet(id);
}

function excluirPet(id) {
    if (confirm('Tem certeza que quer excluir este pet?')) {
        if (bd.excluir('pets', id)) {
            mostrarToast('Pet excluído', 'success');
            carregarPets();
        }
    }
}

// servicos
function carregarServicos() {
    const tbody = document.getElementById('tabelaServicos');
    const servicos = bd.ler('servicos');
    
    tbody.innerHTML = servicos.map(servico => `
        <tr>
            <td>${servico.id}</td>
            <td>${servico.nome}</td>
            <td>${servico.descricao || '-'}</td>
            <td>${formatarMoeda(servico.preco)}</td>
            <td>${servico.duracaoMinutos} min</td>
            <td>
                <span class="status ${servico.ativo ? 'ativo' : 'inativo'}">
                    ${servico.ativo ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editarServico(${servico.id})">✏️</button>
                    <button class="btn-action btn-delete" onclick="excluirServico(${servico.id})">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function abrirModalServico(id = null) {
    mostrarToast('Modal de Serviço em desenvolvimento', 'info');
}

function editarServico(id) {
    abrirModalServico(id);
}

function excluirServico(id) {
    if (confirm('Tem certeza que quer excluir este serviço?')) {
        if (bd.excluir('servicos', id)) {
            mostrarToast('Serviço excluído', 'success');
            carregarServicos();
        }
    }
}

// agendamentos
function carregarAgenda() {
    const tbody = document.getElementById('tabelaAgenda');
    tbody.innerHTML = '<tr><td colspan="9">Nenhum agendamento</td></tr>';
}

function abrirModalAgenda() {
    mostrarToast('Modal de Agendamento em desenvolvimento', 'info');
}

// vendas
function carregarVendas() {
    const tbody = document.getElementById('tabelaVendas');
    const vendas = bd.ler('compras');
    
    if (vendas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhuma venda registrada</td></tr>';
        return;
    }
    
    tbody.innerHTML = vendas.map(venda => {
        const cliente = bd.ler('clientes', venda.idUsuario);
        return `
            <tr>
                <td>${venda.id}</td>
                <td>${formatarData(venda.dataCompra)}</td>
                <td>${cliente ? cliente.nome : '-'}</td>
                <td>-</td>
                <td>${formatarMoeda(venda.valorTotal)}</td>
                <td>${venda.formaPagamento || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="verVenda(${venda.id})">👁️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function abrirModalVenda() {
    mostrarToast('Modal de Venda em desenvolvimento', 'info');
}

function verVenda(id) {
    mostrarToast('Visualização de venda em desenvolvimento', 'info');
}

// relatorios
function carregarRelatorios() {
    document.getElementById('saidaRelatorio').innerHTML = '';
}

function gerarRelatorioEstoque() {
    const produtos = bd.ler('produtos');
    const saida = document.getElementById('saidaRelatorio');
    
    const totalProdutos = produtos.length;
    const valorTotal = produtos.reduce((soma, p) => soma + (p.preco * p.estoque), 0);
    const produtosPoucando = produtos.filter(p => p.estoque <= p.estoqueMinimo);
    const produtosSemEstoque = produtos.filter(p => p.estoque === 0);
    
    saida.innerHTML = `
        <h3>📊 Relatório de Estoque - ${formatarData(new Date())}</h3>
        <div style="display: grid; gap: 1rem; margin-top: 1rem;">
            <div>
                <strong>Resumo:</strong>
                <ul>
                    <li>Total de Produtos: ${totalProdutos}</li>
                    <li>Valor Total: ${formatarMoeda(valorTotal)}</li>
                    <li>Estoque Baixo: ${produtosPoucando.length}</li>
                    <li>Sem Estoque: ${produtosSemEstoque.length}</li>
                </ul>
            </div>
            
            ${produtosPoucando.length > 0 ? `
                <div>
                    <strong>⚠️ Produtos com Estoque Baixo:</strong>
                    <table class="tabela-dados" style="margin-top: 0.5rem;">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Atual</th>
                                <th>Mínimo</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${produtosPoucando.map(p => `
                                <tr>
                                    <td>${p.nome}</td>
                                    <td>${p.estoque}</td>
                                    <td>${p.estoqueMinimo}</td>
                                    <td>${formatarMoeda(p.preco)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
        </div>
    `;
    
    mostrarToast('Relatório de estoque gerado', 'success');
}

function gerarRelatorioFinanceiro() {
    const vendas = bd.ler('compras');
    const saida = document.getElementById('saidaRelatorio');
    
    const totalVendas = vendas.length;
    const valorTotal = vendas.reduce((soma, v) => soma + v.valorTotal, 0);
    
    saida.innerHTML = `
        <h3>💰 Relatório Financeiro - ${formatarData(new Date())}</h3>
        <div style="margin-top: 1rem;">
            <strong>Resumo:</strong>
            <ul>
                <li>Total de Vendas: ${totalVendas}</li>
                <li>Valor Total: ${formatarMoeda(valorTotal)}</li>
                <li>Ticket Médio: ${formatarMoeda(valorTotal / (totalVendas || 1))}</li>
            </ul>
        </div>
    `;
    
    mostrarToast('Relatório financeiro gerado', 'success');
}

function gerarRelatorioProdutos() {
    const produtos = bd.ler('produtos');
    const saida = document.getElementById('saidaRelatorio');
    
    const categorias = {};
    produtos.forEach(p => {
        if (!categorias[p.categoria]) {
            categorias[p.categoria] = { count: 0, valor: 0 };
        }
        categorias[p.categoria].count++;
        categorias[p.categoria].valor += p.preco * p.estoque;
    });
    
    saida.innerHTML = `
        <h3>📈 Análise de Produtos - ${formatarData(new Date())}</h3>
        <div style="margin-top: 1rem;">
            <strong>Por Categoria:</strong>
            <table class="tabela-dados" style="margin-top: 0.5rem;">
                <thead>
                    <tr>
                        <th>Categoria</th>
                        <th>Quantidade</th>
                        <th>Valor em Estoque</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(categorias).map(([cat, dados]) => `
                        <tr>
                            <td>${formatarCategoria(cat)}</td>
                            <td>${dados.count}</td>
                            <td>${formatarMoeda(dados.valor)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    mostrarToast('Relatório de produtos gerado', 'success');
}

function gerarRelatorioClientes() {
    const clientes = bd.ler('clientes').filter(u => u.tipo === 'cliente');
    const pets = bd.ler('pets');
    const saida = document.getElementById('saidaRelatorio');
    
    saida.innerHTML = `
        <h3>👥 Relatório de Clientes - ${formatarData(new Date())}</h3>
        <div style="margin-top: 1rem;">
            <strong>Resumo:</strong>
            <ul>
                <li>Total de Clientes: ${clientes.length}</li>
                <li>Total de Pets: ${pets.length}</li>
                <li>Média Pets/Cliente: ${(pets.length / (clientes.length || 1)).toFixed(1)}</li>
            </ul>
        </div>
    `;
    
    mostrarToast('Relatório de clientes gerado', 'success');
}

// configuracoes
function carregarConfig() {
    atualizarStatsSistema();
    
    // carregar configs salvas
    const salvarAuto = localStorage.getItem('salvarAuto') !== 'false';
    const mostrarNotifs = localStorage.getItem('mostrarNotifs') !== 'false';
    const modoEscuro = localStorage.getItem('modoEscuro') === 'true';
    
    document.getElementById('salvarAutomatico').checked = salvarAuto;
    document.getElementById('mostrarNotificacoes').checked = mostrarNotifs;
    document.getElementById('modoEscuro').checked = modoEscuro;
}

function atualizarStatsSistema() {
    const stats = document.getElementById('statsSistema');
    const tamanhoDados = new Blob([JSON.stringify(dadosSistema)]).size;
    
    stats.innerHTML = `
        <p>Tamanho dos dados: ${formatarBytes(tamanhoDados)}</p>
        <p>Última atualização: ${formatarData(new Date())}</p>
        <p>Versão: ${VERSAO_DB}</p>
    `;
}

function exportarTodosDados() {
    const dadosStr = JSON.stringify(dadosSistema, null, 2);
    const dadosUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dadosStr);
    
    const nomeArquivo = `backup_petshop_${formatarDataArquivo(new Date())}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dadosUri);
    linkElement.setAttribute('download', nomeArquivo);
    linkElement.click();
    
    mostrarToast('Dados exportados', 'success');
}

function importarDados() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const arquivo = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = evento => {
            try {
                const dados = JSON.parse(evento.target.result);
                Object.assign(dadosSistema, dados);
                bd.salvarNoStorage();
                mostrarToast('Dados importados', 'success');
                location.reload();
            } catch (erro) {
                mostrarToast('Erro ao importar', 'error');
            }
        };
        
        reader.readAsText(arquivo);
    };
    
    input.click();
}

function limparTodosDados() {
    bd.resetarBanco();
}

function exportarProdutos() {
    const produtos = bd.ler('produtos');
    const dadosStr = JSON.stringify(produtos, null, 2);
    const dadosUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dadosStr);
    
    const nomeArquivo = `produtos_${formatarDataArquivo(new Date())}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dadosUri);
    linkElement.setAttribute('download', nomeArquivo);
    linkElement.click();
    
    mostrarToast('Produtos exportados', 'success');
}

// configurar formularios
function configurarFormularios() {
    // form de produto
    const formProduto = document.getElementById('formProduto');
    if (formProduto) {
        formProduto.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const id = document.getElementById('idProduto').value;
            const dados = {
                nome: document.getElementById('nomeProduto').value,
                categoria: document.getElementById('categoriaProduto').value,
                preco: parseFloat(document.getElementById('precoProduto').value),
                estoque: parseInt(document.getElementById('estoqueProduto').value),
                estoqueMinimo: parseInt(document.getElementById('estoqueMinimo').value),
                descricao: document.getElementById('descricaoProduto').value,
                ativo: document.getElementById('ativoProduto').value === '1'
            };
            
            if (id) {
                bd.atualizar('produtos', id, dados);
                mostrarToast('Produto atualizado', 'success');
            } else {
                bd.criar('produtos', dados);
                mostrarToast('Produto criado', 'success');
            }
            
            fecharModalProduto();
            carregarProdutos();
            atualizarPainel();
        });
    }
    
    // form de cliente
    const formCliente = document.getElementById('formCliente');
    if (formCliente) {
        formCliente.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const id = document.getElementById('idCliente').value;
            const tipo = document.getElementById('tipoCliente').value;
            
            const dados = {
                nome: document.getElementById('nomeCliente').value,
                email: document.getElementById('emailCliente').value,
                telefone: document.getElementById('telefoneCliente').value,
                tipo: tipo,
                ativo: true
            };
            
            if (tipo === 'cliente') {
                dados.cpf = document.getElementById('cpfCliente').value;
            } else {
                dados.cargo = document.getElementById('cargoCliente').value;
            }
            
            if (id) {
                bd.atualizar('clientes', id, dados);
                mostrarToast('Cliente atualizado', 'success');
            } else {
                bd.criar('clientes', dados);
                mostrarToast('Cliente criado', 'success');
            }
            
            fecharModalCliente();
            carregarClientes();
            atualizarPainel();
        });
    }
}

// configurar listeners de config
function configurarListenersConfig() {
    document.getElementById('salvarAutomatico').addEventListener('change', (e) => {
        localStorage.setItem('salvarAuto', e.target.checked);
        mostrarToast('Config salva', 'success');
    });
    
    document.getElementById('mostrarNotificacoes').addEventListener('change', (e) => {
        localStorage.setItem('mostrarNotifs', e.target.checked);
        mostrarToast('Config salva', 'success');
    });
    
    document.getElementById('modoEscuro').addEventListener('change', (e) => {
        localStorage.setItem('modoEscuro', e.target.checked);
        document.body.classList.toggle('modo-escuro', e.target.checked);
        mostrarToast('Config salva', 'success');
    });
}

// funcoes auxiliares
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function formatarData(data) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(data));
}

function formatarDataArquivo(data) {
    return data.toISOString().split('T')[0];
}

function formatarBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const tamanhos = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamanhos[i];
}

function formatarCategoria(categoria) {
    const categorias = {
        'racao': 'Ração',
        'brinquedo': 'Brinquedo',
        'higiene': 'Higiene',
        'acessorio': 'Acessório'
    };
    return categorias[categoria] || categoria;
}

function formatarTipo(tipo) {
    const tipos = {
        'cachorro': 'Cachorro',
        'gato': 'Gato',
        'outro': 'Outro'
    };
    return tipos[tipo] || tipo;
}

function getClasseEstoque(produto) {
    if (produto.estoque === 0) return 'text-danger';
    if (produto.estoque <= produto.estoqueMinimo) return 'text-warning';
    return 'text-success';
}

// sistema de notificacoes
function mostrarToast(mensagem, tipo = 'info') {
    if (localStorage.getItem('mostrarNotifs') === 'false') return;
    
    const container = document.getElementById('containerToast');
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    const icones = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="icone-toast">${icones[tipo]}</span>
        <span class="mensagem-toast">${mensagem}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// modal de confirmacao
function fecharModalConfirmar() {
    document.getElementById('modalConfirmar').classList.remove('show');
}

// paginacao
function paginaAnterior(secao) {
    mostrarToast('Paginação em desenvolvimento', 'info');
}

function proximaPagina(secao) {
    mostrarToast('Paginação em desenvolvimento', 'info');
}

// inicializacao do sistema
document.addEventListener('DOMContentLoaded', () => {
    // verificar modo escuro
    if (localStorage.getItem('modoEscuro') === 'true') {
        document.body.classList.add('modo-escuro');
    }
    
    // configurar forms
    configurarFormularios();
    
    // configurar listeners
    configurarListenersConfig();
    
    // carregar painel inicial
    atualizarPainel();
    
    // mensagem de boas vindas
    mostrarToast('Sistema carregado', 'success');
    
    // salvar automaticamente
    if (localStorage.getItem('salvarAuto') !== 'false') {
        setInterval(() => {
            bd.salvarNoStorage();
        }, 30000); // salva a cada 30 segundos
    }
});

// exportar funcoes globais
window.mostrarAba = mostrarAba;
window.abrirModalProduto = abrirModalProduto;
window.fecharModalProduto = fecharModalProduto;
window.editarProduto = editarProduto;
window.excluirProduto = excluirProduto;
window.abrirModalCliente = abrirModalCliente;
window.fecharModalCliente = fecharModalCliente;
window.alternarCamposCliente = alternarCamposCliente;
window.editarCliente = editarCliente;
window.excluirCliente = excluirCliente;
window.abrirModalPet = abrirModalPet;
window.editarPet = editarPet;
window.excluirPet = excluirPet;
window.abrirModalServico = abrirModalServico;
window.editarServico = editarServico;
window.excluirServico = excluirServico;
window.abrirModalAgenda = abrirModalAgenda;
window.abrirModalVenda = abrirModalVenda;
window.verVenda = verVenda;
window.gerarRelatorioEstoque = gerarRelatorioEstoque;
window.gerarRelatorioFinanceiro = gerarRelatorioFinanceiro;
window.gerarRelatorioProdutos = gerarRelatorioProdutos;
window.gerarRelatorioClientes = gerarRelatorioClientes;
window.exportarTodosDados = exportarTodosDados;
window.importarDados = importarDados;
window.limparTodosDados = limparTodosDados;
window.exportarProdutos = exportarProdutos;
window.fecharModalConfirmar = fecharModalConfirmar;
window.paginaAnterior = paginaAnterior;
window.proximaPagina = proximaPagina;