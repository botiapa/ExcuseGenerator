// GLOBAL VARIABLES
const lang = getCookie("lang");
const hash = getCookie("hash");

var PROFILE;

// EVENTS
function onLoad() {
    if(lang) {
        if(lang == 0) {
            document.getElementById("btn_lang_en").style = "display:block;"
            document.getElementById("btn_lang_hu").style = "display:none;"
        }
        else if(lang == 1) {
            document.getElementById("btn_lang_en").style = "display:none;"
            document.getElementById("btn_lang_hu").style = "display:block;"
        }
    }
    if(hash) 
    {
        getProfile((profile) => {
            if(profile) { //Logged in
                PROFILE = profile;
                const avatars = document.getElementsByClassName("avatar");
                for (let img of avatars) {
                    img.src = profile.picture;
                }
                document.getElementById("user").style = "display:block;"
                if(!profile.username) 
                {
                    document.getElementById("register-popup").style = "display:block;"
                }
                else 
                {
                    
                    document.getElementById("username").innerText = profile.username;
                    document.getElementById("email").innerText = profile.email;
    
                    document.getElementById("signInButton").style = "display:none;"
                }
                
            }
            else {
                document.getElementById("signInButton").style = "display:block;"
            }
        })
    }
    generate();
};

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
    if(profilePopupVisible == true && (elementMouseIsOver != document.getElementById("small-avatar") && elementMouseIsOver != document.getElementById('logout-button')))
        toggleProfilePopup();
}

let profilePopupVisible = false;
function toggleProfilePopup() {
    if(!PROFILE || !PROFILE.username)
        return;
    const elem = document.getElementById("profile-popup");
    if(profilePopupVisible)
        elem.style = "display:none;";
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
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
        document.getElementById("output").innerHTML = xhttp.responseText;
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

function changeLanguage(lang) 
{
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