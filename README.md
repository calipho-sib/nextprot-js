A javascript library that communicates directly with the nextprot REST api (https://api.nextprot.org)

##Installation 
(or include the nextprot script)
```
bower install nextprot
```

##Usage
Create the client and access the information you need (see the list of methods in here: https://api.nextprot.org)

Example to access the sequence
```
 var Nextprot = window.Nextprot;
  var nx = new Nextprot.Client();

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
