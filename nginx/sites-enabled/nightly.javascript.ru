# Old beta host

server {
  listen 80;
  server_name nightly.javascript.ru;
  return 301 https://$host$request_uri;
}

