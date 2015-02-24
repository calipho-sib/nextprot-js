var nextprotApiUrl = "https://api.nextprot.org/entry/";

var nextprot = {

  getProteinSequence: function (entry, cb){

    var xmlhttp = new XMLHttpRequest();
    var url = nextprotApiUrl + entry + "/protein-sequence.json";

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        if(cb) cb(JSON.parse(xmlhttp.responseText));
      }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }
}
