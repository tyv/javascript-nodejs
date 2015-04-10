# Main host
# For home dev I use in DNS: javascript.in
# For prod it's learn.javascript.ru

server {
  listen 80;
  server_name nightly.javascript.ru;
  return 301 https://$host$request_uri;
}

<% if (sslEnabled) { %>
server {
  listen 80;
  server_name learn.javascript.ru;
  return 301 https://$host$request_uri;
}
<% } %>

server {

<% if (sslEnabled) { %>
  listen 443 ssl;

  ssl_certificate		<%=certDir%>/learn.javascript.ru/ssl.pem;
  ssl_certificate_key	<%=certDir%>/learn.javascript.ru/ssl.key;

  add_header Strict-Transport-Security "max-age=31536000; includeSubdomains;";
<% } else { %>
  listen 80;

<% } %>

  server_name learn.javascript.ru yuri.javascript.ru javascript.in;

  access_log  /var/log/nginx/learn.javascript.ru.log main;

  error_page   404 /404.html;
  error_page   500 502 504  /50x.html;
  error_page   503 /error-nginx/503.html;

  charset utf-8;
  root         <%=root%>/public;

  add_header X-Frame-Options SAMEORIGIN;

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


  # zip for plunk
  location ^~ /tutorial/zipview/ {
    include "partial/proxy_3000";
  }


  # payments and dynamically generated invoices
  # no static used (yet)
  location ^~ /payments/ {
    include "partial/proxy_3000";
  }


  # folder/ -> try folder/index.html first, then @node
  location ~ ^(?<uri_no_dot>[^.]*?)/$ {
    try_files $uri_no_dot/index.html @node;
  }

  # no / in url => @node
  location ~ ^[^.]*$ {
    if (-f <%=root%>/service) {
      return 503;
    }
    include "partial/proxy_3000";
  }

  location @node {
    include "partial/proxy_3000";
  }

  # play directory has old plays (big, so moved out of project)
  location ~ ^/play/(.*\.zip)$ {
    alias   /js/play/$1;
  }

  # nodejs-screencast for download (big, so moved out of project)
  location ~ ^/nodejs-screencast/(.*)$ {
    alias   /js/nodejs-screencast/$1;
  }


  include "partial/javascript-static";


}


