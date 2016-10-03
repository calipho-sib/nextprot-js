$(function () {

    var loadOverview = function (overview, nxEntryName, nxUrl) {
        if ($("#nx-overview").length > 0) {
            Handlebars.registerHelper('link_to', function (type, options) {
                switch (type) {
                case "term":
                    var url = nxUrl + "/term/" + this.accession;
                    return "<a href='" + url + "' class='extLink'>" + this.name + "</a>";
                case "EC":
                    var url = nxUrl + "/term/" + this;
                    return "<a target='_blank' href='" + url + "'> EC " + this + " </a>";
                case "history":
                    var url = "http://www.uniprot.org/uniprot/" + this.slice(3) + "?version=*";
                    return "<a target='_blank' class='extLink' href='" + url + "'>Complete UniProtKB history</a>";
                }
            });
            Handlebars.registerHelper('plural', function (array, options) {
                return array.length > 1 ? "s" : "";
            });

            var EC = [];
            var short = [];

            if (overview.recommendedProteinName.synonyms) {
                overview.recommendedProteinName.synonyms.forEach(function (p) {
                    if (p.qualifier === "short") short.push(p.name);
                });
                if (short.length) short.sort(NXUtils.sortByAlphabet);
            }
            if (overview.recommendedProteinName.otherRecommendedEntityNames) {
                overview.recommendedProteinName.otherRecommendedEntityNames.forEach(function (p) {
                    if (p.qualifier === "EC") EC.push(p.name);
                });
                if (EC.length) EC.sort(NXUtils.sortByAlphabet);
            }

            var recommendedProteinSynonyms = NXUtils.getSynonyms(overview.recommendedProteinName.synonyms);

            var isonames = overview.isoformNames;

            var data = {
                "entryName": overview.recommendedProteinName.name,
                "recommendedProteinName": {
                    synonyms: recommendedProteinSynonyms,
                    name: overview.recommendedProteinName.name,
                    EC: EC,
                    short: short,
                    mainSynonymName: overview.proteinNames[0].synonyms ? NXUtils.getMainSynonym(overview.proteinNames[0].synonyms) : null,
                    mainShortName: recommendedProteinSynonyms.short ? NXUtils.getMainShort(recommendedProteinSynonyms.short) : null,
                    others: NXUtils.getAlternativeNames(overview.alternativeProteinNames).filter(function (t) {
                        return t.type !== "EC" && t.type !== "full" && t.type !== "Alternative names" && t.type !== "Alternative name"
                    })
                },
                "alternativeProteinNames": NXUtils.getAlternativeNames(overview.alternativeProteinNames),
                "geneName": overview.geneNames ? overview.geneNames.map(function (gn) {
                    return {
                        name: NXUtils.getRecommendedName(gn) || null,
                        synonyms: gn.synonyms ? gn.synonyms.filter(function (gns) {
                            return gns.category === "gene name"
                        }).sort(NXUtils.sortByAlphabet) : null,
                        orf: NXUtils.getORFNames(gn) || null
                    }
                }).sort(NXUtils.sortByAlphabet) : null,
                "cleavage": NXUtils.getAlternativeNames(overview.cleavedRegionNames),
                "isoforms": NXUtils.getIsoforms(isonames),
                "functionalRegionNames": NXUtils.getAlternativeNames(overview.functionalRegionNames),
                "families": overview.families.map(function (f) {
                    return NXUtils.getFamily(f, {})
                }),
                "proteineEvidence": NXUtils.getProteinExistence(overview.proteinExistence),
                "proteineEvidenceCaution": overview.proteinExistenceInfo,
                "integDate": overview.history.formattedNextprotIntegrationDate,
                "lastUpdate": overview.history.formattedNextprotUpdateDate,
                "UniprotIntegDate": overview.history.formattedUniprotIntegrationDate,
                "UniprotLastUpdate": overview.history.formattedUniprotUpdateDate,
                "version": overview.history.uniprotVersion,
                "seqVersion": overview.history.sequenceVersion,
                "lastSeqUpdate": overview.history.lastSequenceUpdate,
                "accessionNumber": nxEntryName
            };

            var template = HBtemplates['templates/overviewProtein.tmpl'];
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
    if ($("#nx-overview").length > 0) { // load the overview if it exists
        var Nextprot = window.Nextprot;
        var nx = new Nextprot.Client("neXtprot overview loader", "Calipho Group");
        var nxEntryName = nx.getEntryName();
        var nxUrl = nx.getNeXtProtUrl();
        nx.getProteinOverview().then(function (data) {
            loadOverview(data, nxEntryName, nxUrl);

        });
        if (nx.getEnvironment() !== 'pro') {
            $("body").append("<span style='position: absolute; top: 0; left: 0; border: 0; color: darkred; margin: 20px; font-weight: bold'>" + nx.getEnvironment().toUpperCase() + " API</span>");
        }
    }

    // Check if url include param inputOption
    var nxInputOption = nx.getInputOption();


    // Add inputOption box
    function addEntrySelection() {
        $("body").prepend("<div class='topParams' style='text-align:center;width:100%;'><div id=\"inputOptionDiv\" style=\"display:inline-block;vertical-align:top;border:1px solid #ddd;\">" +
            "<div class=\"panel panel-default\" style='border:0px;box-shadow:none;margin:0px'><div class=\"panel-body\" style='min-width:240px;padding:10px;'>" +
            "<input id=\"entrySelector\" type=\"text\" class=\"form-control\" placeholder=\"neXtProt or UniProt accession...\"></div>" +
            "</div></div></div>");
        $('#entrySelector').keyup(function (e) {
            if (e.keyCode == 13) nx.changeEntry(this);
        })
    }

    if (nxInputOption === "true") {
        addEntrySelection();
        nx.getEntryProperties().then(function (data) {
            $(function () {
                $("#inputOptionDiv").append("<div class=\"alert alert-success entry-alert\" role=\"alert\" style=\"display:none;position:absolute;z-index:12;min-width:240px;margin-top:15px;\">You successfully load the entry !</div>");
                $(".entry-alert").fadeIn("slow");
                $(".entry-alert").delay(2000).fadeOut("slow");
            });
        }, function (error) {
            $(function () {
                $("#inputOptionDiv").append("<div class=\"alert alert-danger entry-alert\" role=\"alert\" style=\"position:absolute;z-index:12;min-width:240px;margin-top:15px;\">This accession is not available !</div>");
                
            });
            console.error("Failed!", error);
        });
    }

    var nxQualityParam = nx.getQualitySelector();

    var nxGoldOnly = nx.getGoldOnlySelector();

    function changeGoldParam(gold) {
        var url = window.location.href;

        // If key exists updates the value
        if (url.indexOf('goldOnly=') > -1) {
            url = url.replace('goldOnly=' + !gold, 'goldOnly=' + gold);

            // If not, append
        } else {
            if (url.indexOf('?') > -1) url = url + '&goldOnly=' + gold;
            else url = url + '?goldOnly=' + gold;
        }

        return url;
    }

    if (nxQualityParam === "true") {
        if (nxGoldOnly) {
            if ($(".topParams").length === 0) {
                $("body").prepend("<div class='topParams' style='text-align:center;width:100%;'></div>");
            }
            var borderCollapse = $("#inputOptionDiv").length > 0 ? "border-right:0px;" : "";
            
            $(".topParams").prepend('<div style="display:inline-block;vertical-align:top;">\
            <div class="btn-group" role="group" style="padding:10px;background-color:white;border:1px solid #ddd;' + borderCollapse +'">\
                <a class="btn btn-default" role="presentation" id="quality-gold" href=' + changeGoldParam(true) + '><span style="color:#aa6708">GOLD</span></a>\
                <a class="btn btn-default" role="presentation" id="quality-goldAndSilver" href=' + changeGoldParam(false) + '><span style="color:#aa6708">GOLD</span> & <span style="color:#838996">SILVER</span></a>\
            </div>\
        </div>');

            if (nxGoldOnly === "true") {
                $("#quality-gold").addClass("active");
                $("#quality-goldAndSilver").removeClass("active");
            } else if (nxGoldOnly === "false"){
                $("#quality-goldAndSilver").addClass("active");
                $("#quality-gold").removeClass("active");
            }
        } else {
            console.warn("Please provide the param 'goldOnly' in the URL in order to display the gold quality switch");
        }
    }

});