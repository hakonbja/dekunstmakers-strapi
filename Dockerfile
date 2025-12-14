FROM node:20-alpine

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  vips-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (Strapi needs devDependencies at runtime)
RUN npm install

# Copy source code
COPY . .

# Build admin panel
RUN npm run build

# Create uploads directory
RUN mkdir -p public/uploads

EXPOSE 1337

CMD ["npm", "start"]

