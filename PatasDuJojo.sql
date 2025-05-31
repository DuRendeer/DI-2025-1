CREATE DATABASE IF NOT EXISTS petshop_vida_animal;
USE petshop_vida_animal;

-- Limpeza
DROP TABLE IF EXISTS item_carrinho;
DROP TABLE IF EXISTS item_compra;
DROP TABLE IF EXISTS agendamento_servico;
DROP TABLE IF EXISTS agendamento;
DROP TABLE IF EXISTS carrinho;
DROP TABLE IF EXISTS compra;
DROP TABLE IF EXISTS endereco;
DROP TABLE IF EXISTS pet;
DROP TABLE IF EXISTS produto;
DROP TABLE IF EXISTS servico;
DROP TABLE IF EXISTS usuario;

-- Pessoas do petshop
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    tipo ENUM('cliente', 'funcionario') NOT NULL DEFAULT 'cliente',
    
    -- Cliente
    cpf VARCHAR(14) UNIQUE,
    
    -- Funcionário
    cargo VARCHAR(50)
);

-- Endereços
CREATE TABLE endereco (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNIQUE,
    rua VARCHAR(150) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    bairro VARCHAR(80) NOT NULL,
    cidade VARCHAR(80) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Nossos pets
CREATE TABLE pet (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    tipo ENUM('cachorro', 'gato', 'outro') NOT NULL,
    porte ENUM('pequeno', 'medio', 'grande'),
    idade VARCHAR(20),
    observacoes TEXT,
    id_tutor INT NOT NULL,
    
    FOREIGN KEY (id_tutor) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Serviços oferecidos
CREATE TABLE servico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    duracao_minutos INT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    
    CHECK (preco > 0)
);

-- Produtos vendidos
CREATE TABLE produto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria ENUM('racao', 'brinquedo', 'higiene', 'acessorio') NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    estoque INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    
    CHECK (preco > 0 AND estoque >= 0)
);

-- Agendamentos
CREATE TABLE agendamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_agendamento DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    id_pet INT NOT NULL,
    id_funcionario INT,
    status ENUM('agendado', 'concluido', 'cancelado') DEFAULT 'agendado',
    valor_total DECIMAL(10,2) DEFAULT 0.00,
    observacoes TEXT,
    
    FOREIGN KEY (id_pet) REFERENCES pet(id) ON DELETE CASCADE,
    FOREIGN KEY (id_funcionario) REFERENCES usuario(id)
);

-- Carrinho de compras
CREATE TABLE carrinho (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNIQUE NOT NULL,
    valor_total DECIMAL(10,2) DEFAULT 0.00,
    
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Compras finalizadas
CREATE TABLE compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    data_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(10,2) NOT NULL,
    forma_pagamento ENUM('dinheiro', 'pix', 'cartao') NOT NULL,
    
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Relacionamentos
CREATE TABLE agendamento_servico (
    id_agendamento INT,
    id_servico INT,
    preco_cobrado DECIMAL(8,2) NOT NULL,
    
    PRIMARY KEY (id_agendamento, id_servico),
    FOREIGN KEY (id_agendamento) REFERENCES agendamento(id) ON DELETE CASCADE,
    FOREIGN KEY (id_servico) REFERENCES servico(id) ON DELETE CASCADE
);

CREATE TABLE item_carrinho (
    id_carrinho INT,
    id_produto INT,
    quantidade INT NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,
    
    PRIMARY KEY (id_carrinho, id_produto),
    FOREIGN KEY (id_carrinho) REFERENCES carrinho(id) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produto(id) ON DELETE CASCADE
);

CREATE TABLE item_compra (
    id_compra INT,
    id_produto INT,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    
    PRIMARY KEY (id_compra, id_produto),
    FOREIGN KEY (id_compra) REFERENCES compra(id) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produto(id) ON DELETE CASCADE
);

-- TRIGGERS
DELIMITER //
CREATE TRIGGER tr_criar_carrinho
    AFTER INSERT ON usuario
    FOR EACH ROW
BEGIN
    IF NEW.tipo = 'cliente' THEN
        INSERT INTO carrinho (id_usuario) VALUES (NEW.id);
    END IF;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER tr_atualizar_carrinho
    AFTER INSERT ON item_carrinho
    FOR EACH ROW
BEGIN
    UPDATE carrinho 
    SET valor_total = (
        SELECT COALESCE(SUM(quantidade * preco_unitario), 0)
        FROM item_carrinho 
        WHERE id_carrinho = NEW.id_carrinho
    )
    WHERE id = NEW.id_carrinho;
END //
DELIMITER ;

-- DADOS DE EXEMPLO

-- Funcionários
INSERT INTO usuario (nome, email, telefone, tipo, cargo) VALUES
('Jorlan Lemos Socho', 'jorlans@gmail.com', '12499358', 'funcionario', 'Dono');

-- Clientes
INSERT INTO usuario (nome, email, telefone, tipo, cpf) VALUES
('Maria Oliveira', 'mariao@gmail.com', '11965432109', 'cliente', '123.456.789-01'),
('Bernardo Costa', 'bernardoc@gmail.com', '11954321098', 'cliente', '987.654.321-02'),
('Sofia Lima', 'sofial@gmail.com', '11943210987', 'cliente', '456.789.123-03');

-- Endereços
INSERT INTO endereco (id_usuario, rua, numero, bairro, cidade, cep) VALUES
(2, 'Rua das Flores', '123', 'Centro', 'São Paulo', '01234-567'),
(3, 'Av. Paulista', '456', 'Vila Madalena', 'São Paulo', '05414-002'),
(4, 'Rua Augusta', '789', 'Consolação', 'São Paulo', '01305-100');

-- Pets
INSERT INTO pet (nome, tipo, porte, idade, observacoes, id_tutor) VALUES
('Rex', 'cachorro', 'grande', '3 anos', 'Muito dócil, adora água', 2),
('Luna', 'cachorro', 'medio', '2 anos', 'Agitada mas obediente', 3),
('Mimi', 'gato', 'pequeno', '4 anos', 'Tímida, não gosta de barulho', 2),
('Thor', 'cachorro', 'grande', '5 anos', 'Calmo e protetor', 4),
('Mel', 'gato', 'pequeno', '1 ano', 'Brincalhona e carinhosa', 3);

-- Serviços
INSERT INTO servico (nome, descricao, preco, duracao_minutos) VALUES
('Banho Completo', 'Banho com shampoo e secagem', 45.00, 60),
('Tosa Simples', 'Corte básico de pelos', 35.00, 45),
('Corte de Unhas', 'Corte seguro das unhas', 15.00, 15),
('Hidratação', 'Tratamento hidratante para pelos', 25.00, 30);

-- Produtos
INSERT INTO produto (nome, categoria, preco, estoque) VALUES
('Ração Premium Cães 15kg', 'racao', 89.90, 25),
('Ração Gatos 3kg', 'racao', 45.90, 18),
('Shampoo Neutro 500ml', 'higiene', 25.50, 15),
('Bola de Tênis', 'brinquedo', 12.90, 30),
('Coleira Ajustável M', 'acessorio', 18.90, 20),
('Brinquedo Ratinho', 'brinquedo', 8.50, 25);

-- Agendamentos
INSERT INTO agendamento (data_agendamento, hora_inicio, hora_fim, id_pet, id_funcionario, status, observacoes) VALUES
('2025-06-10', '09:00:00', '10:00:00', 1, 1, 'concluido', 'Rex muito comportado durante o banho'),
('2025-06-10', '14:00:00', '14:45:00', 2, 1, 'concluido', 'Luna precisava de tosa urgente'),
('2025-06-12', '10:00:00', '10:15:00', 3, 1, 'agendado', 'Mimi fica nervosa, ter paciência'),
('2025-06-15', '16:00:00', '17:00:00', 4, 1, 'agendado', 'Thor gosta de carinho durante o banho');

-- Serviços dos agendamentos
INSERT INTO agendamento_servico (id_agendamento, id_servico, preco_cobrado) VALUES
(1, 1, 45.00),
(1, 4, 25.00),
(2, 2, 35.00),
(2, 3, 15.00),
(3, 3, 15.00),
(4, 1, 45.00);

-- Atualizar valor total dos agendamentos
UPDATE agendamento a 
SET valor_total = (
    SELECT SUM(preco_cobrado) 
    FROM agendamento_servico 
    WHERE id_agendamento = a.id
) 
WHERE id IN (1, 2, 3, 4);

-- Itens no carrinho
INSERT INTO item_carrinho (id_carrinho, id_produto, quantidade, preco_unitario) VALUES
(1, 1, 1, 89.90),
(1, 3, 2, 25.50),
(2, 2, 1, 45.90),
(2, 4, 3, 12.90);

-- Compras finalizadas
INSERT INTO compra (id_usuario, valor_total, forma_pagamento) VALUES
(2, 140.90, 'pix'),
(3, 84.60, 'cartao');

INSERT INTO item_compra (id_compra, id_produto, quantidade, preco_unitario) VALUES
(1, 1, 1, 89.90),
(1, 3, 2, 25.50),
(2, 2, 1, 45.90),
(2, 6, 2, 8.50),
(2, 5, 1, 18.90);

-- VIEWS ÚTEIS

-- Agenda do dia
CREATE VIEW vw_agenda_hoje AS
SELECT 
    TIME_FORMAT(a.hora_inicio, '%H:%i') AS horario,
    p.nome AS pet,
    p.tipo,
    u.nome AS cliente,
    u.telefone,
    f.nome AS funcionario,
    GROUP_CONCAT(s.nome SEPARATOR ', ') AS servicos,
    a.valor_total AS valor,
    a.status,
    a.observacoes
FROM agendamento a
    INNER JOIN pet p ON a.id_pet = p.id
    INNER JOIN usuario u ON p.id_tutor = u.id
    LEFT JOIN usuario f ON a.id_funcionario = f.id
    LEFT JOIN agendamento_servico aserv ON a.id = aserv.id_agendamento
    LEFT JOIN servico s ON aserv.id_servico = s.id
WHERE a.data_agendamento = CURDATE()
GROUP BY a.id
ORDER BY a.hora_inicio;

-- Carrinho dos clientes
CREATE VIEW vw_carrinho_clientes AS
SELECT 
    u.nome AS cliente,
    u.telefone,
    c.valor_total AS total_carrinho,
    GROUP_CONCAT(CONCAT(pr.nome, ' (', ic.quantidade, 'x)') SEPARATOR ', ') AS produtos
FROM carrinho c
    INNER JOIN usuario u ON c.id_usuario = u.id
    LEFT JOIN item_carrinho ic ON c.id = ic.id_carrinho
    LEFT JOIN produto pr ON ic.id_produto = pr.id
WHERE c.valor_total > 0
GROUP BY c.id
ORDER BY c.valor_total DESC;

-- Estoque baixo
CREATE VIEW vw_estoque_baixo AS
SELECT 
    nome AS produto,
    categoria,
    estoque,
    preco,
    CASE 
        WHEN estoque = 0 THEN 'SEM ESTOQUE'
        WHEN estoque <= 5 THEN 'ESTOQUE BAIXO'
        WHEN estoque <= 10 THEN 'ATENÇÃO'
        ELSE 'OK'
    END AS situacao
FROM produto
WHERE estoque <= 15
ORDER BY estoque, categoria;

-- Pets por cliente
CREATE VIEW vw_pets_clientes AS
SELECT 
    u.nome AS cliente,
    u.telefone,
    COUNT(p.id) AS total_pets,
    GROUP_CONCAT(CONCAT(p.nome, ' (', p.tipo, ')') SEPARATOR ', ') AS pets
FROM usuario u
    LEFT JOIN pet p ON u.id = p.id_tutor
WHERE u.tipo = 'cliente'
GROUP BY u.id
ORDER BY total_pets DESC, u.nome;

-- Faturamento mensal
CREATE VIEW vw_faturamento_mes AS
SELECT 
    DATE_FORMAT(a.data_agendamento, '%Y-%m') AS mes,
    COUNT(a.id) AS total_agendamentos,
    SUM(a.valor_total) AS faturamento_agendamentos,
    (SELECT COALESCE(SUM(c.valor_total), 0) 
     FROM compra c 
     WHERE DATE_FORMAT(c.data_compra, '%Y-%m') = DATE_FORMAT(a.data_agendamento, '%Y-%m')) AS faturamento_vendas,
    (SUM(a.valor_total) + 
     (SELECT COALESCE(SUM(c.valor_total), 0) 
      FROM compra c 
      WHERE DATE_FORMAT(c.data_compra, '%Y-%m') = DATE_FORMAT(a.data_agendamento, '%Y-%m'))) AS faturamento_total
FROM agendamento a
WHERE a.status = 'concluido'
GROUP BY DATE_FORMAT(a.data_agendamento, '%Y-%m')
ORDER BY mes DESC;

SELECT 'Patas Du Jojo criado com sucesso!' AS resultado;

