
var nx = new nextprot();

function nextprot() {

  this.nextprotApiUrl = "https://api.nextprot.org/entry/";

  //Util methods

  this._getURLParameter = function (name){
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  //Gets the entry set in the parameter
  this.getEntryName = function(){
    return this._getURLParameter("nxentry") || 'NX_P01308'; //By default returns the insulin
  }

  //private method, convention use an underscore
  this._callURL = function (context){

    var me = this;

    return new Promise(function(resolve, reject) {

      var req = new XMLHttpRequest();
      var url = me.nextprotApiUrl + me.getEntryName() + "/" + context + ".json";
      req.open("GET", url);

      req.onload = function() {
        // This is called even on errors so check the status
        if (req.status == 200) {
          resolve(JSON.parse(req.responseText));
        }else {
          reject(Error(req.statusText));
        }
      }

      // Handle network errors
      req.onerror = function() {
        reject(Error("Network Error"));
      };

      // Make the request
      req.send();
    });
  }


  this.getProteinOverview = function() {
    return this._callURL("overview").then(function (data){
      return data.entry.overview;
    });
  }

  this.getProteinSequence = function() {
    return this._callURL("protein-sequence").then(function (data){
      return data.entry.isoforms[0].sequence;
    });
  };

  this.getSecondaryStructure = function() {
    return this._callURL("secondary-structure").then(function (data){
      return data.entry.annotations;
    });
  };

}
