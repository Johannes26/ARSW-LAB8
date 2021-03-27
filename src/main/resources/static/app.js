var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }
    var numberconection = null;
    var stompClient = null;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };


    var getMousePosition = function (evt) {
        var canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var addPolygonToCanvas = function (puntos) {
        var canvas = document.getElementById("canvas");
        var c2 = canvas.getContext("2d");
        c2.clearRect(0, 0, canvas.Width, canvas.height)
        c2.beginPath();
        c2.moveTo(puntos[0].x, puntos[0].y);
        puntos.map(function (prue) {
            c2.lineTo(prue.x, prue.y);
        });
        c2.closePath();
        c2.fill();
    };

    var connectAndSubscribe = function () {
        if ($("#number").val() != "") numberconection = $("#number").val();
        console.log(numberconection);
        if (numberconection != null) {
            console.info('Connecting to WS...');
            var socket = new SockJS('/stompendpoint');
            stompClient = Stomp.over(socket);

            //subscribe to /topic/TOPICXX when connections succeed
            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                stompClient.subscribe(`/topic/newpoint.${numberconection}`, function (eventbody) {
                    var theObject = JSON.parse(eventbody.body);
                    addPointToCanvas(theObject);
                    console.log(theObject);
                });
                stompClient.subscribe(`/topic/newpolygon.${numberconection}`, function (eventbody) {
                    var theObject = JSON.parse(eventbody.body);
                    addPolygonToCanvas(theObject);
                    console.log(theObject);
                });
            });
        } else {
            alert("Inserte primero un numero")
        }
    };



    var init = function () {
        //websocket connection
        //connectAndSubscribe();
        var canvas = document.getElementById("canvas");
        if (window.PointerEvent) {
            canvas.addEventListener("pointerdown", _addPoint);
        }
        else {
            canvas.addEventListener("mousedown", function (event) {
                canvas.addEventListener("pointerdown", _addPoint);
            });
        }
    };

    function _addPoint(event) {
        var canvas = document.getElementById("canvas");
        var offset = _getOffset(canvas);
        app.publishPoint(event.pageX - offset.left, event.pageY - offset.top);
    }

    function _getOffset(obj) {
        var offsetLeft = 0;
        var offsetTop = 0;
        do {
            if (!isNaN(obj.offsetLeft)) {
                offsetLeft += obj.offsetLeft;
            }
            if (!isNaN(obj.offsetTop)) {
                offsetTop += obj.offsetTop;
            }
        } while (obj = obj.offsetParent);
        return { left: offsetLeft, top: offsetTop };
    }



    return {

        init: init,
        connect: connectAndSubscribe,
        publishPoint: function (px, py) {
            if (numberconection != null) {


                var pt = new Point(px, py);
                console.info("publishing point at " + pt);
                addPointToCanvas(pt);

                //publicar el evento
                stompClient.send(`/app/newpoint.${numberconection}`, {}, JSON.stringify(pt));
            } else {
                alert("Establesca primero una conexion");
            }
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();