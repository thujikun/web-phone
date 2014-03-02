(function() {
    var UrlAnalyzer = function(url) {
            this.url = url;
        };

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

    peer.on('open', function(id) {

        socket.on(id, function (data) {
            conn = peer.connect(data.key);

            conn.on('open', function() {
                console.log('open!');

                setInput();

                // Receive messages
                conn.on('data', function(data) {
                    appendMessage(data.message);
                });
            });
        });

        socket.emit('c2s', {
            room: analyzer.getUrlParameter('room') || 1000,
            key: id
        });
    });

    peer.on('connection', function(connection) {
        conn = connection;
        console.log('connect!');

        setInput();

        // Receive messages
        conn.on('data', function(data) {
            appendMessage(data.message);
        });
    });

}.call(window));