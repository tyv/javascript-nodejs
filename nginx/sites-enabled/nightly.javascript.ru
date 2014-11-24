# Main host
# For home dev I use in DNS: javascript.in
# For prod it's nightly.javascript.ru

server {
  listen 80;

  server_name nightly.javascript.ru javascript.in;

  access_log  /var/log/nginx/nightly.javascript.ru.log main;

  error_page 404 /404.html;
  error_page   500 502 503 504  /50x.html;

  charset utf-8;
  root         <%=root%>/public;

<% if (env == 'production') { %>
  auth_basic "Administrator Login";
  auth_basic_user_file /etc/nginx.passwd;
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


