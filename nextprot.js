
var nx = new nextprot();

function nextprot() {

  this.nextprotApiUrl = "https://api.nextprot.org/entry/";

  //Util methods

  this.getURLParameter = function (name){
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  //Gets the entry set in the parameter
  this.getEntryName = function(){
    return this.getURLParameter("nxentry") || 'NX_P01308'; //By default returns the insulin
  }



  this.callURL = function (context, cb){

    var xmlhttp = new XMLHttpRequest();
    var url = this.nextprotApiUrl + this.getEntryName() + "/" + context + ".json";

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        if(cb) cb(JSON.parse(xmlhttp.responseText));
      }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();

  }

  this.getProteinSequence = function(cb) {
    return this.callURL("protein-sequence", function (data){
      if(cb) cb(data.entry.isoforms[0].sequence);
    });
  };

  this.getProteinOverview = function(cb) {
    return this.callURL("overview", function (data){
      if(cb) cb(data.entry.overview);
    });
  };


  this.getSecondaryStructure = function(cb) {
    return this.callURL("secondary-structure", function (data){
      if(cb) cb(data.entry.annotations);
    });
  };

}
