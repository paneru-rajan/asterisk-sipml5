#!/bin/bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install xmlstarlet libpt-dev -y
export PTLIB_CONFIG=/usr/share/ptlib/make/ptlib-config
export DEBIAN_FRONTEND=noninteractive
cd /usr/local
sudo chmod -R 777 src
cd src
wget http://downloads.asterisk.org/pub/telephony/asterisk/asterisk-13-current.tar.gz
tar -xvzf asterisk-13-current.tar.gz
cd asterisk-13.17.2/contrib/scripts
sudo sed -i "s/libvpb-dev //g" install_prereq
yes | sudo ./install_prereq install
cd ../../
./configure --with-pjproject-bundled
make menuselect.makeopts
menuselect/menuselect --enable codec_opus menuselect.makeopts
make
sudo make install
sudo make samples
sudo make config

sudo cp -r /vagrant/conf/* /etc/asterisk/
sudo sh -c "echo 'noload => chan_sip.so' >> /etc/asterisk/modules.conf"
cd contrib/scripts/
PASSPHRASE=NEWPASSPHRASE
sudo cp /vagrant/asterisk-contrib-scipt/* ./
sudo sed -i "s/pass:yipl/pass:${PASSPHRASE}/g" astgenkey ast_tls_cert
sudo ./ast_tls_cert -C pbx.example.com -O "My Super Company" -d /etc/asterisk/keys
sudo apt-get install python-pip python-dev build-essential -y
sudo -H pip install --upgrade pip
sudo -H pip install virtualenvwrapper
sed -i "1isource /usr/local/bin/virtualenvwrapper.sh" ~/.bashrc
sed -i "1iexport PROJECT_HOME=\$HOME/Devel" ~/.bashrc
sed -i "1iexport WORKON_HOME=\$HOME/.virtualenvs" ~/.bashrc
source ~/.bashrc
mkvirtualenv webrtc
cd /vagrant/webrtc/
setvirtualenvproject
pip install -r requirement.txt

