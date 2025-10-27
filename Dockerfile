
FROM nginx:1.29.2-alpine-slim

LABEL Owner="J Kiran Kumar"

RUN rm -rf /usr/share/nginx/html/*

WORKDIR /usr/share/nginx/html

COPY . .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]



# FROM nginx:1.29.2-alpine-slim

# LABEL Owner="J Kiran Kumar"

# RUN rm -rf /usr/share/nginx/html/*

# WORKDIR /usr/share/nginx/html

# COPY . .

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]
