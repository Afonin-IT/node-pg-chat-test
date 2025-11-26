FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY drizzle ./drizzle
COPY src ./src
COPY drizzle.config.ts tsconfig.json eslint.config.mjs .prettierrc ./

RUN yarn db:generate
RUN yarn build

RUN mkdir -p uploads

EXPOSE 3000

CMD ["sh", "-c", "node build/db/migrate.js && node build/server.js"]