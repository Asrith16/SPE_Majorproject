FROM node:18.0.0-alpine
WORKDIR /
COPY package*.json ./
COPY vercel.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "run", "dev"]