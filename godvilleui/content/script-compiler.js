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
    var script;
    if (godvilleui_gmCompiler.isGreasemonkeyable(href)) {
        if (/http:\/\/godville\.net\/hero.*/.test(href)) {
            script = godvilleui_gmCompiler.getUrlContents('chrome://godvilleui/content/jquerymin.js' );
            script += godvilleui_gmCompiler.getUrlContents('chrome://godvilleui/content/phrases.js' );
            script += godvilleui_gmCompiler.getUrlContents('chrome://godvilleui/content/script.js' );
            godvilleui_gmCompiler.injectScript(script, unsafeWin, doc);
        }

        if (/http:\/\/godville\.net\/user\/profile.*/.test(href)) {
            script = godvilleui_gmCompiler.getUrlContents( 'chrome://godvilleui/content/jquerymin.js' );
            script += godvilleui_gmCompiler.getUrlContents( 'chrome://godvilleui/content/phrases.js' );
            script += godvilleui_gmCompiler.getUrlContents( 'chrome://godvilleui/content/options-page.js' );
            script += godvilleui_gmCompiler.getUrlContents( 'chrome://godvilleui/content/options.js' );
            godvilleui_gmCompiler.injectScript(script, unsafeWin, doc);
        }
    }
},

injectScript: function(script, unsafeContentWin, doc) {
	// add our own APIs
    unsafeContentWin.GM_log=function(msg) { try { unsafeContentWin.console.log('GM_log: '+msg); } catch(e) {} };
	unsafeContentWin.GM_addStyle=function(css) { godvilleui_gmCompiler.addStyle(doc, css) };
	unsafeContentWin.GM_registerMenuCommand=function(){};
	unsafeContentWin.GM_log=function(){};
	unsafeContentWin.GM_getResourceURL=function(resname){return 'chrome://godvilleui/content/' + resname};
	unsafeContentWin.GM_getResourceText=function(res){
        return godvilleui_gmCompiler.getUrlContents('chrome://godvilleui/content/' + res);
    };
    unsafeContentWin.GM_getResourceImageAsURL=function(res){
        return window.URL.createObjectURL('chrome://godvilleui/content/' + res);
    };
    var head = doc.getElementsByTagName('head')[0];
    var scr1 = doc.createElement('script');
    scr1.type = 'text/javascript';
    scr1.innerHTML = script;
    scr1.id = 'GodvilleUI';
    head.appendChild(scr1);
},

addStyle:function(doc, css) {
	var head, style;
	head = doc.getElementsByTagName('head')[0];
	if (!head) { return; }
	style = doc.createElement('style');
	style.type = 'text/css';
	style.innerHTML = css;
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