#/bin/bash
sudo apt-get install ejabberd -y
sudo apt-get install python-software-properties -y
sudo add-apt-repository ppa:chris-lea/node.js -y
sudo apt-get update -y
sudo apt-get install nodejs -y

sudo apt-get install build-essential -y

sudo mkdir /usr/local/lib/bosh
sudo cd /usr/local/lib/bosh
sudo git clone git://github.com/dhruvbird/node-xmpp-bosh.git .
sudo npm install .
sudo git pull

sudo cp /usr/local/lib/bosh/bosh.conf.example.js /etc/bosh.js.conf

sudo touch /etc/init.d/bosh
sudo chmod 777 /etc/init.d/bosh

sudo echo "
#! /bin/sh
#
# bosh        Start/stop node-xmpp-bosh server
#

### BEGIN INIT INFO
# Provides:          bosh
# Required-Start:    $remote_fs $network $named $time
# Required-Stop:     $remote_fs $network $named $time
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Starts node-xmpp-bosh server
# Description:       Starts node-xmpp-bosh server, an XMPP
#                    BOSH server written in JavaScript.
### END INIT INFO

PATH=/sbin:/bin:/usr/sbin:/usr/bin
NODE_PATH=/usr/local/lib/node
BOSH=/usr/local/bin/bosh
NAME=run-server.js

test -e $BOSH || exit 0

start()
{
    if ! pgrep -f $NAME
    then
        export NODE_PATH
        $BOSH
    fi
}

stop()
{
    killall node
}

case \"\$1\" in
    start)
    echo -n \"Starting bosh server\"
    start &
    ;;
    stop)
    echo -n \"Stopping bosh server\"
    stop &
    ;;
    restart)
    echo -n \"Restarting bosh server\"
    \$0 stop
    \$0 start
    ;;
    *)
    echo \"Usage: \$0 {start|stop|restart}\" >\&2
    exit 1
    ;;
esac

if [ \$? -eq 0 ]; then
    echo .
else
    echo \" failed.\"
fi

exit 0" >> /etc/init.d/bosh

sudo touch /usr/local/bin/bosh
sudo chmod 777 /usr/local/bin/bosh

sudo echo "#!/usr/bin/env sh
exec /usr/local/lib/bosh/run-server.js \"$@\" >> /var/log/bosh/bosh.log 2>> /var/log/bosh/bosh.err &" >> /usr/local/bin/bosh

sudo /etc/init.d/bosh start
