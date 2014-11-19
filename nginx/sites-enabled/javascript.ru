
server {
  listen 80;

  server_name stage.javascript.ru nightly.javascript.ru;

  access_log  /var/log/nginx/js.local.log main;

  error_page 404 /404.html;
  error_page   500 502 503 504  /50x.html;

  charset utf-8;
  root         /js/javascript-nodejs/current/public;

<% if (env != 'test') { %>
  auth_basic "Administrator Login";
  auth_basic_user_file /etc/nginx/passwd;
<% } %>

  include "partial/javascript-static";

  location ~ ^(?<uri_no_slash>[^.]*?)/$ {
    try_files $uri_no_slash/index.html @node;
  }

  location ~ ^[^.]*$ {
    include "partial/proxy_3000";
  }

  location @node {
    include "partial/proxy_3000";
  }

}


