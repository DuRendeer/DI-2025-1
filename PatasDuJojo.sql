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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT NOT NULL,
    tipo TEXT NOT NULL, -- cliente ou funcionario
    cpf TEXT UNIQUE, -- Cliente
    cargo TEXT -- Funcionário
);

-- Endereços
CREATE TABLE endereco (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER UNIQUE,
    rua TEXT NOT NULL,
    numero TEXT NOT NULL,
    bairro TEXT NOT NULL,
    cidade TEXT NOT NULL,
    cep TEXT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Nossos pets
CREATE TABLE pet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL, -- cachorro, gato, outro
    porte TEXT, -- pequeno, medio, grande
    idade TEXT,
    observacoes TEXT,
    id_tutor INTEGER NOT NULL,
    FOREIGN KEY (id_tutor) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Serviços oferecidos
CREATE TABLE servico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco REAL NOT NULL,
    duracao_minutos INTEGER NOT NULL,
    ativo BOOLEAN DEFAULT 1
);

-- Produtos vendidos
CREATE TABLE produto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL, -- racao, brinquedo, higiene, acessorio
    preco REAL NOT NULL,
    estoque INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT 1
);

-- Agendamentos
CREATE TABLE agendamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data_agendamento TEXT NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fim TEXT NOT NULL,
    id_pet INTEGER NOT NULL,
    id_funcionario INTEGER,
    status TEXT DEFAULT 'agendado', -- agendado, concluido, cancelado
    valor_total REAL DEFAULT 0.00,
    observacoes TEXT,
    FOREIGN KEY (id_pet) REFERENCES pet(id) ON DELETE CASCADE,
    FOREIGN KEY (id_funcionario) REFERENCES usuario(id)
);

-- Carrinho de compras
CREATE TABLE carrinho (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER UNIQUE NOT NULL,
    valor_total REAL DEFAULT 0.00,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Compras finalizadas
CREATE TABLE compra (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    data_compra TEXT DEFAULT CURRENT_TIMESTAMP,
    valor_total REAL NOT NULL,
    forma_pagamento TEXT NOT NULL, -- dinheiro, pix, cartao
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Relacionamentos
CREATE TABLE agendamento_servico (
    id_agendamento INTEGER,
    id_servico INTEGER,
    preco_cobrado REAL NOT NULL,
    PRIMARY KEY (id_agendamento, id_servico),
    FOREIGN KEY (id_agendamento) REFERENCES agendamento(id) ON DELETE CASCADE,
    FOREIGN KEY (id_servico) REFERENCES servico(id) ON DELETE CASCADE
);

CREATE TABLE item_carrinho (
    id_carrinho INTEGER,
    id_produto INTEGER,
    quantidade INTEGER NOT NULL DEFAULT 1,
    preco_unitario REAL NOT NULL,
    PRIMARY KEY (id_carrinho, id_produto),
    FOREIGN KEY (id_carrinho) REFERENCES carrinho(id) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produto(id) ON DELETE CASCADE
);

CREATE TABLE item_compra (
    id_compra INTEGER,
    id_produto INTEGER,
    quantidade INTEGER NOT NULL,
    preco_unitario REAL NOT NULL,
    PRIMARY KEY (id_compra, id_produto),
    FOREIGN KEY (id_compra) REFERENCES compra(id) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produto(id) ON DELETE CASCADE
);

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

-- Criar carrinhos (substituindo trigger)
INSERT INTO carrinho (id_usuario) VALUES (2), (3), (4);

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
UPDATE agendamento SET valor_total = (
    SELECT SUM(preco_cobrado)
    FROM agendamento_servico
    WHERE id_agendamento = agendamento.id
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
