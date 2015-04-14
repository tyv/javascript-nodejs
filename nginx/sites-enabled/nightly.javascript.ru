# Old beta host

server {
  listen 80;
  server_name nightly.javascript.ru;
  return 301 https://learn.javascript.ru$request_uri;
}

