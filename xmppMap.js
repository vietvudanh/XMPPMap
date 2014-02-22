//This used the example All Overlays with Google and OSM by OpenLayer 
//and the example from chapter 4 of the Book The Definitive Guide to HTML5 WebSocket
var output = document.getElementById("output");
function log(message) {
    var line = document.createElement("div");
    line.textContent = message;
    output.appendChild(line);
}

function connectHandler(cond) {
    if (cond == Strophe.Status.CONNECTED) {
        log("Connected! You could start using shared map now!");
        // Determine the partner base on the username
        connection.send($pres());
        var username = document.getElementById("username").value;
        if (username == "test1@myserver.com")
	   	   partner = "test2@myserver.com";
	    else
	   	   partner = "test1@myserver.com";
    }
}

var url = "ws://10.10.131.6:5280/";
var connection = null;
var partner;

var connectButton = document.getElementById("connectButton");
connectButton.onclick = function() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    connection = new Strophe.Connection({
        proto : new Strophe.Websocket(url)
    });
    connection.connect(username, password, connectHandler);

    // set up handlers
    connection.addHandler(messageHandler, null, "message", "chat");
    connection.addHandler(pingHandler, "urn:xmpp:ping", "iq", "get");
}

function messageHandler(message) {
	// Receive the message
    var from = message.getAttribute("from");
    var body = "";
    Strophe.forEachChild(message, "body", function(elem) {
        body = elem.textContent;
    });
	// Change the partner's display map base on the information received
	var lon=parseFloat(body.split(' ')[0], 10);
	var lat=parseFloat(body.split(' ')[1], 10);
	var zoom=parseInt(body.split(' ')[2], 10);
	var lonlat = new OpenLayers.LonLat(lon,lat);
	pmap.setCenter(lonlat,zoom,false,false);
	log("Your partner latidute, longitude, zoom: "+lat+" "+lon+" "+zoom);
   
    // indicate that this handler should be called repeatedly
    return true;
}

function pingHandler(ping) {
    var pingId = ping.getAttribute("id");
    var from = ping.getAttribute("from");
    var to = ping.getAttribute("to");

    var pong = $iq({
        type : "result",
        "to" : from,
        id : pingId,
        "from" : to
    });
    connection.send(pong);

    // indicate that this handler should be called repeatedly
    return true;
}
var map;//own map
var pmap//partner map
	
function initMap() {
	//Initialize the maps
    map = new OpenLayers.Map({
        div: "map",
        allOverlays: true
    });
    pmap = new OpenLayers.Map({
        div: "pmap",
        controls: []
    });
	//Creat layers to display
    var osm = new OpenLayers.Layer.OSM();
    var posm = new OpenLayers.Layer.OSM();
    
    // Add the layers to the maps
    map.addLayers([osm]);
    pmap.addLayers([posm]);

    // Add listener
    map.zoomToMaxExtent();
    pmap.zoomToMaxExtent();
    map.events.register('moveend', map, handleEndMove);
    
}

function handleEndMove(e){
	// Set the map at the initial status if no connection established
	if (connection==null){
		map.setCenter(new OpenLayers.LonLat(0,78271.516953249),1,false,false);
		alert("Connection error! Please log in or check you connection!");
	}
	//Get information of change 
	var lonlat=map.getCenter();

	Longitude = lonlat.lon
	Latitude  = lonlat.lat
	zoom = map.getZoom()
	//Send information over XMPP to partner
	var message = $msg({
	    to : partner,
	    type : "chat"
	}).c("body").t(Longitude+' '+Latitude+' '+zoom);
	connection.send(message);
	log("Send latitude, longitue, zoom: "+Latitude+" "+Longitude+" "+zoom);
} 
