# This host is used for live proxying from a remote server w/ open IP to dev/testing machine over NAT
#
# requires revers ssh tunnel, e.g:
#  from dev machine:
#    autossh -M 10984 -R 1212:localhost:80 <user>@stage.javascript.ru
#  from travis:
#    ssh -fnNR localhost:1212:localhost:80 travis@stage.javascript.ru
#              ^^^^^^^^^ if I don't set it here and 'GatewayPorts yes', 1212 port will be open to everyone

server {

    listen 80;

    server_name stage.javascript.ru;

    location / {
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host nightly.javascript.ru;

      proxy_pass http://127.0.0.1:1212;
      proxy_redirect off;
      proxy_buffering off;
      proxy_read_timeout 3600s;
    }

}