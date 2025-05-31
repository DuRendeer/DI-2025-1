// Variáveis globais
let currentData = {};

// Carregar dados do servidor
async function loadData(section) {
    try {
        showLoading(section);
        const response = await fetch(`api.php?action=${section}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        currentData[section] = data;
        renderSection(section, data);
        hideLoading(section);
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
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

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    updateTimestamp();
    setupSearch();
    setupHoverEffects();
    
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
    
    console.log(`🐾 Patas Du Jojo Admin - Conectado ao banco em ${new Date().toLocaleString('pt-BR')}`);
});