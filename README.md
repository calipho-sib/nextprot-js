A Javascript SDK that speaks with the neXtprot (www.nextprot.org) api (https://api.nextprot.org) and SPARQL endpoint. These resources are freely available and can be used by anyone to create awsome apps.
Either you are an expert or a novice go ahead and try out the javascript library and don't hesitate to ask us questions if you have some troubles. We will appreciate your feedback.

In this [example](https://cdn.rawgit.com/calipho-sib/nextprot-viewers/v0.1.0/sequence/app/index.html?nxentry=NX_P01308&inputOption=true) you can see what we can achieve with this library.

##Installation 
```
bower install nextprot
```
or include the nextprot script

##Usage
Create the client and access the information you need (see the list of methods in here: https://api.nextprot.org)

Example to access the sequence
```
 var Nextprot = window.Nextprot;
 var applicationName = 'demo app'; //please provide a name for your application
 var clientInfo='calipho group at sib'; //please provide some information about you
  var nx = new Nextprot.Client(applicationName, clientInfo);

 nx.getProteinSequence('NX_P01308').then(function (sequence){
 console.log(sequence);
 }
```

Example to access the overview of a protein
```
 var Nextprot = window.Nextprot;
  var nx = new Nextprot.Client();

  nx.getProteinOverview('NX_P01308').then(function(overview) {
    $("#entryName").text(overview.proteinNames[0].synonymName);
    $("#geneName").text(overview.geneNames[0].synonymName);
    $("#proteinEvidence").text(overview.history.proteinExistence);
  });

```

Some running examples: 
  * http://calipho-sib.github.io/nextprot-js/demo/secondary-structure.html?nxentry=NX_P01308
  * http://calipho-sib.github.io/nextprot-js/demo/overview?nxentry=NX_P01308


## Development

* grunt - concat and creates a bundle
* grunt serve - runs app on web server


## Deployment 

* grunt prod - creates minified and bundled versions in dist folder
* npm test - runs the tests before releasing ! (test runs against production version)
another way to run tests is to do grunt serve and access http://localhost:5000/test

* grunt bump - tags the repository (don't forget to push). The tag is used by bower
* npm publish
