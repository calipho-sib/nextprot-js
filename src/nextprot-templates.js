$( document ).ready(function() {
    (function(){

        var Nextprot = window.Nextprot;
        var nx = new Nextprot.Client();

        if($("#nx-overview").length > 0){


            nx.getProteinOverview().then(function (overview){
                console.log("calling api for the overview" + overview);

                Handlebars.registerHelper('link_to', function(type,options) {
                    switch(type) {
                        case "family":
                            var url = "http://www.nextprot.org/db/term/" + this.accession;
                            return "<a href='" + url + "'>" + this.name.slice(0, -7) + "</a>";
                        case "history":
                            console.log(type);
                            console.log(this);
                            var url = "http://www.uniprot.org/uniprot/" + this.slice(3) + "?version=*";
                            return "<a href='" + url + "'>Complete UniprotKB history</a>";
                    }
                });

                console.log(nx.getEntryName());

                var data= {
                    "entryName": overview.proteinNames[0].synonymName,
                    "geneName": overview.geneNames[0].synonymName,
                    "cleavage" : overview.cleavedRegionNames,
                    "family" : overview.families,
                    "proteineEvidence":overview.history.proteinExistence.split('_').join(' ').toLowerCase(),
                    "integDate": overview.history.formattedNextprotIntegrationDate,
                    "lastUpdate": overview.history.formattedNextprotUpdateDate,
                    "version" : overview.history.uniprotVersion,
                    "UniprotIntegDate" : overview.history.formattedUniprotIntegrationDate,
                    "UniprotLastUpdate" : overview.history.formattedUniprotUpdateDate,
                    "seqVersion" : overview.history.sequenceVersion,
                    "accessionNumber" : nx.getEntryName()
                };

                console.log(data);
                var source = "<div id=\"proteinTitle\">" +
                    "<button id=\"extender\" class=\"btn btn-default\" style=\"float:right\">Extend overview</button>" +
                    "<h2>{{entryName}}</h2>" +
                    "</div>" +
                    "<div id=\"INFOS-LESS\" style=\"display:block\">" +
                    "{{#if cleavage}}<div id=\"cleavage-less\" class=\"row\">" +
                    "<div class=\"col-md-2\" style=\"color: grey;text-align:right\">Cleaved into :</div>" +
                    "<div class=\"col-md-6\">{{#cleavage}}<span>{{synonymName}}, </span>{{/cleavage}}</div>" +
                    "</div>{{/if}}" +
                    "<div id=\"gene-less\" class=\"row\">" +
                    "<div class=\"col-md-2\" style=\"color: grey;text-align:right\">Gene Name :</div>" +
                    "<div class=\"col-md-6\">{{geneName}}</div>" +
                    "</div>" +
                    "<div id=\"family-less\" class=\"row\">" +
                    "<div class=\"col-md-2\" style=\"color: grey;text-align:right\">Family Name :</div>" +
                    "<div class=\"col-md-6\">{{#family}}<span>{{{link_to \"family\"}}}</span>{{/family}}</div>" +
                    "</div></div>" +
                    "<div id=\"INFOS-FULL\" style=\"display:none\">" +
                    "<div id=\"gene-full\" class=\"row\">" +
                    "<div class=\"col-md-2 text-uppercase\" style=\"color: grey;\">Gene Name</div>" +
                    "<div class=\"col-md-6\">" +
                    "<dl><dt>Recommended Name</dt><dd> {{geneName}}</dd>" +
                    "{{#if cleavage}}<dt>Cleaved into the following {{cleavage.length}} chains </dt>" +
                    "{{#cleavage}}<dd>{{synonymName}}</dd>{{/cleavage}}{{/if}}</dl>" +
                    "</div></div>" +
                    "<div id=\"family-full\" class=\"row\">" +
                    "<div class=\"col-md-2 text-uppercase\" style=\"color: grey;\">Family</div>" +
                    "<div class=\"col-md-6\">" +
                    "<dl><dt>Family</dt>{{#family}}<dd>{{{link_to \"family\"}}}</dd>{{/family}}</dl>" +
                    "</div></div>" +
                    "<div id=\"History-full\" class=\"row\">" +
                    "<div class=\"col-md-2 text-uppercase\" style=\"color: grey;\">History</div>" +
                    "<div class=\"col-md-6\">" +
                    "<dl><dt>NeXtProt</dt><dd>Integrated {{integDate}}</dd>" +
                    "<dd>Last Updated {{lastUpdate}}</dd>" +
                    "<dt>UniprotKB</dt><dd>Entry version {{version}}</dd>" +
                    "<dd>Integration Date {{UniprotIntegDate}}</dd>" +
                    "<dd>Last Update {{UniprotLastUpdate}}</dd>" +
                    "<dd>Sequence version {{seqVersion}}</dd>" +
                    "<dd>{{#accessionNumber}}{{{link_to \"history\"}}}{{/accessionNumber}}</dd></dl>" +
                    "</div></div></div>" +
                    "<p style=\"margin:10px 10px;\">Entry whose protein(s) existence is based on {{proteineEvidence}}</p>";

                var template = Handlebars.compile(source);
                var result = template(data);
                $("#nx-overview").append(result);

                $("#extender").click(function(){
                    $("#INFOS-FULL").toggle("slow");
                    $("#INFOS-LESS").toggle("slow");
                    $(this).text(function(i, text) {
                        return text === "Extend overview" ? "Collapse overview" : "Extend overview";
                    });
                });
            });

        }
    }());
});