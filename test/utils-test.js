/**
 * Created by fnikitin on 18/09/15.
 */
'use strict';


var readJSON = function (url) {
  
  var xhr = new XMLHttpRequest();
  var json = null;
  
  xhr.open("GET", url, false);
  
  xhr.onload = function (e) {
    if (xhr.status === 200) {
      json = JSON.parse(xhr.responseText);
    }
    
    else {
      console.error('readJSON', url, xhr.statusText);
    }
  };
  
  xhr.onerror = function (e) {
    console.error('readJSON', url, xhr.statusText);
  };
  
  xhr.send(null);
  return json;
};


describe("Testing peptide computations", function() {

    it("one included peptide is included in other (same starting point)", function() {

        var overview = readJSON("./test/resources/NX-P01308.overview.json");
        console.log(overview);
        //NXUtils.getRecommendedName(overview);
        
    });

 });