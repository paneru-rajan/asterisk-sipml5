
var sipStack;
var isMuted = false; // store current status of audio mute
var ongoing_session; // session to store incoming and outgoing calls
var incomingCallEvent; // to get incomming call event
ringTone.loop      = true;
var eventsListener = function (e) {
    console.log(e);
    console.log('%c begning=>' + e.type, 'font-size:5em');
    if (e.type == 'started') {
        login();
    }
    if (e.type == 'i_new_call') {
        incomingCallEvent = e;
        ongoing_session   = e.newSession;
        ringTone.play();
        $('#incomingCallNumber').html('From ' + ongoing_session.getRemoteFriendlyName());
        $('#callControl').hide();
        $('#incomingCall').show();
    }
};

function createSipStack() {
    sipStack = new SIPml.Stack({
            realm:                 asteriskIp,
            impi:                  asteriskUser,
            impu:                  'sip:'+asteriskUser+'@'+asteriskIp,
            password:              asteriskUserPass,
            display_name:          asteriskUserName,
            websocket_proxy_url:   'wss://'+asteriskIp+':8089/ws',
            outbound_proxy_url:    'udp://'+asteriskIp+':5060',
            //enable_rtcweb_breaker: false, // optional
            ice_servers:           [{"url": "stun:stun.l.google.com:19302"}],
            disable_video:         true,
            events_listener:       {events: '*', listener: eventsListener},
            sip_headers:           [// change the sip header if needed
                {name: 'User-Agent', value: 'Browser voiceinn-v1.0.0.0'},
                {name: 'Yipl', value: 'VoiceInn'}
            ]
        }
    );
}

createSipStack();
sipStack.start();

var login      = function () {
    var registerSession = sipStack.newSession('register', {
        events_listener: {events: '*', listener: eventsListener}
    });
    registerSession.register();
};
var makeCall   = function (number) {
    var outCallSession = sipStack.newSession('call-audio', {
        audio_remote:    document.getElementById('audio-remote'),
        events_listener: {
            events: '*', listener: function (e) {
                console.log(e);
                console.log('%c OUT = >' + e.type, 'font-size:5em');
                if (e.type === 'connected') {
                    $('#callInfoText').html('Ringing...');
                    $('#callInfoNumber').html(number);
                    $('#callStatus').show();
                    $('#callControl').hide();
                }
                else if (e.type === 'm_stream_audio_remote_added') {
                    domInCall();
                }
                else if (e.type === 'terminated') {
                    ongoing_session = false;
                    domHangup();
                }
            }
        }
    });
    outCallSession.call(number);
    ongoing_session = outCallSession;
};
var acceptCall = function (e) {
    var incoming_audio_configuration = {
        audio_remote:    document.getElementById('audio-remote'),
        expires:200,
        events_listener: {
            events: '*', listener: function (e) {
                console.log('%c In = >' + e.type, 'font-size:5em');
                if (e.type === 'm_stream_audio_remote_added') {
                    domInCall();
                }
                else if (e.type === 'terminated') {
                    domHangup();
                    ongoing_session = false;
                }
            }
        }
    };
    e.newSession.accept(incoming_audio_configuration);
};

$('#connectCall').click(function () {
    makeCall($('#toField').val());
});
$('#answer').click(function () {
    acceptCall(incomingCallEvent);
});
var hangup    = function () {
    domHangup();
    ongoing_session.hangup();
};
var domHangup = function () {
    ringTone.pause();
    isMuted = false;
    $('#muteIcon').removeClass('fa-microphone-slash');
    $('#muteIcon').addClass('fa-microphone');
    $('#incomingCall').hide();
    $('#callControl').show();
    $('#callStatus').hide();
    $('#inCallButtons').hide();
};
var domInCall = function () {
    ringTone.pause();
    $('#callStatus').show();
    $('#incomingCall').hide();
    $('#callInfoText').html('Call in Progress...');
    $('#callInfoNumber').html(ongoing_session.getRemoteFriendlyName());
    $('#inCallButtons').show();
};
$('#hangUp').click(hangup);
$('#reject').click(hangup);
$('#mute').click(function () {
    isMuted = isMuted ? false : true;
    ongoing_session.mute('audio', isMuted);
    if (isMuted) {
        $('#muteIcon').addClass('fa-microphone-slash');
        $('#muteIcon').removeClass('fa-microphone');
    } else {
        $('#muteIcon').removeClass('fa-microphone-slash');
        $('#muteIcon').addClass('fa-microphone');
    }
});
$('#toField').keypress(function (e) {
    if (e.which === 13) {
        $('#connectCall').click();
    }
});
$('#inCallButtons').on('click', '.dialpad-char', function (e) {
    dtmfTone.play();
    var $target = $(e.target);
    var value   = $target.data('value');
    ongoing_session.dtmf(value.toString());
});
window.onbeforeunload = function (event) {
    if (ongoing_session) {
        sipStack.stop();
    }
};
