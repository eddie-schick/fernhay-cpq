FROM node:20.5.1-slim
WORKDIR /app
RUN npm --version && npm i -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN npm install -g serve --fetch-timeout 1000000 && pnpm i
COPY . .
EXPOSE 3000
CMD pnpm run build && npx serve -l 3000 -s dist