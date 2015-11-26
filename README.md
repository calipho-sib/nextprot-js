# neXtProt-js

A Javascript SDK that speaks with the neXtprot (www.nextprot.org) api (https://api.nextprot.org) and SPARQL endpoint. These resources are freely available and can be used by anyone to create awesome apps.

[![Build Status](https://travis-ci.org/calipho-sib/nextprot-js.svg?branch=develop)](https://travis-ci.org/calipho-sib/nextprot-js)


Either you are an expert or a novice go ahead and try out the javascript library and don't hesitate to ask us questions if you have some troubles. We will appreciate your feedback.

In this [example](https://cdn.rawgit.com/calipho-sib/nextprot-viewers/v0.1.0/sequence/app/index.html?nxentry=NX_P01308&inputOption=true) you can see what we can achieve with this library.

## Installation 
If you are familiarized with bower
```
bower install nextprot
```

##### Or include the nextprot script via CDN (specify release version)

Without external dependencies :
```javascript
<script src="https://cdn.rawgit.com/calipho-sib/nextprot-js/v0.0.51/dist/nextprot.min.js"></script>
```
With external dependencies (jQuery, Handlebars(optionnal) ) :
```javascript
<script src="https://cdn.rawgit.com/calipho-sib/nextprot-js/v0.0.51/dist/nextprot.bundle.js"></script>
```


##Usage
Create the nextprot client  
```javascript
 var applicationName = 'demo app'; //please provide a name for your application
 var clientInfo='calipho group at sib'; //please provide some information about you
 var nx = new Nextprot.Client(applicationName, clientInfo);
```

Request the protein part of interest (see the list of methods in here: https://api.nextprot.org)
Example to access the sequence
```javascript
 nx.getProteinSequence('NX_P01308').then(function (sequence){
  console.log(sequence);
 }
```

Example to access the overview of a protein
```javascript

  nx.getProteinOverview('NX_P01308').then(function(overview) {
    $("#entryName").text(overview.proteinNames[0].synonymName);
    $("#geneName").text(overview.geneNames[0].synonymName);
    $("#proteinEvidence").text(overview.history.proteinExistence);
  });

```

Example to run a query against nextprot SPARQL
```javascript
   var query = 'SELECT ?pe count(?entry) as ?cnt ' +
        'WHERE {?entry :existence ?pe} group by ?pe order by desc(?cnt)';

    //Execute the sparql and print result
    nx.executeSparql(query).then(function (data) {
        data.results.bindings.forEach(function (o) {
            console.log(o.pe.value, ": ", o.cnt.value);
        });
    });
```
A running example : 
  * http://calipho-sib.github.io/nextprot-js/demo/index.html?nxentry=NX_P01308


## Development

* grunt - concat and creates a bundle
* grunt serve - runs app on web server


## Deployment 

* grunt prod - creates minified and bundled versions in dist folder
* npm test - runs the tests before releasing ! (test runs against production version)
another way to run tests is to do grunt serve and access http://localhost:5000/test

* grunt bump - On master branch only. tags the repository (don't forget to push). The tag is used by bower
* npm publish
