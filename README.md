# Fastify Chat API

## Requirements
- Docker & Docker Compose
- Node.js (v22+)
- Yarn

## Quick start (Docker)

```bash
echo "PORT=3000" > .env
echo "DATABASE_URL=postgres://user:password@db:5432/chat_db" >> .env

docker-compose up --build
```

API will be available at: `http://localhost:3000`

---

## Local development

```bash
yarn install

echo "PORT=3000" > .env
echo "DATABASE_URL=postgres://user:password@localhost:5432/chat_db" >> .env

docker-compose up -d db

# Generating and applying migrations
yarn db:generate
yarn db:migrate

yarn dev
```

## Docs (Swagger)

[http://localhost:3000/docs](http://localhost:3000/docs)