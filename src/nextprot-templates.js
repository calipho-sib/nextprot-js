var loadOverview = function(overview,nxEntryName){

    if ($("#nx-overview").length > 0) {
        Handlebars.registerHelper('link_to', function (type, options) {
            switch (type) {
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

        console.log(nxEntryName);

        var data = {
            "entryName": overview.proteinNames[0].synonymName,
            "alternativeName": overview.proteinNames[0].synonyms,
            "geneName": overview.geneNames[0].synonymName,
            "cleavage": overview.cleavedRegionNames,
            "family": overview.families,
            "proteineEvidence": overview.history.proteinExistence.split('_').join(' ').toLowerCase(),
            "integDate": overview.history.formattedNextprotIntegrationDate,
            "lastUpdate": overview.history.formattedNextprotUpdateDate,
            "version": overview.history.uniprotVersion,
            "UniprotIntegDate": overview.history.formattedUniprotIntegrationDate,
            "UniprotLastUpdate": overview.history.formattedUniprotUpdateDate,
            "seqVersion": overview.history.sequenceVersion,
            "accessionNumber": nxEntryName
        };

        console.log(data);

        var template = HBtemplates['overviewProtein.tmpl'];
        var result = template(data);
        $("#nx-overview").append(result);

        $("#extender").click(function (event) {
            event.stopPropagation();
            //var isScrollbarActiveAtFirst= $(window).hasVerticalScrollBar();
            $("#INFOS-FULL").toggle("slow");
            $("#INFOS-LESS").toggle("slow");
            //var isScrollbarActiveAtEnd= $(window).hasVerticalScrollBar();
            //if ((isScrollbarActiveAtFirst) && isScrollbarActiveAtFirst !== isScrollbarActiveAtEnd) {
            //    $(body).removeClass("ignoreShift");
            //}
            //else if ((isScrollbarActiveAtFirst === false) && isScrollbarActiveAtFirst !== isScrollbarActiveAtEnd) {
            //    $(body).addClass("ignoreShift");
            //}
            $(this).text(function (i, text) {
                return text === "Extend overview" ? "Collapse overview" : "Extend overview";
            });
        });
    }

};