// Variáveis globais
let currentData = {};
let useLocalData = false; // Usar servidor por padrão

// Detectar ambiente e configurar URLs
const isVercel = window.location.hostname.includes('vercel.app');
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// URL base da API
const API_BASE = isLocal ? './api' : '/api';

console.log(`🌍 Ambiente detectado: ${isVercel ? 'Vercel' : isLocal ? 'Local' : 'Outro'}`);
console.log(`🔗 API Base: ${API_BASE}`);

// Dados mockados para teste sem servidor
const mockData = {
    dashboard: {
        clientes: 4,
        pets: 5,
        agendamentos: 4,
        faturamento: '295,50'
    },
    usuarios: [
        {id: 1, nome: 'Jorlan Lemos Socho', email: 'jorlans@gmail.com', telefone: '12499358', tipo: 'Funcionário', cpf_cargo: 'Dono'},
        {id: 2, nome: 'Maria Oliveira', email: 'mariao@gmail.com', telefone: '11965432109', tipo: 'Cliente', cpf_cargo: '123.456.789-01'},
        {id: 3, nome: 'Bernardo Costa', email: 'bernardoc@gmail.com', telefone: '11954321098', tipo: 'Cliente', cpf_cargo: '987.654.321-02'},
        {id: 4, nome: 'Sofia Lima', email: 'sofial@gmail.com', telefone: '11943210987', tipo: 'Cliente', cpf_cargo: '456.789.123-03'}
    ],
    pets: [
        {id: 1, nome: 'Rex', tipo: '🐕 Cachorro', porte: 'Grande', idade: '3 anos', tutor: 'Maria Oliveira', observacoes: 'Dócil, adora água'},
        {id: 2, nome: 'Luna', tipo: '🐕 Cachorro', porte: 'Médio', idade: '2 anos', tutor: 'Bernardo Costa', observacoes: 'Agitada mas obediente'},
        {id: 3, nome: 'Mimi', tipo: '🐱 Gato', porte: 'Pequeno', idade: '4 anos', tutor: 'Maria Oliveira', observacoes: 'Tímida, não gosta de barulho'},
        {id: 4, nome: 'Thor', tipo: '🐕 Cachorro', porte: 'Grande', idade: '5 anos', tutor: 'Sofia Lima', observacoes: 'Calmo e protetor'},
        {id: 5, nome: 'Mel', tipo: '🐱 Gato', porte: 'Pequeno', idade: '1 ano', tutor: 'Bernardo Costa', observacoes: 'Brincalhona e carinhosa'}
    ],
    agendamentos: [
        {id: 1, data: '10/06/2025', horario: '09:00-10:00', pet: 'Rex', cliente: 'Maria Oliveira', status: 'Concluído', valor: 'R$ 70,00', observacoes: 'Comportado no banho'},
        {id: 2, data: '10/06/2025', horario: '14:00-14:45', pet: 'Luna', cliente: 'Bernardo Costa', status: 'Concluído', valor: 'R$ 50,00', observacoes: 'Tosa urgente'},
        {id: 3, data: '12/06/2025', horario: '10:00-10:15', pet: 'Mimi', cliente: 'Maria Oliveira', status: 'Agendado', valor: 'R$ 15,00', observacoes: 'Fica nervosa, ter paciência'},
        {id: 4, data: '15/06/2025', horario: '16:00-17:00', pet: 'Thor', cliente: 'Sofia Lima', status: 'Agendado', valor: 'R$ 45,00', observacoes: 'Gosta de carinho'}
    ],
    servicos: [
        {id: 1, nome: 'Banho Completo', descricao: 'Banho com shampoo e secagem', preco: 'R$ 45,00', duracao: '60 min', status: 'Ativo'},
        {id: 2, nome: 'Tosa Simples', descricao: 'Corte básico de pelos', preco: 'R$ 35,00', duracao: '45 min', status: 'Ativo'},
        {id: 3, nome: 'Corte de Unhas', descricao: 'Corte seguro das unhas', preco: 'R$ 15,00', duracao: '15 min', status: 'Ativo'},
        {id: 4, nome: 'Hidratação', descricao: 'Tratamento hidratante', preco: 'R$ 25,00', duracao: '30 min', status: 'Ativo'}
    ],
    produtos: [
        {id: 1, nome: 'Ração Premium Cães 15kg', categoria: 'Ração', preco: 'R$ 89,90', estoque: 25, status: 'OK'},
        {id: 2, nome: 'Ração Gatos 3kg', categoria: 'Ração', preco: 'R$ 45,90', estoque: 18, status: 'OK'},
        {id: 3, nome: 'Shampoo Neutro 500ml', categoria: 'Higiene', preco: 'R$ 25,50', estoque: 15, status: 'OK'},
        {id: 4, nome: 'Bola de Tênis', categoria: 'Brinquedo', preco: 'R$ 12,90', estoque: 30, status: 'OK'},
        {id: 5, nome: 'Coleira Ajustável M', categoria: 'Acessório', preco: 'R$ 18,90', estoque: 20, status: 'OK'},
        {id: 6, nome: 'Brinquedo Ratinho', categoria: 'Brinquedo', preco: 'R$ 8,50', estoque: 25, status: 'OK'}
    ],
    vendas: [
        {id: 1, cliente: 'Maria Oliveira', data: '31/05/2025', valor: 'R$ 140,90', pagamento: 'PIX', itens: 'Ração Premium (1x), Shampoo (2x)'},
        {id: 2, cliente: 'Bernardo Costa', data: '31/05/2025', valor: 'R$ 84,60', pagamento: 'Cartão', itens: 'Ração Gatos (1x), Ratinho (2x), Coleira (1x)'}
    ],
    carrinho: [
        {id: 1, cliente: 'Maria Oliveira', telefone: '11965432109', valor: 'R$ 140,90', produtos: 'Ração Premium (1x), Shampoo (2x)', status: 'Pendente'},
        {id: 2, cliente: 'Bernardo Costa', telefone: '11954321098', valor: 'R$ 84,60', produtos: 'Ração Gatos (1x), Bola Tênis (3x)', status: 'Pendente'}
    ]
};

// Carregar dados (servidor ou mock)
async function loadData(section) {
    try {
        showLoading(section);
        
        let data;
        
        if (useLocalData) {
            // Simular delay de rede
            await new Promise(resolve => setTimeout(resolve, 500));
            data = mockData[section];
        } else {
            // Buscar do servidor
            const url = `${API_BASE}/api.php?action=${section}`;
            console.log(`📡 Buscando: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const text = await response.text();
            
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Resposta não é JSON válido:', text);
                throw new Error('Resposta inválida do servidor');
            }
            
            if (data.error) {
                throw new Error(data.error);
            }
        }
        
        currentData[section] = data;
        renderSection(section, data);
        hideLoading(section);
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        
        // Se falhar servidor, usar dados mockados
        if (!useLocalData) {
            console.log('🔄 Servidor indisponível, usando dados demo...');
            useLocalData = true;
            showAlert('⚠️ Servidor indisponível, usando dados demo');
            loadData(section);
            return;
        }
        
        showError(section, error.message);
    }
}

// Renderizar seções
function renderSection(section, data) {
    switch (section) {
        case 'dashboard':
            renderDashboard(data);
            break;
        case 'usuarios':
            renderTable('usuarios', data, ['id', 'nome', 'email', 'telefone', 'tipo', 'cpf_cargo']);
            break;
        case 'pets':
            renderTable('pets', data, ['id', 'nome', 'tipo', 'porte', 'idade', 'tutor', 'observacoes']);
            break;
        case 'agendamentos':
            renderTable('agendamentos', data, ['id', 'data', 'horario', 'pet', 'cliente', 'status', 'valor', 'observacoes']);
            break;
        case 'servicos':
            renderTable('servicos', data, ['id', 'nome', 'descricao', 'preco', 'duracao', 'status']);
            break;
        case 'produtos':
            renderTable('produtos', data, ['id', 'nome', 'categoria', 'preco', 'estoque', 'status']);
            break;
        case 'vendas':
            renderTable('vendas', data, ['id', 'cliente', 'data', 'valor', 'pagamento', 'itens']);
            break;
        case 'carrinho':
            renderTable('carrinho', data, ['id', 'cliente', 'telefone', 'valor', 'produtos', 'status']);
            break;
    }
}

// Renderizar dashboard
function renderDashboard(data) {
    const cards = document.querySelectorAll('.stat-number');
    if (cards.length >= 4) {
        cards[0].textContent = data.clientes;
        cards[1].textContent = data.pets;
        cards[2].textContent = data.agendamentos;
        cards[3].textContent = `R$ ${data.faturamento}`;
    }
}

// Renderizar tabelas
function renderTable(section, data, columns) {
    const tbody = document.querySelector(`#${section} tbody`);
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    data.forEach(row => {
        const tr = document.createElement('tr');
        
        columns.forEach(col => {
            const td = document.createElement('td');
            let value = row[col] || '';
            
            // Aplicar classes de status
            if (col === 'status' || col === 'tipo') {
                value = `<span class="status ${getStatusClass(value)}">${value}</span>`;
            }
            
            td.innerHTML = value;
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
}

// Obter classe CSS para status
function getStatusClass(status) {
    const statusMap = {
        'Agendado': 'agendado',
        'Concluído': 'concluido',
        'Feito': 'concluido',
        'Cancelado': 'cancelado',
        'Cliente': 'cliente',
        'Funcionário': 'funcionario',
        'Ativo': 'concluido',
        'Disponível': 'concluido',
        'Pendente': 'agendado',
        'OK': 'concluido'
    };
    
    return statusMap[status] || 'agendado';
}

// Mostrar loading
function showLoading(section) {
    const container = document.querySelector(`#${section} .table-container`);
    if (container) {
        container.style.opacity = '0.5';
        container.style.pointerEvents = 'none';
    }
}

// Esconder loading
function hideLoading(section) {
    const container = document.querySelector(`#${section} .table-container`);
    if (container) {
        container.style.opacity = '1';
        container.style.pointerEvents = 'auto';
    }
}

// Mostrar erro
function showError(section, message) {
    hideLoading(section);
    showAlert(`❌ Erro ao carregar ${section}: ${message}`);
}

// Trocar de aba e carregar dados
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const navTabs = document.querySelectorAll('.nav-tab');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    navTabs.forEach(tab => tab.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // Carregar dados da aba
    loadData(tabName);
}

// Atualizar dados
function refreshData() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '🔄 Carregando...';
    btn.disabled = true;

    // Descobrir qual aba está ativa
    const activeTab = document.querySelector('.tab-content.active');
    const section = activeTab ? activeTab.id : 'dashboard';

    loadData(section).finally(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        updateTimestamp();
        showAlert('✅ Dados atualizados!');
    });
}

// Atualizar horário
function updateTimestamp() {
    const now = new Date();
    const time = now.toLocaleString('pt-BR');
    const timestampEl = document.getElementById('lastUpdate');
    if (timestampEl) {
        timestampEl.textContent = time;
    }
}

// Mostrar alerta
function showAlert(message) {
    const alert = document.createElement('div');
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2c3e50;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: 500;
        border-left: 3px solid #f39c12;
    `;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Busca nas tabelas
function setupSearch() {
    const searchBoxes = document.querySelectorAll('[id^="search"]');
    
    searchBoxes.forEach(box => {
        box.addEventListener('input', function() {
            const term = this.value.toLowerCase();
            const tabName = this.id.replace('search', '').toLowerCase();
            const table = document.querySelector(`#${tabName} tbody`);
            
            if (table) {
                const rows = table.querySelectorAll('tr');
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(term) ? '' : 'none';
                });
            }
        });
    });
}

// Efeitos hover
function setupHoverEffects() {
    document.addEventListener('mouseover', function(e) {
        if (e.target.classList.contains('stat-card')) {
            e.target.style.transform = 'translateY(-3px) scale(1.02)';
        }
    });

    document.addEventListener('mouseout', function(e) {
        if (e.target.classList.contains('stat-card')) {
            e.target.style.transform = 'translateY(0) scale(1)';
        }
    });
}

// Alternar entre servidor e dados locais
function toggleDataSource() {
    useLocalData = !useLocalData;
    const status = useLocalData ? 'dados demo' : 'servidor';
    showAlert(`🔄 Usando ${status}`);
    
    // Recarregar aba atual
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        loadData(activeTab.id);
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    updateTimestamp();
    setupSearch();
    setupHoverEffects();
    
    // Mostrar status inicial
    if (useLocalData) {
        setTimeout(() => {
            showAlert('📋 Usando dados demo. Configure banco para dados reais.');
        }, 1000);
    } else {
        setTimeout(() => {
            showAlert('🔄 Conectando ao servidor...');
        }, 500);
    }
    
    // Carregar dashboard inicial
    loadData('dashboard');
    
    // Auto-refresh a cada 5 minutos
    setInterval(() => {
        updateTimestamp();
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            loadData(activeTab.id);
        }
    }, 300000);
    
    const dataSource = useLocalData ? 'dados demo' : 'servidor conectado';
    const environment = isVercel ? 'Vercel' : isLocal ? 'Local' : 'Produção';
    console.log(`🐾 Patas Du Jojo Admin - ${dataSource} (${environment}) em ${new Date().toLocaleString('pt-BR')}`);
});