function onVerifyClick(element) {
    var rowElement = element.parentElement.parentElement;
    var ID = rowElement.firstChild.firstChild.data;
    var verified = rowElement.children[3].firstChild.data == "✓" ? true : false;
    var xhttp = new XMLHttpRequest(lang);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            location.reload();
        }
    };
    xhttp.open("POST", "/verify?ID=" + ID + "&verified=" + verified, true);
    xhttp.send();
}
function onDeleteClick(element) {
    var rowElement = element.parentElement.parentElement;
    var ID = rowElement.firstChild.firstChild.data;
    var xhttp = new XMLHttpRequest(lang);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            location.reload();
        }
    };
    xhttp.open("POST", "/delete?ID=" + ID, true);
    xhttp.send();
}