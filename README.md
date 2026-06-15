# Projeto CuidaBem

O CuidaBem é uma aplicação para gestão do cuidado da pessoa idosa, reunindo tarefas, lembretes, guias práticos, histórico do cuidado, contatos e recursos de apoio ao cuidador.

## Estrutura Do Projeto

O projeto está separado em duas aplicações principais:

- **Servidor/API**: pasta `Back_end`, responsável pela API REST, autenticação, regras de negócio, Prisma e banco de dados MySQL.
- **Aplicação Web**: pasta `Front-end`, responsável pela interface Angular consumida pelo cuidador/familiar.

As duas partes ficam no mesmo repositório, mas possuem dependências, build e execução separados.

## Como Executar Localmente

### 1. Pré-Requisitos

- **Node.js** 18 ou superior.
- **npm** 8 ou superior.
- **MySQL** acessível pela variável `DATABASE_URL`.

### 2. Instalar Dependências

Na raiz do projeto, execute:

```bash
npm run install:all
```

Instalação manual:

```bash
cd Back_end
npm install

cd ../Front-end
npm install

cd ..
```

### 3. Configurar O Servidor/API

Crie o arquivo `Back_end/.env` com base em `Back_end/.env.example`.

Exemplo de banco:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/cuidabem"
PORT=3000
CORS_ORIGINS=http://localhost:8100
```

Depois execute as migrações e o seed:

```bash
cd Back_end
npx prisma generate
npx prisma migrate deploy
npm run db:seed
cd ..
```

### 4. Executar Servidor E Aplicação Web

Na raiz do projeto:

```bash
npm run dev
```

Esse comando inicia:

- **Servidor/API** em `http://localhost:3000`.
- **Aplicação Web** em `http://localhost:8100`.

Abra `http://localhost:8100` no navegador.

## Comandos Úteis

```bash
npm run build:all
```

Executa o build do servidor e da aplicação web.

```bash
cd Back_end
npm run build
```

Valida apenas o servidor/API.

```bash
cd Front-end
npm run build
```

Valida apenas a aplicação web.

## Boas Práticas De Segurança

- Não versionar `.env`, credenciais, senhas, tokens ou chaves privadas.
- Manter `JWT_SECRET` forte e fora do código-fonte.
- Usar HTTPS em produção.
- Validar dados no servidor/API, mesmo quando o formulário também valida no navegador.
- Não expor stack trace ou mensagens técnicas internas para usuários finais.
