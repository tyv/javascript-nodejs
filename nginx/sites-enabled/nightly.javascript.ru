# Main host
# For home dev I use in DNS: javascript.in
# For prod it's nightly.javascript.ru

server {
  listen 80;
  listen 443 ssl;

  server_name nightly.javascript.ru nightly.javascript.info yuri.javascript.ru javascript.in;

  access_log  /var/log/nginx/nightly.javascript.ru.log main;

  error_page 404 /404.html;
  error_page   500 502 503 504  /50x.html;

  charset utf-8;
  root         <%=root%>/public;

<% if (setPassword) { %>
  auth_basic "Administrator Login";
  auth_basic_user_file /etc/nginx.passwd;
<% } %>

  # ^~ don't check regexps locations if prefix matches
  location ^~ /_download/ {
    internal;
    alias   <%=root%>/download/;
  }

  # restricted download
  location ^~ /download/ {
    include "partial/proxy_3000";
  }

  # folder/ -> try folder/index.html first, then @node
  location ~ ^(?<uri_no_dot>[^.]*?)/$ {
    try_files $uri_no_dot/index.html @node;
  }

  # no / in url => @node
  location ~ ^[^.]*$ {
    include "partial/proxy_3000";
  }

  location @node {
    include "partial/proxy_3000";
  }

  include "partial/javascript-static";


}


