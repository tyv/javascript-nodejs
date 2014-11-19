# proxy everything to remote machine which actually has node up
# requires ssh like:
#  from dev machine:
#    autossh -M 10984 -R 1212:localhost:80 <user>@stage.javascript.ru
#  from travis:
#    ssh -fnNR 1212:localhost:80 travis@stage.javascript.ru

server {

    listen 80;

    server_name stage.javascript.ru;

    location / {
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $http_host;

      proxy_pass http://127.0.0.1:1212;
      proxy_redirect off;
      proxy_buffering off;
      proxy_read_timeout 3600s;
    }

}