FROM node:18.0.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV NODE_OPTIONS=--max_old_space_size=1024
EXPOSE 8080
CMD ["npm", "run", "dev"]
