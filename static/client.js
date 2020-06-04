// GLOBAL VARIABLES
const lang = getCookie("lang");
const hash = getCookie("hash");

var PROFILE;
isOverPopup = false;
profilePopupVisible = false;

// EVENTS

function onLoad() {
    document.getElementById('popup').onmouseover = () => {isOverPopup = true;}
    document.getElementById('popup').onmouseout = () => {isOverPopup = false;}
}


function onLogoutClick() 
{
    var xhttp = new XMLHttpRequest(lang);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            location.reload();
        }
    };
    xhttp.open("POST", "/logout", true);
    xhttp.send();
}

function onBodyClick()
{
    var x = event.clientX, y = event.clientY,
    elementMouseIsOver = document.elementFromPoint(x, y);
    if(profilePopupVisible == true && !isOverPopup && elementMouseIsOver != document.getElementById("small-avatar"))
        toggleProfilePopup();
}

function toggleProfilePopup() {
    const elem = document.getElementById("popup");
    if(profilePopupVisible)
    {
        elem.animate([
            {
                transform: "scale(1)"
            },
            {
                transform: "scale(0)"
            }
        ], 100);
        setTimeout(function() { elem.style = "display:none"; }, 100);
    }
    else
        elem.style = "display:flex;";
    profilePopupVisible = !profilePopupVisible;
}
function register()
{
    const username = document.getElementById("username_input").value;
    var xhttp = new XMLHttpRequest(lang);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            location.reload();
        }
    };
    xhttp.open("POST", "/register?username=" + username, true);
    xhttp.send();
}


// HELPER METHODS
function generate() {
    var xhttp = new XMLHttpRequest();
    var output = document.getElementById("output");
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // If we got the same excuse, refresh
            if(output.innerHTML == xhttp.responseText) {
                generate();
            }
            else {
                output.innerHTML = xhttp.responseText;
            }
        }
    };
    if(lang == 0) // English 
    {
        xhttp.open("GET", "/getexcuse", true);
    }
    else if(lang == 1) // Hungarian 
    {
        xhttp.open("GET", "/getexcuse_hu", true);
    }
    
    xhttp.send();
}
function getProfile(cb)
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200)
            cb(JSON.parse(xhttp.response));
        else if(this.readyState == 4)
            cb(null);
    };
    xhttp.open("GET", "/profile_info", true);
    
    xhttp.send();
}

function switchLanguage()
{
    const lang = getCookie("lang") == 0 ? 1 : 0;
    var xhttp = new XMLHttpRequest(lang);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
            location.reload();
        }
    };
    xhttp.open("GET", "/change_language?lang=" + lang, true);
    xhttp.send();
}

function addExcuse() 
{
    const inp = document.getElementById("inp-excuse").value;
    const selected_lang = document.getElementById("lang-chooser").value;
    if(inp.length > 6) {
        var xhttp = new XMLHttpRequest(lang);
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
               // Typical action to be performed when the document is ready:
               window.location.href = '/profile'
            }
        };
        xhttp.open("POST", "/add?lang=" + selected_lang + "&excuse=" + inp, true);
        xhttp.send();
    }
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}