var godvilleui_gmCompiler={

// getUrlContents adapted from Greasemonkey Compiler
// http://www.letitblog.com/code/python/greasemonkey.py.txt
// used under GPL permission
//
// most everything else below based heavily off of Greasemonkey
// http://greasemonkey.devjavu.com/
// used under GPL permission

getUrlContents: function(aUrl){
	var	ioService=Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);
	var	scriptableStream=Components
		.classes["@mozilla.org/scriptableinputstream;1"]
		.getService(Components.interfaces.nsIScriptableInputStream);
	var unicodeConverter=Components
		.classes["@mozilla.org/intl/scriptableunicodeconverter"]
		.createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
	unicodeConverter.charset="UTF-8";

	var	channel=ioService.newChannel(aUrl, "UTF-8", null);
	var	input=channel.open();
	scriptableStream.init(input);
	var	str=scriptableStream.read(input.available());
	scriptableStream.close();
	input.close();

	try {
		return unicodeConverter.ConvertToUnicode(str);
	} catch (e) {
		return str;
	}
},

contentLoad: function(e) {
	var unsafeWin=e.target.defaultView;
    var doc = e.target;
	if (unsafeWin.wrappedJSObject) unsafeWin=unsafeWin.wrappedJSObject;

	var unsafeLoc=new XPCNativeWrapper(unsafeWin, "location").location;
	var href=new XPCNativeWrapper(unsafeLoc, "href").href;
    var head = doc.getElementsByTagName('head')[0];
    var script;
    if (/http:\/\/godville\.net\/hero.*/.test(href) || /file:\/\/\/.*Godville_page.*/.test(href)) {
        godvilleui_gmCompiler.createScript(doc, 'chrome://godvilleui/content/jquerymin.js');
        godvilleui_gmCompiler.createScript(doc, 'chrome://godvilleui/content/phrases.js');
        godvilleui_gmCompiler.createScript(doc, 'chrome://godvilleui/content/gm_func.js');
        godvilleui_gmCompiler.createScript(doc, 'chrome://godvilleui/content/script.js');
    }
    if (/http:\/\/godville\.net\/user\/profile.*/.test(href)) {
        godvilleui_gmCompiler.createScript(doc, 'chrome://godvilleui/content/jquerymin.js' );
        godvilleui_gmCompiler.createScript(doc, 'chrome://godvilleui/content/phrases.js' );
        godvilleui_gmCompiler.createScript(doc, 'chrome://godvilleui/content/gm_func.js');
        godvilleui_gmCompiler.createScript(doc, 'chrome://godvilleui/content/options-page.js' );
        godvilleui_gmCompiler.createScript(doc, 'chrome://godvilleui/content/options.js' );
    }
},

createScript:function(doc, uri){
    var head = doc.getElementsByTagName('head')[0];
    var scr1 = doc.createElement('script');
    scr1.type = 'text/javascript';
    scr1.src = uri;
//    scr1.id = 'GodvilleUI';
    head.appendChild(scr1);
},

addStyle:function(doc, css, id) {
	var head, style;
	head = doc.getElementsByTagName('head')[0];
	if (!head) { return; }
	style = doc.createElement('style');
	style.type = 'text/css';
	style.innerHTML = css;
    if (id) style.id = id;
	head.appendChild(style);
},

addStyleURI:function(doc, uri, id) {
    var head, style;
    head = doc.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = doc.createElement('link');
    style.type = 'text/css';
	style.href = uri;
    style.rel = 'stylesheet';
    style.media = 'screen';
    if (id) style.id = id;
    head.appendChild(style);
},

onLoad: function() {
	var	appcontent=window.document.getElementById("appcontent");
	if (appcontent && !appcontent.greased_godvilleui_gmCompiler) {
		appcontent.greased_godvilleui_gmCompiler=true;
		appcontent.addEventListener("DOMContentLoaded", godvilleui_gmCompiler.contentLoad, false);
	}
},

onUnLoad: function() {
	//remove now unnecessary listeners
	window.removeEventListener('load', godvilleui_gmCompiler.onLoad, false);
	window.removeEventListener('unload', godvilleui_gmCompiler.onUnLoad, false);
	window.document.getElementById("appcontent")
		.removeEventListener("DOMContentLoaded", godvilleui_gmCompiler.contentLoad, false);
}

};
window.addEventListener('load', godvilleui_gmCompiler.onLoad, false);
window.addEventListener('unload', godvilleui_gmCompiler.onUnLoad, false);