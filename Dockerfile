FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY .env ./
COPY simulation_backend.mjs ./

RUN npm install --only=production

CMD ["node", "simulation_backend.mjs"]</content>
<parameter name="filePath">/Users/souravkairi/AisleBe-1/Dockerfile