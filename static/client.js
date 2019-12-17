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
generate();