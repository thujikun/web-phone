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

    var analyzer = new UrlAnalyzer(location.href);

    var peer = new Peer({key: 'lwjd5qra8257b9'});
    var socket = io.connect(location.protocol + '//' + location.hostname);
    var conn;
    var setInput = function() {
        document.getElementById('message-send').addEventListener('click', function(e) {
            var input = document.getElementById('message-input');

            // Send messages
            conn.send({
                message: input.value
            });
            appendMessage(input.value);
            input.value = '';

            e.preventDefault();
        });

    };
    var appendMessage = function(message) {
        var messageList = document.getElementsByClassName('message-list')[0],
            messageElement = document.createElement('li'),
            messageText = document.createTextNode(message);

        messageElement.appendChild(messageText);
        messageList.appendChild(messageElement);
    };
    var sendVideo = function(key) {
        navigator.webkitGetUserMedia({
            video: true,
            audio: true
        }, function(mediaStream){
            var localVideo = document.getElementById('local-video');

            localVideo.src = URL.createObjectURL(mediaStream);
            localVideo.play();

            call = peer.call(key, mediaStream);
            call.on('stream', receiveVideo);
        });
    };
    var answerVideo = function(call) {
        navigator.webkitGetUserMedia({
            video: true,
            audio: true
        }, function(mediaStream){
            var localVideo = document.getElementById('local-video');

            localVideo.src = URL.createObjectURL(mediaStream);
            localVideo.play();

            call.answer(mediaStream);
            call.on('stream', receiveVideo);
        });
    };
    var receiveVideo = function(mediaStream) {
        var remoteVideo = document.getElementById('remote-video');

        remoteVideo.src = URL.createObjectURL(mediaStream);
        remoteVideo.play();
    };

    peer.on('open', function(id) {

        socket.on(id, function (data) {
            conn = peer.connect(data.key);

            conn.on('open', function() {

                setInput();

                // Receive messages
                conn.on('data', function(data) {
                    appendMessage(data.message);
                });
            });

            sendVideo(data.key);
        });

        socket.emit('c2s', {
            room: analyzer.getUrlParameter('room') || 1000,
            key: id
        });
    });

    peer.on('connection', function(connection) {
        conn = connection;

        setInput();

        // Receive messages
        conn.on('data', function(data) {
            appendMessage(data.message);
        });

        peer.on('call', function(call) {
            answerVideo(call);
        });
    });

}.call(window));