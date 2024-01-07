-- formulario.formulario definition

CREATE TABLE `formulario` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Nome` varchar(100) DEFAULT NULL,
  -- `Passaporte` bigint(20) DEFAULT NULL,
  `idDiscord` varchar(100) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `dataEnvio` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- formulario.blacklist definition

CREATE TABLE `blacklist` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `member_name` varchar(100) DEFAULT NULL,
  `discordId` bigint(20) DEFAULT NULL,
  `motivo_inclusao` varchar(255) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `adicionado_por` bigint(20) DEFAULT NULL,
  `nome_adicionado_por` varchar(100) DEFAULT NULL,
  `data_inclusao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- formulario.hststatus definition

CREATE TABLE `hststatus` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `idFormulario` bigint(20) DEFAULT NULL,
  `discordAprovador` varchar(100) DEFAULT NULL,
  `Status` varchar(100) DEFAULT NULL,
  `DataAvaliacao` datetime DEFAULT NULL,
  `Motivo` varchar(5000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hstStatus_FK` (`idFormulario`),
  CONSTRAINT `hstStatus_FK` FOREIGN KEY (`idFormulario`) REFERENCES `formulario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `alteracoes_nome` (
	`id` BIGINT(20) NOT NULL AUTO_INCREMENT,
	`discordId` BIGINT(20) NOT NULL,
	`nomeAnterior` VARCHAR(100) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`nomeNovo` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_general_ci',
	`dataAlteracao` DATETIME NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;

------------------------------------------------------------
CREATE TABLE ServerSettings (
    server_id VARCHAR(255) PRIMARY KEY,
    server_name VARCHAR(255),
    welcome_channel_id VARCHAR(255),
    rules_channel_id VARCHAR(255),
    logChannelId VARCHAR(255),
    admin_role_id VARCHAR(255)
    -- Adicione outras configurações conforme necessário
);

CREATE TABLE ServerRoles (
    server_id VARCHAR(255),
    role_id VARCHAR(255),
    role_name VARCHAR(255),
    -- Adicione outras colunas conforme necessário
    PRIMARY KEY (server_id, role_id)
);
------------------------------------------------------------