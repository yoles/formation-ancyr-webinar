FROM alpine:3.15

RUN apk update && apk add --update nodejs npm
RUN apk add make

WORKDIR /app

RUN npm install -g -y @nestjs/cli

EXPOSE 3000

CMD ["sh", "start.sh"]
