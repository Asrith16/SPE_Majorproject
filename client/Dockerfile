FROM node:18.0.0-alpine
WORKDIR /
COPY package*.json ./
COPY tailwind.config.js ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]