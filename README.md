# Sipml5 with Asterisk
[![MIT Licensed](https://img.shields.io/badge/License-MIT-blue.svg?style=flat)](https://opensource.org/licenses/MIT)

This is the complete guide to install [Sipml5](https://www.doubango.org/sipml5/) and [Asterisk](http://www.asterisk.org/). I have used Vagrant, however, I will describe how to install on Ubuntu alone. 

## Getting Started

These instructions will get you a copy of the project up and be running on your local machine for development and testing purposes. I have stuck in on several places, but this will go smoothly if you follow the steps carefully.

+ I have modified the default js of sipml5 in order to avoid stun server lookup in localhost. That might need to be modified in future and is explained [Here](#imp_note).

+  We need to used wss, to work with webrtc in Chrome, however, Fifrefox `Version 56.0` seems working without https
    ```text
    [Deprecation] getUserMedia() no longer works on insecure origins. To use this feature, you should consider switching your application to a secure origin, such as HTTPS. See https://goo.gl/rStTGz for more details.
    ```

Please read carefully, so you can comprehend all. I have posted all [references](#acknowledgment).


## Installation Method
1. [Rapid (Using Vagrant Provisioning)](#rapid-install)
2. [Step by Step without using vagrant](#step-install)

## <a name="rapid-install"></a>1. Rapid (Using Vagrant Provisioning)
Are you curious what's going on inside, you can read the `boot.sh` or [step by step](#step-install) installation
### Prerequisites
If you have an Ubuntu 16.04 or other versions. It's okay to install directly on the machine without vagrant. It can be installed in other OS too with little or no tweak.
If you want to install through vagrant as I did, you have to get these first.
* Latest Vagrant
* VirtualBox (or could be other virtual Machines)
* The latest version of Browser (Chrome/Firefox)
* LinPhone, or other Sip Phone if you want

### Installation using Vagrant provisioning

A complete guide to installing Asterisk and WebPhone

Clone the repo

```bash
git clone https://github.com/paneru-rajan/asterisk-sipml5.git
cd asterisk-sipml5
```
Edit the Vagrant File
* Open the file to Edit Manually
    ```bash
    vim Vagrantfile
    ```
* You might need to alert `config.vm.network "public_network", ip: "192.168.1.240", bridge: "wlp2s0"`
    * You can delete this line if you don't want to configure with public network otherwise you need to alter `IP` and `Bridge`.
    * Change the IP via the command, or manually
        ```bash
         sed -i "s/192.168.1.240/YOUR-IP-HERE/" Vagrantfile
        ```
    * Change the bridge via the command, or manually. Use `ifconfig` to find about the wifi interface.
        ```bash
         sed -i "s/wlp2s0/YOUR-Wifi-Interface-Name-HERE/" Vagrantfile
        ```
Edit the Bash Script `boot.sh` 
* Add your own passphrase. Replace `NEWPASSPHRASE` in `PASSPHRASE=NEWPASSPHRASE` or use the below script accordingly.
    ```bash
     sed -i "s/NEWPASSPHRASE/YOUR-NEW-PASSHPRASE-HERE/" boot.sh
    ```
* Update `pbx.example.com` with your Domain Name or Ip and `My Super Company` with the Company Name in `sudo ./ast_tls_cert -C pbx.example.com -O "My Super Company" -d /etc/asterisk/keys`
    ```bash
     sed -i "s/pbx.example.com/YOUR-Doamin-or-IP-HERE/" boot.sh
     sed -i "s/My Super Company/YOUR-Company-Name-HERE/" boot.sh
    ```
Start the vagrant
```bash
vagrant up
```
You need to wait until the whole process finishes. And then reload the virtual machine.
```bash
vagrant reload
```
Login into the machine
```bash
vagrant ssh
```
Now It's time to run the python web program. Which is located on `webrtc` folder. First, let's start the virtual environment.
```bash
workon webrtc
```
Finally, to run the webrtc web application simply do,
```bash
python webrtc.py
```
To View Asterisk console, open a new terminal and type
```bash
sudo asterisk -rvvvvvv
```

Now it's time to connect to the browser or sip application, [Click me](#demo-setup).

## <a name="step-install"></a>2. Step by Step without using vagrant
### Prerequisites
* The latest version of Browser (Chrome/Firefox)
* LinPhone, or other Sip Phone if you want

### Exhaustive steps of Installation

A step by step process to install Asterisk and WebPhone
I have tested on Ubuntu 16.04, nevertheless, it will work on another distro with few changes.

Clone the repo

```bash
git clone https://github.com/paneru-rajan/asterisk-sipml5.git
```
Update and Upgrade the system
```bash
sudo apt-get update
sudo apt-get upgrade -y
```
Install some dependent packages
```bash
sudo apt-get install xmlstarlet libpt-dev -y
```
Export Environment Viarable
```bash
export PTLIB_CONFIG=/usr/share/ptlib/make/ptlib-config
```
Configuring the directory to download and save Asterisk
```bash
cd /usr/local
sudo chmod -R 777 src
cd src
```
Download asterisk. If you want another version the [go here](http://www.asterisk.org/downloads/asterisk/all-asterisk-versions), and replace the below link accordingly.

> **Please Note:** For webrtc to work we need atleast *13.15.0 or 14.4.0* version of Asterisk. 
```bash
wget http://downloads.asterisk.org/pub/telephony/asterisk/asterisk-13-current.tar.gz
```
Untar the downloaded file, if you have downloaded other version please the change the name accordingly.
```bash
tar -xvzf asterisk-13-current.tar.gz
```
Going Inside the Directory
```bash
cd asterisk-13.17.2/contrib/scripts
```
Install dependent package for Asterisk. You are asked to confirm and Enter the Country code, For Nepal, I had used `977`.
```bash
sudo ./install_prereq install
```
Configuring Asterisk with pjsip, if you are using sip please omit `--with-pjproject-bundled`
```bash
cd ../../
./configure --with-pjproject-bundled
```
You can select relevent option via GUI mode,  for this use `make menuselect`. Here we need to select `opus codec` and I used the cli.
```bash
make menuselect.makeopts
menuselect/menuselect --enable codec_opus menuselect.makeopts
```

Making and Installing
```bash
make
sudo make install
```
Create Sample and Config
```bash
sudo make samples
sudo make config
```
To open the asterisk
```bash
sudo asterisk -cvvvvv
```
To reload Asterisk
```bash
sudo asterisk -rvvvvv
```

## <a name="asterisk-setup"></a>Setting up Asterisk
To set up with sipml5 I had been through the asterisk offiial site and I do recommand you to visit it.

We need to update several config file which are located on `/etc/asterisk`. Those filename are listed below
1. modules.conf
1. [extensions.conf](conf/extensions.conf)
1. [http.conf](conf/http.conf)
1. [pjsip.conf](conf/pjsip.conf)
1. [rtp.conf](conf/rtp.conf)


You can copy these file except `modules.conf` wich are located inside the `conf` folder. And for `modules.conf` please use the **point 1** below. To copy use:
```bash
sudo cp -r conf/* /etc/asterisk/
```
I have posted how these file looks below with breif explaination.

1. **modules.conf**: Since we are  using `pjsip`, we need to stop loading `sip`. As both of them cannot be used simultaneously. You can update manually or use the bash script below:
    ```bash
    sudo sh -c "echo 'noload => chan_sip.so' >> /etc/asterisk/modules.conf"
    ```
    
1. **extension.conf**:Add these things to the `extension.conf` at the end of the file. If you have just installed a fresh copy of asterisk you can even override the existing code.

    I have added two extensions, which are in fact dial plans.
    * Where `helloworld` just plays the hello-world music when we call in any number
    * Whereas the `helloworld2`, first plays the hello-world and then calls to another number, it also waits for the **dtmf** and plays its name based on whether the called number is registered one or not.
    ```bash
    [helloworld]
    exten => _X.,1,NoOp(${EXTEN})
    same => n,Playback(hello-world)
    same => n,Hangup()
    
    [helloworld2]
    exten => _X.,1,NoOp(${EXTEN})
    same => n,Playback(hello-world)
    same => n,Dial(PJSIP/${EXTEN},20)
    same => n,Read(Digits,,)
    same => n,Playback(you-entered)
    same => n,SayNumber(${Digits})
    ```
1. **http.conf**: Please update the file accordingly, or replace if you want.
    ```bash
    [general]
    enabled=yes
    bindaddr=0.0.0.0
    bindport=8088
    tlsenable=yes
    tlsbindaddr=0.0.0.0:8089
    tlscertfile=/etc/asterisk/keys/asterisk.pem
    ```

1. **pjsip.conf**: 
    `199` is for web based phone
    `3002` and `3001` for sip clients: *(like Linphone for desktop and CSipSimle for mobile)*
    
    This file need to have:
    ```bash
    [transport-wss]
    type=transport
    protocol=wss
    bind=0.0.0.0
    
    [199]
    type=endpoint
    aors=199
    auth=199
    use_avpf=yes
    media_encryption=dtls
    dtls_ca_file=/etc/asterisk/keys/ca.crt
    dtls_cert_file=/etc/asterisk/keys/asterisk.pem
    dtls_verify=fingerprint
    dtls_setup=actpass
    ice_support=yes
    media_use_received_transport=yes
    rtcp_mux=yes
    context=helloworld2
    disallow=all
    allow=ulaw
    allow=opus
    
    [199]
    type=auth
    auth_type=userpass
    username=199
    password=199@pass1 
    
    [199]
    type=aor
    max_contacts=1
    remove_existing=yes
    
    
    [transport-udp]
    type=transport
    protocol=udp
    bind=0.0.0.0
    
    [3001]
    type=endpoint
    context=helloworld2
    disallow=all
    allow=ulaw
    auth=3001
    aors=3001
    
    [3001]
    type=auth
    auth_type=userpass
    password=3001pass
    username=3001
    
    [3001]
    type=aor
    max_contacts=1
    remove_existing=yes
    
    [3002]
    type=endpoint
    context=helloworld2
    disallow=all
    allow=ulaw
    auth=3002
    aors=3002
    
    [3002]
    type=auth
    auth_type=userpass
    password=3002pass
    username=3002
    
    [3002]
    type=aor
    max_contacts=1
    remove_existing=yes
    ```

1. **rtp.conf**: Need to have these on rtp.conf.
    ```bash
    [general]
    rtpstart=10000
    rtpend=20000
    icesupport=true
    stunaddr=stun.l.google.com:19302
    ```
### Create Certificates
Call the script as such:
```bash
cd /usr/local/src/asterisk-13.17.2/contrib/scripts
sudo ./ast_tls_cert -C pbx.example.com -O "My Super Company" -d /etc/asterisk/keys
```
* The "-C" option is used to define our host - DNS name or our IP address.
* The "-O" option defines our organizational name.
* The "-d" option is the output directory of the keys.
1. You'll be asked to enter a pass phrase for /etc/asterisk/keys/ca.key, put in something that you'll remember for later.
1. This will create the /etc/asterisk/keys/ca.crt file.
1. You'll be asked to enter the pass phrase again, and then the /etc/asterisk/keys/asterisk.key file will be created.
1. The /etc/asterisk/keys/asterisk.crt file will be automatically generated.
1. You'll be asked to enter the pass phrase a third time, and the /etc/asterisk/keys/asterisk.pem, a combination of the asterisk.key and asterisk.crt files, will be created.
1. You can then check your **/etc/asterisk/keys** directory to verify the new files were created, as such:
```bash
ls -w 1 /etc/asterisk/keys
```
And you should see:
```bash
asterisk.crt
asterisk.csr
asterisk.key
asterisk.pem
ca.cfg
ca.crt
ca.key
tmp.cfg
```
You can reload the asterisk by:
```bash
asterisk -rvvvvvv
```
or simply typing `reload` on Asterisk's cli.

To verify the web server is running, perform:
```bash
netstat -an | grep 8089
```
And you should see:
```bash
tcp        0      0 0.0.0.0:8089            0.0.0.0:*               LISTEN  
```

Next, to ensure these modules are loaded by Asterisk, you can perform:
```bash
asterisk -rx "module show like crypto"
asterisk -rx "module show like websocket"
asterisk -rx "module show like opus"
```
You should see something similar to:

```bash
# asterisk -rx "module show like crypto"
Module                         Description                              Use Count  Status      Support Level
res_crypto.so                  Cryptographic Digital Signatures         1          Running              core
1 modules loaded

# asterisk -rx "module show like websocket"
Module                         Description                              Use Count  Status      Support Level
res_http_websocket.so          HTTP WebSocket Support                   3          Running          extended
res_pjsip_transport_websocket.so PJSIP WebSocket Transport Support        0          Running              core
2 modules loaded
 
# asterisk -rx "module show like opus"
Module                         Description                              Use Count  Status      Support Level
codec_opus.so                  OPUS Coder/Decoder                       0          Running          extended
res_format_attr_opus.so        Opus Format Attribute Module             1          Running              core
```

## <a name="demo-setup"></a>Running on Browser and Linphone
### Setting up python server and running web based phone on Browser.
1. Open `webrtc` folder inside the downloaded repo in the terminal.
1. Install PIP, and dependencies
    ```bash
    sudo apt-get install python-pip python-dev build-essential -y
    ```
1. Upgrade PIP
    ```bash
    sudo -H pip install --upgrade pip
    ```
1. Install VirtualEnvWrapper
    ```bash
    sudo -H pip install virtualenvwrapper
    ```
1. Configure the virtualenvwrapper, by insterting below code into the `.bashrc` file
    ```bash
    sed -i "1isource /usr/local/bin/virtualenvwrapper.sh" ~/.bashrc
    sed -i "1iexport PROJECT_HOME=\$HOME/Devel" ~/.bashrc
    sed -i "1iexport WORKON_HOME=\$HOME/.virtualenvs" ~/.bashrc
    ```
1. Source the bash
    ```bash
    source ~/.bashrc
    ```
1. Create a virtual Environment:
    ```bash
    mkvirtualenv webrtc
    ```
1. Set VirtualEnv Project:
    ```bash
    setvirtualenvproject
    ```
1. Install required modules:
    ```bash
    pip install -r requirement.txt
    ```
1. To deactivate:
    ```bash
    deactivate
    ```
1. To run virtual env again:
    ```bash
    workon webrtc
    ```
1. To run the server:
    ```bash
    python webrtc.py
    ```
#### Run web phone on browser:
* Please open Chrome/Firefox
* Change Ip of asterisk server in [https://192.168.33.10:8089/httpstatus](https://192.168.33.10:8089/httpstatus) and open in the browser. Then proceed to Https security warning.
* Change Ip of the web server in [https://192.168.33.10:5000](https://192.168.33.10:5000) and open in the browser. Then proceed to Https security warning.
* Open Igcognito mode to see various event triggered during the call session.

### Configuring on Linphone.
* Download and install [Libphone](http://www.linphone.org/) if you have not installed yet.
* Open Linphone
* Goto **Options** > **Preferences** > **Manage Sip Account** > **Add**
* Enter *Your Sip identity: sip:3002@103.69.124.194* with your Ip.
* Enter *Sip Proxy Address: sip:3002@103.69.124.194* with your Ip.
* You can call to `199` which will ring on your browser.

##### <a name="imp_note"></a>Important Note:
> I have edited `static/js/SIPml-api.js` in line 2724, so that I can reduce the delay caused by `gathering the ICE candidates` in localhost.
> ```javascript
> this.o_pc = new window.RTCPeerConnection(null, this.o_media_constraints);
> //this.o_pc = new window.RTCPeerConnection((a && !a.length) ? null : {iceServers: a}, this.o_media_constraints);
> ```
> To revert change the above two line with:
> ```javascript
> this.o_pc = new window.RTCPeerConnection((a && !a.length) ? null : {iceServers: a}, this.o_media_constraints);
> ```

## Built With

* [Asterisk](http://www.asterisk.org/) - Open source framework for building communications applications
* [Flask](http://flask.pocoo.org/) - Microframework for Python
* [Sipml5](https://www.doubango.org/sipml5/) - HTML5 SIP client entirely written in javascript

## Author

* [**Rajan Paneru**](http://rajanpaneru.com.np)
    * [Github](https://github.com/paneru-rajan)
## License

MIT &copy; [YoungInnovations](https://github.com/younginnovations)   

## <a name="acknowledgment"></a>Acknowledgments

* [Asterisk and sipml5 Documentation](https://wiki.asterisk.org/wiki/display/AST/WebRTC+tutorial+using+SIPML5) - Really Helped to install and configure the Asterisk
* [Sipml5 Complete API](https://www.doubango.org/sipml5/docgen/symbols/SIPml.html) - Really useful to make a custom audio phone.
* [HTML/CSS Phone](https://jsfiddle.net/676x6p4a/) - I have replicated the phone(html/css).
