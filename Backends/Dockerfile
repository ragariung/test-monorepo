FROM node:20-alpine

WORKDIR /app

# argon2 is a native addon and needs a compiler toolchain to build on Alpine
# when no prebuilt binary matches the platform; openssl is needed by Prisma's
# query engine at runtime on Alpine/musl.
RUN apk add --no-cache python3 make g++ openssl

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "dev"]
