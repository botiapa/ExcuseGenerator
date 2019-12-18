function generate() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
        document.getElementById("output").innerHTML = xhttp.responseText;
        }
    };
    xhttp.open("GET", "/getexcuse", true);
    xhttp.send();
}
function changeLanguage() 
{
    var xhttp = new XMLHttpRequest(lang);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
            generate();
        }
    };
    xhttp.open("GET", "/change_language?lang=" + lang, true);
    xhttp.send();
}
generate();