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
    }
}

// connection
var url = "ws://10.10.131.6:5280/";
var connection = null;
var partner;

// buttons
var connectButton1 = document.getElementById("connectButton1");
var connectButton2 = document.getElementById("connectButton2");

// marker state
var isMarked;
var markerLonLat;
var pMarkerLonLat;

//projection
var WGS1984Projection = new OpenLayers.Projection("EPSG:4326"); // WGS 1984
var SMProjection = new OpenLayers.Projection("EPSG:900913"); // Spherical Mercator Projection

connectButton1.onclick = function() {
    connectButton1.disabled =true;
    connectButton2.style.visibility='hidden';
    var username = "test1@myserver.com";
    var password = "1";
	partner= "test2@myserver.com";
    connection = new Strophe.Connection({
        proto : new Strophe.Websocket(url)
    });
    connection.connect(username, password, connectHandler);

    // set up handlers
    connection.addHandler(messageHandler, null, "message", "chat");
    connection.addHandler(pingHandler, "urn:xmpp:ping", "iq", "get");
    connection.addHandler(markerHandler, null, 'message', 'marker');
}

connectButton2.onclick = function() {
    connectButton2.disabled =true;
    connectButton1.style.visibility='hidden';
    var username = "test2@myserver.com";
    var password = "1";
	partner = "test1@myserver.com";
    connection = new Strophe.Connection({
        proto : new Strophe.Websocket(url)
    });
    connection.connect(username, password, connectHandler);

    // set up handlers
    connection.addHandler(messageHandler, null, "message", "chat");
    connection.addHandler(pingHandler, "urn:xmpp:ping", "iq", "get");
    connection.addHandler(markerHandler, null, 'message', 'marker');
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

function markerHandler(message){
    // Receive the message
    var from = message.getAttribute("from");
    var body = "";
    Strophe.forEachChild(message, "body", function(elem) {
        body = elem.textContent;
    });

    var pMarkerLon=parseFloat(body.split(' ')[0], 10);
    var pMarkerLat=parseFloat(body.split(' ')[1], 10);
    pMarkerLonLat = new OpenLayers.LonLat(pMarkerLon,pMarkerLat);
    
    log("Your partner marked at " + pMarkerLonLat);
    pmapMarkers.clearMarkers();
    pmapMarkers.addMarker(new OpenLayers.Marker(pMarkerLonLat));

    if(isMarked){
        log("BOTH MARKED! Distance between two marked points: " + distance(pMarkerLonLat) + " km");
    }

    return true;
    
}

var map;//own map
var pmap//partner map

// markers
var mapMarkers;
var pmapMarkers;
	
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

    //Markers
    mapMarkers = new OpenLayers.Layer.Markers( "mapMarkers" );
    map.addLayer(mapMarkers);
    pmapMarkers = new OpenLayers.Layer.Markers( "pmapMarkers" );
    pmap.addLayer(pmapMarkers);

    isMarked = false;

    map.events.register("click", map, function(e) {
        //var position = this.events.getMousePosition(e);
        var position = map.getLonLatFromPixel(e.xy);
        markerLonLat = new OpenLayers.LonLat(position.lon,position.lat);
        var size = new OpenLayers.Size(21,25);
        var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
        var icon = new OpenLayers.Icon('images/mark.png', size, offset);   

        mapMarkers.clearMarkers();
        mapMarkers.addMarker(new OpenLayers.Marker(position));

        isMarked = true;

        var message = $msg({
            to : partner,
            type : "marker"
        }).c("body").t(markerLonLat.lon + " " + markerLonLat.lat);
        connection.send(message);
        log("Send mark: "+markerLonLat.lon + " " + markerLonLat.lat);

    });

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
	}).c("body").t(Longitude+' '+Latitude+' '+zoom+" ");
	connection.send(message);
	log("Send latitude, longitue, zoom: "+Latitude+" "+Longitude+" "+zoom);
} 

// calculate distance
function distance(pMarkerLonLat){

    var transformLonLat1 = markerLonLat.transform(SMProjection, WGS1984Projection);
    var transformLonLat2 = pMarkerLonLat.transform(SMProjection, WGS1984Projection);
    log("PARTNER" + transformLonLat1 + " MINE " + transformLonLat2);

    var R = 6371; // Radius of the earth in km
    var dLat = (transformLonLat2.lat - transformLonLat1.lat) * Math.PI / 180;  // deg2rad below
    var dLon = (transformLonLat2.lon - transformLonLat1.lon) * Math.PI / 180;
    log(dLat + ";" + dLon + ";" + Math.PI);
    var a = 0.5 - Math.cos(dLat)/2 + Math.cos(transformLonLat1.lat * Math.PI / 180) * Math.cos(transformLonLat2.lat * Math.PI / 180) * (1 - Math.cos(dLon))/2;
    log("a="+a);
    var d = R * 2 * Math.asin(Math.sqrt(a));
    return d;

}