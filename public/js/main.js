(function() {

    var UrlAnalyzer = function(url) {
            this.url = url;
        },
        getMedia = navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia;

    UrlAnalyzer.prototype = {
        getUrl: function() {
            return this.url.split(/\?|#/)[0];
        },
        getUrlParameters: function() {
            var paramText = this.url.split('?')[1] || '',
                tempParams = paramText.split('&'),
                parameter,
                parameters = {},
                i, length;

            for (i = 0, length = tempParams.length; i < length; i++) {
                parameter = tempParams[i].split(/=/);
                parameters[parameter[0]] = parameter[1];
            }
            parameters.hasParam = function() {
                var name;
                for (name in this) {
                    return true;
                }
                return false;
            };
            return parameters;
        },
        getUrlParameter: function(key) {
            return this.getUrlParameters()[key] || '';
        }
    };

    document.addEventListener('DOMContentLoaded', function() {

        var analyzer = new UrlAnalyzer(location.href);

        var peer = new Peer({key: 'lwjd5qra8257b9'});
        var socket = io.connect('http://kabocha.orz.hm/', {
            resource: 'fireeagle/socket.io'
        });
        var conn;
        var setInput = function() {
            // document.getElementById('message-send').addEventListener('click', function(e) {
            //     var input = document.getElementById('message-input');

            //     // Send messages
            //     conn.send({
            //         message: input.value
            //     });
            //     appendMessage(input.value);
            //     input.value = '';

            //     e.preventDefault();
            // });

        };
        var appendMessage = function(message) {
            var messageList = document.getElementsByClassName('message-list')[0],
                messageElement = document.createElement('li'),
                messageText = document.createTextNode(message);

            messageElement.appendChild(messageText);
            messageList.appendChild(messageElement);
        };
        var sendVideo = function(key) {
            if(navigator.webkitGetUserMedia) {
                navigator.webkitGetUserMedia({
                    audio: true
                }, function(mediaStream){
                    call = peer.call(key, mediaStream);
                    call.on('stream', receiveVideo);
                }, function(){});
            }
            if(navigator.mozGetUserMedia) {
                navigator.mozGetUserMedia({
                    audio: true
                }, function(mediaStream){
                    call = peer.call(key, mediaStream);
                    call.on('stream', receiveVideo);
                }, function(){});
            }
        };
        var answerVideo = function(call) {
            if(navigator.webkitGetUserMedia) {
                navigator.webkitGetUserMedia({
                    audio: true
                }, function(mediaStream){
                    call.answer(mediaStream);
                    call.on('stream', receiveVideo);
                }, function(){});
            }
            if(navigator.mozGetUserMedia) {
                navigator.mozGetUserMedia({
                    audio: true
                }, function(mediaStream){
                    call.answer(mediaStream);
                    call.on('stream', receiveVideo);
                }, function(){});
            }
        };
        var receiveVideo = function(mediaStream) {
            var remoteVideo = document.getElementById('remote-video');

            remoteVideo.classList.add('on');
            remoteVideo.src = URL.createObjectURL(mediaStream);
            remoteVideo.play();
        };

        var callKey;

        peer.on('open', function(id) {
            console.log('peer open');
            socket.on(id, function (data) {
                console.log('socket receive');
                conn = peer.connect(data.key);

                conn.on('open', function() {
                    console.log('peer connect');

                    // setInput();

                    // Receive messages
                    // conn.on('data', function(data) {
                    //     appendMessage(data.message);
                    // });
                });

                callKey = data.key;
            });

            socket.emit('c2s', {
                room: analyzer.getUrlParameter('room') || 1000,
                key: id
            });
        });

        peer.on('connection', function(connection) {
            console.log('peer connect');
            conn = connection;

            setInput();

            // Receive messages
            conn.on('data', function(data) {
                appendMessage(data.message);
            });

            peer.on('call', function(call) {
                console.log('peer call');
                answerVideo(call);
            });
        });

        var callElements = Array.prototype.slice.call(document.getElementsByClassName('js-call'));

        callElements.forEach(function(element) {
            element.addEventListener('click', function() {
                sendVideo(callKey);
            })
        });
    });

}.call(window));