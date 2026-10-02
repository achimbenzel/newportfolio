# Kleiner Dienst für unbeantwortete Chat-Fragen (siehe server.mjs) – keine npm-Pakete nötig.
FROM node:22-alpine
WORKDIR /app
COPY deploy/ask-log/server.mjs ./
USER node
ENV LOG_FILE=/data/ask-log.jsonl
EXPOSE 3001
CMD ["node", "server.mjs"]
