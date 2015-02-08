# XMPPMap

XMPPmap demo for ToshibaLab phase07(Mid 2013-Mid 2014)

## Cấu trúc hệ thống

Hệ thống gồm có: 1. Web server; 2. XMPP Server. Các truy vấn và phản hồi cơ bản được web server xử lý. Sự tương tác giữa các client được gửi thông qua các thông điệp do XMPP server quản lý.

## Phần mềm yêu cầu

    1. ejabberd
    2. nodejs
    3. build-essential(Ubuntu)
    4. [node-xmpp-bosh](https://github.com/dhruvbird/node-xmpp-bosh)

## Hướng dẫn cài đặt

### 1. Cài ejabberd

1. Tham khảo cài đặt tại [Đây](https://www.digitalocean.com/community/tutorials/how-to-install-ejabberd-xmpp-server-on-ubuntu)

2. Thêm 2 user:

		user: user1; password: abc123
		user: user2; password: abc123

3. Config cổng 5280 thành 1 cổng khác (5281) trong file /etc/../ejabberd.cfg. Tại:

		%5280
		  {5280, ejabberd_http, [
			     %%{request_handlers,
			     %% [
			     %%  {["pub", "archive"], mod_http_fileserver}
			     %% ]},
			     %%captcha,
			     http_bind,
			     http_poll,
			     web_admin
			    ]}
		 ]}.

4. restart ejabberd

### 2. Cài build-essential

    apt-get install build-essential

### 3. Cài nodejs

Tham khảo hướng dẫn tại [đây](http://askubuntu.com/questions/49390/how-do-i-install-the-latest-version-of-node-js)

### 4. Cài đặt xmpp-node-bosh

Tham khảo ở [đây](https://github.com/dhruvbird/node-xmpp-bosh/blob/master/DEBIAN_HOW_TO.md)

***Chú ý: 
1. Sau khi cài xong bước 4. để chạy gateway thì chạy lệnh:
node /.../run-server.js (file này trong gói node-xmpp-bosh đã tải xuống từ git)
2. Trước khi chạy chương trình, cần thay đổi địa chỉ sv XMPP tại file xmppMap.js
