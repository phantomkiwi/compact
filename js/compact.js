/* on document dom ready */
var domReady = function(a,b,c){b=document,c='addEventListener';b[c]?b[c]('DOMContentLoaded',a):window.attachEvent('onload',a)}
domReady(function () {
//docReady(function() {
        
        // globals
        var listnerCount = 0;
        var vdom ='';
        var tempvdom ='';
        if (typeof oldUrl == 'undefined') { var oldUrl = window.location.pathname; }
        // create a basic virtual dom
        document.getElementsByTagName('body')[0].innerHTML = document.getElementsByTagName('body')[0].innerHTML;
        vdom = document.getElementsByTagName('body')[0].innerHTML.split("\n");
        window.history.replaceState(oldUrl, "", oldUrl);

        /* create listener on a:href and POST */
        var newvdom = '';
        var elements = document.getElementsByTagName("a");
        for(var i = 0, len = elements.length; i < len; i++) {
            elements[i].addEventListener("click", function (event) { 
                /* override a:href and send ajax to server for json return data */
                event.preventDefault();
                listnerCount++;
                window.history.pushState(this.getAttribute("href"), "", this.getAttribute("href"));
                pullPage(this,'get');
            }, false);
        }
        var elements = document.getElementsByTagName("form");
        for(var i = 0, len = elements.length; i < len; i++) {
            elements[i].addEventListener("submit", function (event) { 
                /* override POST and send ajax to server for json return data */
                event.preventDefault();
                listnerCount++;
                //window.history.pushState(this.getAttribute("action"), "", this.getAttribute("action"));
                pullPage(this,'post');
/*
var data = new FormData();
data.append('user', 'person');
data.append('pwd', 'password');
data.append('organization', 'place');
data.append('requiredkey', 'key');

var xhr = new XMLHttpRequest();
xhr.open('POST', '/page3', true);
//xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onreadystatechange = function() {
    if(xhr.readyState === 4) {
        console.log('XHR: Dispatched');
        if(xhr.status === 200) {
    // do something to response
    console.log(this.responseText);
        }
    }
};
xhr.send(data);
*/
            }, false);
        }

        /* Fires when the user goes back or forward in the history. */
        window.onpopstate = function(e) {

            if (e.state != null) {
                var a = document.createElement('a');
                a.href = e.state;
                pullPage(a,'get');
            }
        }

        /* fetch the json feed from the server which provides dom update data */
        function pullPage(element,method) {
            var xhr = new XMLHttpRequest();
            var json = {};
            // fakes the browser page loading icon for an ajax request by loading a hidden iframe
            var iloading = document.createElement('iframe');
            iloading.style.display = "none";
            document.body.appendChild(iloading);
            iloading.contentDocument.open();
            if (method=='get') {
                xhr.open('get', 'ajax?new='+element.getAttribute("href")+'&old='+oldUrl, true);
                //xhr.setRequestHeader('Content-Type', 'application/json');
            }
            if (method=='post') {
                xhr.open('POST', 'ajax?new='+element.getAttribute("action")+'&old='+oldUrl, true);
                var formData  = new FormData(element);
            }
            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4) {
                    console.log('XHR: Dispatched');
                    if(xhr.status === 200) {

                        if (method=='get') {
                            oldUrl = element.getAttribute("href");
                        } else if (method=='post') {
                            oldUrl = element.getAttribute("action");
                        }

                        //console.log(xhr.responseText);
                        var json = JSON.parse(xhr.responseText);

                        var x = 1;
                        tempvdom = vdom;
                        for (var key in json) {
                            if (json.hasOwnProperty(key)) {
                                if(json[key].type=="ins") {
                                    tempvdom.splice(json[key].line, 0, json[key].txt);
                                }
                                if(json[key].type=="del") {
                                    tempvdom.splice(json[key].line, 1);
                                }
                                x = x+1;
                            }
                        }

                        var vdomHTML = '';
                        tempvdom.forEach(function(entry) {
                            vdomHTML = vdomHTML+entry+"\n";
                        });

                        /* vdom needs to be updated to the latest dom (after update) others it would be using an old outdate dom */
                        vdom = tempvdom;
                        /* clear temp dom storage */
                        tempvdom = '';

                        /* Mutation Events is deprecated but need to support IE < 11. otherwise recode to use MutationObserver */
                        /* Re add event listeners on DOM update otherwise they wont be fired */
                        if (listnerCount<2) { /* forces the listner to only run once */
                                document.getElementsByTagName('body')[0].addEventListener("DOMSubtreeModified", function () {
                                    var elements = document.getElementsByTagName("a");
                                    for(var i = 0, len = elements.length; i < len; i++) {
                                        elements[i].addEventListener("click", function (event) { 
                                            /*console.log('listner:'+listnerCount);*/
                                            event.preventDefault();
                                            listnerCount++;
                                            window.history.pushState(this.getAttribute("href"), "", this.getAttribute("href"));
                                            pullPage(this,'get');
                                        }, false);
                                    }
                                    elements = document.getElementsByTagName("form");
                                    for(var i = 0, len = elements.length; i < len; i++) {
                                        elements[i].addEventListener("submit", function (event) { 
                                            /*console.log('listner:'+listnerCount);*/
                                            event.preventDefault();
                                            listnerCount++;
                                            //window.history.pushState(this.getAttribute("action"), "", this.getAttribute("action"));
                                            pullPage(this,'post');
                                        }, false);
                                    }

                                }, false);
                        }
                        iloading.contentDocument.close();
                        document.getElementsByTagName('body')[0].innerHTML = vdomHTML;

                       /* loop through and find script tags and add to head or excute with eval if no src */
                        var scripts = Array.prototype.slice.call(document.getElementsByTagName('body')[0].getElementsByTagName("script"));
                        for (var i = 0; i < scripts.length; i++) {
                            if (scripts[i].src != "") {
                                var tag = document.createElement("script");
                                tag.src = scripts[i].src;
                                document.getElementsByTagName("head")[0].appendChild(tag);
                            }
                            else {
                                eval(scripts[i].innerHTML);
                            }
                        }

                    } else {
                        console.log('Error: ' +  xhr.status + ' ' + xhr.statusText);
                    }
                }
            }
            xhr.send(formData);
            /*
            var data = new FormData();
            data.append('user', 'person');
            data.append('pwd', 'password');
            data.append('organization', 'place');
            data.append('requiredkey', 'key');
            xhr.send("fname=Henry&lname=Ford");
            */

        }

    /* end on document update */
});