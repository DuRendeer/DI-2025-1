<?php
require_once 'config.php';

// Pegar a ação da URL
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'dashboard':
            getDashboardStats();
            break;
        case 'usuarios':
            getUsuarios();
            break;
        case 'pets':
            getPets();
            break;
        case 'agendamentos':
            getAgendamentos();
            break;
        case 'servicos':
            getServicos();
            break;
        case 'produtos':
            getProdutos();
            break;
        case 'vendas':
            getVendas();
            break;
        case 'carrinho':
            getCarrinhos();
            break;
        default:
            echo json_encode(['error' => 'Ação não encontrada']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

// Buscar estatísticas do dashboard
function getDashboardStats() {
    global $pdo;
    
    // Contar usuários clientes
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuario WHERE tipo = 'cliente'");
    $clientes = $stmt->fetch()['total'];
    
    // Contar pets
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM pet");
    $pets = $stmt->fetch()['total'];
    
    // Contar agendamentos
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM agendamento");
    $agendamentos = $stmt->fetch()['total'];
    
    // Calcular faturamento (agendamentos concluídos + vendas)
    $stmt = $pdo->query("
        SELECT 
            COALESCE(SUM(a.valor_total), 0) as agendamentos,
            COALESCE((SELECT SUM(valor_total) FROM compra), 0) as vendas
        FROM agendamento a 
        WHERE a.status = 'concluido'
    ");
    $faturamento = $stmt->fetch();
    $totalFaturamento = $faturamento['agendamentos'] + $faturamento['vendas'];
    
    echo json_encode([
        'clientes' => $clientes,
        'pets' => $pets,
        'agendamentos' => $agendamentos,
        'faturamento' => number_format($totalFaturamento, 2, ',', '.')
    ]);
}

// Buscar usuários
function getUsuarios() {
    global $pdo;
    
    $stmt = $pdo->query("
        SELECT 
            id,
            nome,
            email,
            telefone,
            tipo,
            CASE 
                WHEN tipo = 'cliente' THEN cpf 
                ELSE cargo 
            END as cpf_cargo
        FROM usuario
        ORDER BY nome
    ");
    
    echo json_encode($stmt->fetchAll());
}

// Buscar pets com nome do tutor
function getPets() {
    global $pdo;
    
    $stmt = $pdo->query("
        SELECT 
            p.id,
            p.nome,
            p.tipo,
            p.porte,
            p.idade,
            u.nome as tutor,
            p.observacoes
        FROM pet p
        INNER JOIN usuario u ON p.id_tutor = u.id
        ORDER BY p.nome
    ");
    
    echo json_encode($stmt->fetchAll());
}

// Buscar agendamentos
function getAgendamentos() {
    global $pdo;
    
    $stmt = $pdo->query("
        SELECT 
            a.id,
            DATE_FORMAT(a.data_agendamento, '%d/%m/%Y') as data,
            CONCAT(TIME_FORMAT(a.hora_inicio, '%H:%i'), '-', TIME_FORMAT(a.hora_fim, '%H:%i')) as horario,
            p.nome as pet,
            u.nome as cliente,
            f.nome as funcionario,
            a.status,
            CONCAT('R$ ', FORMAT(a.valor_total, 2, 'de_DE')) as valor,
            a.observacoes
        FROM agendamento a
        INNER JOIN pet p ON a.id_pet = p.id
        INNER JOIN usuario u ON p.id_tutor = u.id
        LEFT JOIN usuario f ON a.id_funcionario = f.id
        ORDER BY a.data_agendamento DESC, a.hora_inicio
    ");
    
    echo json_encode($stmt->fetchAll());
}

// Buscar serviços
function getServicos() {
    global $pdo;
    
    $stmt = $pdo->query("
        SELECT 
            id,
            nome,
            descricao,
            CONCAT('R$ ', FORMAT(preco, 2, 'de_DE')) as preco,
            CONCAT(duracao_minutos, ' min') as duracao,
            CASE WHEN ativo = 1 THEN 'Ativo' ELSE 'Inativo' END as status
        FROM servico
        ORDER BY nome
    ");
    
    echo json_encode($stmt->fetchAll());
}

// Buscar produtos
function getProdutos() {
    global $pdo;
    
    $stmt = $pdo->query("
        SELECT 
            id,
            nome,
            categoria,
            CONCAT('R$ ', FORMAT(preco, 2, 'de_DE')) as preco,
            estoque,
            CASE WHEN ativo = 1 THEN 'Disponível' ELSE 'Inativo' END as status
        FROM produto
        ORDER BY nome
    ");
    
    echo json_encode($stmt->fetchAll());
}

// Buscar vendas
function getVendas() {
    global $pdo;
    
    $stmt = $pdo->query("
        SELECT 
            c.id,
            u.nome as cliente,
            DATE_FORMAT(c.data_compra, '%d/%m/%Y') as data,
            CONCAT('R$ ', FORMAT(c.valor_total, 2, 'de_DE')) as valor,
            c.forma_pagamento as pagamento,
            GROUP_CONCAT(CONCAT(p.nome, ' (', ic.quantidade, 'x)') SEPARATOR ', ') as itens
        FROM compra c
        INNER JOIN usuario u ON c.id_usuario = u.id
        LEFT JOIN item_compra ic ON c.id = ic.id_compra
        LEFT JOIN produto p ON ic.id_produto = p.id
        GROUP BY c.id
        ORDER BY c.data_compra DESC
    ");
    
    echo json_encode($stmt->fetchAll());
}

// Buscar carrinhos
function getCarrinhos() {
    global $pdo;
    
    $stmt = $pdo->query("
        SELECT 
            car.id,
            u.nome as cliente,
            u.telefone,
            CONCAT('R$ ', FORMAT(car.valor_total, 2, 'de_DE')) as valor,
            GROUP_CONCAT(CONCAT(p.nome, ' (', ic.quantidade, 'x)') SEPARATOR ', ') as produtos,
            'Pendente' as status
        FROM carrinho car
        INNER JOIN usuario u ON car.id_usuario = u.id
        LEFT JOIN item_carrinho ic ON car.id = ic.id_carrinho
        LEFT JOIN produto p ON ic.id_produto = p.id
        WHERE car.valor_total > 0
        GROUP BY car.id
        ORDER BY car.valor_total DESC
    ");
    
    echo json_encode($stmt->fetchAll());
}
?>