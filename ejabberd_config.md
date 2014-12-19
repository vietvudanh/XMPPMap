Add user

		ejabberdctl register admin localhost password

By default, hostname used by eJabberd is 'localhost', which can be modified from config file.

For our example we will call our admin user "admin@localhost" and modify the following lines in /etc/ejabberd/ejabberd.cfg:

>%% Admin user
>{acl, admin, {user, "admin", "localhost"}}.
>
>%% Hostname
>{hosts, ["localhost"]}.
