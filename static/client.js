//GLOBAL VARIABLES
let lang;


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

function onLoad() {
    lang = getCookie("lang");
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
    generate();
};

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