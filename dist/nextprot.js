/**
 * A neXtProt js client
 */
(function (root) {
    //
    'use strict';
    if (root.Nextprot === undefined) {
        root.Nextprot = {};
    }


    (function () {

        //Utility methods
        var _getURLParameter = function (name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        };

        function _changeParamOrAddParamByName(href, paramName, newVal) {
            var tmpRegex = new RegExp("(" + paramName + "=)[a-zA-Z0-9_]+", 'ig');
            if (href.match(tmpRegex) !== null) {
                return href.replace(tmpRegex, '$1' + newVal);
            }
            return href += (((href.indexOf("?") !== -1) ? "&" : "?") + paramName + "=" + newVal);
        }

        var _convertToTupleMap = function (data) {
            var publiMap = {};
            var xrefMap = {};
            data.entry.publications.forEach(function (p) {
                publiMap[p.md5] = p;
            });
            data.entry.xrefs.forEach(function (p) {
                xrefMap[p.dbXrefId] = p;
            });
            //return data.entry.annotations;
            return {
                annot: data.entry.annotations,
                publi: publiMap,
                xrefs: xrefMap
            };
        };

        var normalizeEntry = function (entry) {
            if (entry.substring(0, 3) !== "NX_") {
                entry = "NX_" + entry;
            }
            return entry;
        };


        var environment = _getURLParameter("env") || 'pro'; //By default returns the production
        var apiBaseUrl = "https://api.nextprot.org";
        if (environment !== 'pro') {
            apiBaseUrl = "http://" + environment + "-api.nextprot.org";
        }
        var sparqlEndpoint = apiBaseUrl + "/sparql";
        var sparqlFormat = "?output=json";

        var applicationName = null;
        var clientInfo = null;


        function _getJSON(url) {

            var finalURL = url;
            finalURL = _changeParamOrAddParamByName(finalURL, "clientInfo", clientInfo);
            finalURL = _changeParamOrAddParamByName(finalURL, "applicationName", applicationName);

            return Promise.resolve($.getJSON(finalURL));
            //return get(url).then(JSON.parse);
        }


        var _getEntry = function (entry, context) {
            var entryName = normalizeEntry(entry || (_getURLParameter("nxentry") || 'NX_P01308'));
            var url = apiBaseUrl + "/entry/" + entryName;
            if (context) {
                url += "/" + context;
            }
            return _getJSON(url);
        };

        var _callPepX = function (seq, mode) {
            var url = apiBaseUrl + "/entries/search/peptide?peptide=" + seq + "&modeIL=" + mode;
            return _getJSON(url);
        };


        var NextprotClient = function (appName, clientInformation) {
            applicationName = appName;
            clientInfo = clientInformation;
            if (!appName) {
                throw "Please provide some application name  ex:  new Nextprot.Client('demo application for visualizing peptides', clientInformation);";
            }

            if (!clientInformation) {
                throw "Please provide some client information ex:  new Nextprot.Client(applicationName, 'Calipho SIB at Geneva');";
            }
        };

        //////////////// BEGIN Setters ////////////////////////////////////////////////////////////////////////

        /** By default it is set to https://api.nextprot.org */
        NextprotClient.prototype.setApiBaseUrl = function (_apiBaseUrl) {
            apiBaseUrl = _apiBaseUrl;
            sparqlEndpoint = apiBaseUrl + "/sparql";
        };
        /** By default it is set to https://api.nextprot.org/sparql */
        NextprotClient.prototype.setSparqlEndpoint = function (_sparqlEndpoint) {
            sparqlEndpoint = _sparqlEndpoint;
        };

        //////////////// END Setters ////////////////////////////////////////////////////////////////////////

        //Gets the entry set in the parameter
        NextprotClient.prototype.getEnvironment = function () {
            return _getURLParameter("env") || 'pro'; //By default returns the insulin
        };
        NextprotClient.prototype.getApiBaseUrl = function () {
            return apiBaseUrl;
        };

        //Gets the entry set in the parameter
        NextprotClient.prototype.getEntryName = function () {
            return normalizeEntry(_getURLParameter("nxentry") || 'NX_P01308'); //By default returns the insulin
        };

        NextprotClient.prototype.getInputOption = function () {
            return _getURLParameter("inputOption") || ''; //By default returns the insulin
        };

        NextprotClient.prototype.changeEntry = function (elem) {
            var new_url = _changeParamOrAddParamByName(window.location.href, "nxentry", elem.value);
            window.location.href = new_url;
        };

        NextprotClient.prototype.getEntryforPeptide = function (seq) {
            return _callPepX(seq, "true").then(function (data) {
                return data;
            });
        };


        var _transformPrefixesFunction = function (result) {
            var sparqlPrefixes = "";
            result.map(function (p) {
                sparqlPrefixes += (p + "\n");
            });
            return sparqlPrefixes;
        };

        // Keeps SPARQL prefixes in cache
        var sparqlPrefixPromise;
        NextprotClient.prototype.getSparqlPrefixes = function () {
            sparqlPrefixPromise = sparqlPrefixPromise || _getJSON(apiBaseUrl + "/sparql-prefixes").then(_transformPrefixesFunction);
            return sparqlPrefixPromise;
        };

        NextprotClient.prototype.executeSparql = function (sparql, includePrefixes) {
            return this.getSparqlPrefixes().then(function (sparqlPrefixes) {

                var incPrefs = (includePrefixes === undefined) ? true : includePrefixes;
                var sparqlQuery = incPrefs ? sparqlPrefixes + sparql : sparql; //add SPARQL prefixes if flag not set to false
                var url = sparqlEndpoint + sparqlFormat + "&query=" + encodeURIComponent(sparqlQuery);
                return _getJSON(url);
            });
        };

        NextprotClient.prototype.getEntryProperties = function (entry) {
            return _getEntry(entry, "accession").then(function (data) {
                return data.entry.properties;
            });
        };

        NextprotClient.prototype.getProteinOverview = function (entry) {
            return _getEntry(entry, "overview").then(function (data) {
                return data.entry.overview;
            });
        };

        NextprotClient.prototype.getProteinSequence = function (entry) {
            return _getEntry(entry, "isoform").then(function (data) {
                return data.entry.isoforms;
            });
        };
        NextprotClient.prototype.getXrefs = function (entry) {
            return _getEntry(entry, "xref").then(function (data) {
                return data.entry.xrefs;
            });
        };
        /** USE THIS INSTEAD OF THE OTHERS for example getEntryPart(NX_1038042, "ptm") */
        NextprotClient.prototype.getAnnotationsByCategory = function (entry, category) {
            return _getEntry(entry, category).then(function (data) {
                return _convertToTupleMap(data);
            });
        };

        NextprotClient.prototype.getEntry = function (entry, category) {
            return _getEntry(entry, category).then(function (data) {
                return data.entry;
            });
        };

        NextprotClient.prototype.getEntryProperties = function (entry) {
            return _getEntry(entry, "accession").then(function (data) {
                return data.entry.properties;
            });
        };


        /*  Special method to retrieve isoforms mapping on the master sequence (should not be used by public)  */
        NextprotClient.prototype.getIsoformMapping = function (entry) {
            return _getEntry(entry, "isoform/mapping").then(function (data) {
                return data;
            });
        };

        NextprotClient.prototype.getGenomicMappings = function (entry) {
            return _getEntry(entry, "genomic-mapping").then(function (data) {
                return data.entry.genomicMappings;
            });
        };

        // BEGIN Special cases to be deprecated  //////////////////////////////////////////////////////////////////////////////
        NextprotClient.prototype.getPeptide = function (entry) {
            console.warn("getPeptide is deprecated. use getAnnotationsByCategory(entry, 'peptide-mapping') instead ");
            return _getEntry(entry, "peptide-mapping").then(function (data) {
                return data.entry.peptideMappings;
            });
        };

        NextprotClient.prototype.getSrmPeptide = function (entry) {
            console.warn("getSrmPeptide is deprecated. use getAnnotationsByCategory(entry, 'srm-peptide-mapping') instead ");
            return _getEntry(entry, "srm-peptide-mapping").then(function (data) {
                return data.entry.srmPeptideMappings;
            });
        };

        NextprotClient.prototype.getAntibody = function (entry) {
            //this is not deprecated yet
            return _getEntry(entry, "antibody").then(function (data) {
                return data.entry.antibodyMappings;
            });
        };
        // END Special cases to be deprecated  //////////////////////////////////////////////////////////////////////////////


        //node.js compatibility
        if (typeof exports !== 'undefined') {
            exports.Client = NextprotClient;
        }

        root.Nextprot.Client = NextprotClient;

    }());


}(this));
;
//Utility methods
var NXUtils = {

    checkIsoformMatch: function (isoname, isonumber) {
        return isoname.endsWith("-" + isonumber)
    },
    getIsoforms: function(isoforms){
        if (isoforms && isoforms.length > 1 ) {
            isoforms.sort(NXUtils.sortIsoformNames);
            isoforms.forEach(function(iso){
                console.log(iso);
                if (iso.synonyms && iso.synonyms.length > 1) iso.synonyms.sort(NXUtils.sortByAlphabet);
            })
            return isoforms;
        }
        else return null;
    },
    getORFNames: function (geneName) {
        var names = [];
        if (geneName.category === "ORF") {
            names.push({name: geneName.name})
        }

        if (geneName.synonyms) {
            geneName.synonyms.forEach(function (gns) {
                if (gns.category === "ORF") {
                    names.push({name: gns.name})
                }
            })
        }
        if (names.length) names.sort(NXUtils.sortByAlphabet);
        return names;
    },
    getSynonyms: function (syn) {
        var synonyms = {};
        if (syn) {
            syn.forEach(function (s) {
                if (synonyms.hasOwnProperty(s.qualifier)) {
                    synonyms[s.qualifier].push(s.name);
                }
                else {
                    synonyms[s.qualifier]=[s.name];
                }
            });
        }
        for (var qualifier in synonyms) {
            synonyms[qualifier].sort(NXUtils.sortByAlphabet);
        }
        return synonyms;
    },
    sortSynonyms: function(a,b){
        var a = a;
        var b = b;
        if (typeof a !== "string") {
            var a = a.name;
            var b = b.name;
        }
        if (a.length === b.length) {
            return a.toLowerCase() > b.toLowerCase()
        }
        return b.toLowerCase().length - a.toLowerCase().length;
    },
    sortIsoformNames: function(a,b){
        if (parseInt(a.name.replace("Iso", "").replace(" ", ""))) {
            var first = parseInt(a.name.replace("Iso", "").replace(" ", ""));
            var second = parseInt(b.name.replace("Iso", "").replace(" ", ""));
            if(first > second) return 1;
            if(first < second) return -1;
            return 0;
        }
        else return a.name > b.name;
    },
    sortByAlphabet: function(a,b) {
        var a = typeof a === "string" ? a.toLowerCase() : a.name ? a.name.toLowerCase() : null;        
        var b = typeof b === "string" ? b.toLowerCase() : b.name ? b.name.toLowerCase() : null;        
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    },
    getRecommendedName: function (geneName) {
        var name = "";
        if (geneName.category === "gene name" && geneName.main === true) {
            name = geneName.name;
        }
        return name;
    },
    getAlternativeNames: function (altNames) {
        var names = [];
        if (altNames) {
            altNames.forEach(function (an) {
                var found = false;
                var type = an.type === "name" ? "Alternative name" : an.type === "International Nonproprietary Names" ? "International Nonproprietary Name" : an.type === "allergen" ? "Allergen" : an.type;
                for (var elem in names) {
                    if (names[elem].type === type) {
                        names[elem].names.push({name: an.name, synonyms: NXUtils.getSynonyms(an.synonyms)});
                        found = true;
                    }
                }
                if (!found) {
                    names.push({type: type, names: [{name: an.name, synonyms: NXUtils.getSynonyms(an.synonyms)}]})
                }
            });
        }
        names.map(function(n){n.names.sort(NXUtils.sortByAlphabet)});
//        names.forEach(function(n) {if (n.type === "Alternative name" && n.names.length > 1) {n.type = "Alternative names"}});
        return names;
    },
    getMainSynonym: function (sy) {
        var mainName;
        var syProtNames= sy.filter(function(a) {return a.qualifier === "full"});
        if (syProtNames.length) {
            var name = syProtNames.sort(function (a, b) {
                return b.name.length - a.name.length;
            })[0];
            mainName = {
                name: name.name,
                synonym: name.synonyms && name.synonyms.length > 0 ? name.synonyms.sort(NXUtils.sortByAlphabet)[0].name : null
            }
        }
        return mainName;
    },
    getMainShort: function (sh) {
        var name;
        name = sh[sh.length-1].charAt(0) === "h" ? sh[sh.length-2] ? sh[sh.length-2] : sh[sh.length-1] : sh[sh.length-1];
        return name;
    },
    getFamily: function (f,family) {
        f.level === "Superfamily" ? family["superfamily"]= {name:f.name, accession:f.accession} : "";
        f.level === "Family" ? family["family"]= {name:f.name, accession:f.accession} : "";
        f.level === "Subfamily" ? family["subfamily"]= {name:f.name, accession:f.accession} : "";
        if (f.parent) {
            NXUtils.getFamily(f.parent,family);
        }
        return family;
    },
    getProteinExistence: function(term){
        var existence = term.split('_').join(' ').toLowerCase();
        mainSentence = "Entry whose protein(s) existence is ";
        based = "based on ";
        switch(existence) {
            case "uncertain":
                return mainSentence + existence;
                break;
            case "inferred from homology":
                return mainSentence + existence;
                break;
            default:
                return mainSentence + based + existence;
                break;
        }
    },
    getSequenceForIsoform: function (isoSequences, isoformName) {
        var result = null;
        //TODO allow users to specify isoform name without NX_
        //TODO the API should return the results in a sorted array

        if (typeof isoformName === "number") {
            isoSequences.forEach(function (d) {

                if (d.uniqueName.endsWith("-" + isoformName)) {
                    result = d.sequence;
                }
            });
        } else {
            isoSequences.forEach(function (d) {
                if (d.uniqueName === isoformName)
                    return d.sequence;
            })
        }
        return result;
    },
    getLinkForFeature: function (accession, description, type) {
        if (type === "Peptide" || type === "SRM Peptide") {
            if (description) {
                var url = "https://db.systemsbiology.net/sbeams/cgi/PeptideAtlas/GetPeptide?searchWithinThis=Peptide+Name&searchForThis=" + description + ";organism_name=Human";
                return "<a href='" + url + "'>" + description + "</a>";
            }
        } else if (type === "antibody") {
            var url = accession;
            return "<a href='" + url + "'>" + description + "</a>";
        } else if (accession) {
            var url = "http://www.nextprot.org/db/term/" + accession;
            return "<a href='" + url + "'>" + description + "</a>";
        } else if (type === "publication") {
            var url = "http://www.nextprot.org/db/publication/" + accession;
            return "<a href='" + url + "'>" + description + "</a>";
        } else if (description) return description;
        else return "";
    },
    getDescription: function (elem, category) {
        if (category === "Peptide" || category === "SRM Peptide") {
            for (var ev in elem.evidences) {
                if (elem.evidences[ev].resourceDb === "PeptideAtlas" || elem.evidences[ev].resourceDb === "SRMAtlas") {
                    return elem.evidences[ev].resourceAccession;
                }
            }
            return "";
        }
        else return elem.description;
    },
    getEvidenceCodeName: function (elem, category) {
        if (category === "Peptide") {
            return "EXP";
        }
        else return elem.evidenceCodeName;
    },
    getAssignedBy: function (elem) {
        if (elem === "Uniprot") {
            return "UniprotKB";
        }
        if (elem.startsWith("MD") || elem.startsWith("PM")) {
            return "neXtProt";
        }
        else return elem;
    },
    getProteotypicity: function (elem) {
        if (elem) {
            var proteo = true;
            elem.forEach(function(p) {
                if (p.name === "is proteotypic" && p.value === "N") proteo=false;
            });
            return proteo;
        }
        else return true;
    },
    convertMappingsToIsoformMap: function (featMappings, category, group) {
        var mappings = jQuery.extend([], featMappings);
        var publiActive = false;
        if (featMappings.hasOwnProperty("annot")) {
            publiActive = true;
            mappings = jQuery.extend([], featMappings.annot);
        }
        var result = {};
        mappings.forEach(function (mapping) {
            if (mapping.hasOwnProperty("targetingIsoformsMap")) {
                for (var name in mapping.targetingIsoformsMap) {
                    if (mapping.targetingIsoformsMap.hasOwnProperty(name)) {
                        var start = mapping.targetingIsoformsMap[name].firstPosition,
                            end = mapping.targetingIsoformsMap[name].lastPosition,
                            description = NXUtils.getDescription(mapping,category),
                            link = NXUtils.getLinkForFeature(mapping.cvTermAccessionCode, description, category),
                            quality = mapping.qualityQualifier !== "GOLD" ? mapping.qualityQualifier.toLowerCase() : "",
                            proteotypic = NXUtils.getProteotypicity(mapping.properties),
                            source = mapping.evidences.map(function (d) {
                                var pub = null;
                                var xref = null;
                                if (publiActive) {
                                    if (featMappings.publi[d.publicationMD5]) {
                                        pub = d.publicationMD5;
                                    }
                                    if (featMappings.xrefs[d.resourceId]) {
                                        xref = featMappings.xrefs[d.resourceId];
                                    }
                                    return {
                                        evidenceCodeName: NXUtils.getEvidenceCodeName(d,category),
                                        assignedBy: NXUtils.getAssignedBy(d.assignedBy),
                                        resourceDb: d.resourceDb,
                                        externalDb: d.resourceDb !== "UniProt",
                                        publicationMD5: d.publicationMD5,
                                        title: pub ? NXUtils.getLinkForFeature(featMappings.publi[pub].publicationId, featMappings.publi[pub].title, "publication") : "",
                                        authors: pub ? featMappings.publi[pub].authors.map(function (d) {
                                            return {
                                                lastName: d.lastName,
                                                initials: d.initials
                                            }
                                        }) : [],
                                        journal: pub ? featMappings.publi[pub].cvJournal ? featMappings.publi[pub].cvJournal.name : "" : "",
                                        volume: pub ? featMappings.publi[pub].volume : "",
                                        year: pub ? featMappings.publi[pub].publicationYear : "",
                                        firstPage: pub ? featMappings.publi[pub].firstPage : "",
                                        lastPage: pub ? (featMappings.publi[pub].lastPage === "" ? featMappings.publi[pub].firstPage : featMappings.publi[pub].lastPage) : "",
                                        pubId: pub ? featMappings.publi[pub].publicationId : "",
                                        abstract: pub ? featMappings.publi[pub].abstractText : "",
                                        dbXrefs: pub ? featMappings.publi[pub].dbXrefs.map(function (o) {
                                            return {
                                                name: o.databaseName === "DOI" ? "Full Text" : o.databaseName,
                                                url: o.resolvedUrl,
                                                accession: o.accession
                                            }
                                        }) : [],
                                        crossRef: xref ? {
                                            dbName: xref.databaseName,
                                            name: xref.accession,
                                            url: xref.resolvedUrl
                                        } : null
                                    }
                                } else return {
                                    evidenceCodeName: NXUtils.getEvidenceCodeName(d,category),
                                    assignedBy: NXUtils.getAssignedBy(d.assignedBy),
                                    publicationMD5: d.publicationMD5,
                                    title: "",
                                    authors: [],
                                    journal: "",
                                    volume: "",
                                    abstract: ""
                                }
                            }),
                            variant = false;
                        if (mapping.hasOwnProperty("variant") && !jQuery.isEmptyObject(mapping.variant)) {
                            link = "<span style='color:#00C500'>" + mapping.variant.original + " → " + mapping.variant.variant + "</span>";
                            description = "<span style=\"color:#00C500\">" + mapping.variant.original + " → " + mapping.variant.variant + "</span>  ";
                            variant = true;
                            if (mapping.description) {
                                var reg = /\[(.*?)\]/g;
                                var match = reg.exec(mapping.description);
                                var desc = mapping.description;
                                if (match) {
                                    var parseMatch = match[1].split(":");
                                    var desc = mapping.description.replace(/(\[.*?\])/g, NXUtils.getLinkForFeature(parseMatch[2], parseMatch[0]));

                                }
                                link += " ; " + desc;
                            }
                        }
                        if (!result[name]) result[name] = [];
                        result[name].push({
                            start: start,
                            end: end,
                            length: end - start + 1,
                            id: category.replace(/\s/g, '') + "_" + start.toString() + "_" + end.toString(),
                            description: description,
                            quality: quality,
                            proteotypicity: proteotypic,
                            category: category,
                            group: group,
                            link: link,
                            evidenceLength: source.length,
                            source: source,
                            variant: variant
                        });
                    }
                }
            }
            //TODO This is the old format, the API should evolve
            else if (mapping.hasOwnProperty("isoformSpecificity")) {
                for (var name in mapping.isoformSpecificity) {
                    if (mapping.isoformSpecificity.hasOwnProperty(name)) {
                        for (var i = 0; i < mapping.isoformSpecificity[name].positions.length; i++) {
                            var start = mapping.isoformSpecificity[name].positions[i].first,
                                end = mapping.isoformSpecificity[name].positions[i].second,
                                description = "",
                                link = "",
                                source = [];
                            if (mapping.hasOwnProperty("evidences")) {
                                source = mapping.evidences.map(function (d) {
                                    return {
                                        evidenceCodeName: d.evidenceCodeName,
                                        assignedBy: d.assignedBy,
                                        publicationMD5: d.publicationMD5
                                    }
                                });
                            }
                            if (mapping.hasOwnProperty("xrefs")) {
                                description = mapping.xrefs[0].accession;
                                link = NXUtils.getLinkForFeature(mapping.xrefs[0].resolvedUrl, description, "antibody")
                            } else {
                                description = mapping.evidences[0].accession;
                                for (ev in mapping.evidences)
                                    if (mapping.evidences[ev].databaseName === "PeptideAtlas" || mapping.evidences[ev].databaseName === "SRMAtlas") {
                                        description = mapping.evidences[ev].accession;
                                        link = NXUtils.getLinkForFeature(description, description, "peptide");

                                        break;
                                    }
                            }

                            if (!result[name]) result[name] = [];
                            result[name].push({
                                start: start,
                                end: end,
                                length: end - start,
                                id: category.replace(/\s/g, '') + "_" + start.toString() + "_" + end.toString(),
                                description: description,
                                category: category,
                                group: group,
                                link: link,
                                evidenceLength: source.length,
                                source: source
                            });
                        }
                    }
                }
            }
        });
        for (var iso in result) {
            result[iso].sort(function (a, b) {
                if (a.start === b.start) {
                    if (a.length === b.length) return b.id > a.id;
                    else return b.length - a.length;
                }
                if (a.end === null) return 1;
                return a.start - b.start;
            })
        }
        return result;
    },
    convertPublications: function (publi, HashMD5) {
        for (var pub in publi) {
            HashMD5[publi[pub].md5] = {
                title: publi[pub].title,
                author: publi[pub].authors.map(function (d) {
                    return {
                        lastName: d.lastName,
                        initials: d.initials
                    }
                }),
                journal: publi[pub].cvJournal.name,
                volume: publi[pub].volume,
                abstract: publi[pub].abstractText
            }
        }

    },
    convertExonsMappingsToIsoformMap: function (mappings) {
        return mappings.map(function (d) {
            return {
                uniqueName: d.uniqueName,
                isoMainName: d.isoMainName,
                mapping: d.positionsOfIsoformOnReferencedGene.map(function (o) {
                    return {
                        start: o.key,
                        end: o.value
                    };
                })
            }
        })
    }
};

var NXViewerUtils = {
    convertNXAnnotations: function (annotations, metadata) {
        if (!annotations) return "Cannot load this";
        var result = {};
        for (name in annotations) {
            var meta = jQuery.extend({}, metadata);
            meta.data = annotations[name].map(function (annotation) {
                return {
                    x: annotation.start,
                    y: annotation.end,
                    id: annotation.id,
                    category: annotation.category,
                    description: annotation.description
                }
            });
            result[name] = meta;
        }
        return result;
    }
};
if ( typeof module === "object" && typeof module.exports === "object" ) {
    module.exports = {
        NXUtils: NXUtils,
        NXViewerUtils : NXViewerUtils
    }
};
$(function () {

    var loadOverview = function (overview, nxEntryName) {
        if ($("#nx-overview").length > 0) {
            Handlebars.registerHelper('link_to', function (type, options) {
                switch (type) {
                    case "term":
                        var url = "http://www.nextprot.org/db/term/" + this.accession;
                        return "<a target='_blank' href='" + url + "'>" + this.name + "</a>";
                    case "EC" :
                        var url = "http://www.nextprot.org/db/term/" + this;
                        return "<a target='_blank' href='" + url + "'> EC " + this + " </a>";
                    case "history":
                        var url = "http://www.uniprot.org/uniprot/" + this.slice(3) + "?version=*";
                        return "<a target='_blank' href='" + url + "'>Complete UniProtKB history</a>";
                }
            });
            Handlebars.registerHelper('plural', function (array, options) {
                return array.length > 1 ? "s" : "";
            });

            var EC = [];
            var short = [];

            if (overview.recommendedProteinName.synonyms) {
                overview.recommendedProteinName.synonyms.forEach(function (p) {
                    if (p.qualifier === "EC") EC.push(p.name);
                    if (p.qualifier === "short") short.push(p.name);
                });
                if (EC.length) EC.sort(NXUtils.sortByAlphabet);
                if (short.length) short.sort(NXUtils.sortByAlphabet);
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
                    others: NXUtils.getAlternativeNames(overview.alternativeProteinNames).filter(function(t) {
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
                "families": overview.families.map(function(f){return NXUtils.getFamily(f,{})}),
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

    if ($("#nx-overview").length > 0) { // laad the overview if it exists
        var Nextprot = window.Nextprot;
        var nx = new Nextprot.Client("neXtprot overview loader", "Calipho Group");
        var nxEntryName = nx.getEntryName();
        nx.getProteinOverview().then(function (data) {
            loadOverview(data, nxEntryName);

            var nxInputOption = nx.getInputOption();

            function addEntrySelection() {
                $("body").prepend("<div id=\"inputOptionDiv\" class=\"col-md-2 col-md-offset-5 centered\" style=\"position:absolute;padding:10px;padding-top:0px;z-index:12\">" +
                "<div class=\"panel panel-default\"><div class=\"panel-body\">" +
                "<input id=\"entrySelector\" type=\"text\" class=\"form-control\" placeholder=\"neXtProt or UniProt accession...\"></div>" +
                "</div></div>");
                $('#entrySelector').keyup(function (e) {
                    if (e.keyCode == 13) nx.changeEntry(this);
                })
            }

            if (nxInputOption === "true") {
                addEntrySelection();
                nx.getEntryProperties().then(function (data) {
                    $(function () {
                        $("#inputOptionDiv").append("<div class=\"alert alert-success entry-alert\" role=\"alert\" style=\"display:none\">You successfully load the entry !</div>");
                        $(".entry-alert").fadeIn("slow");
                        $(".entry-alert").delay(2000).fadeOut("slow");
                    });
                }, function (error) {
                    $(function () {
                        $("#inputOptionDiv").append("<div class=\"alert alert-danger entry-alert\" role=\"alert\">This accession is not available !</div>");
                    });
                    console.error("Failed!", error);
                });
            }

        });
        if(nx.getEnvironment() !== 'pro'){
            $("body").append("<span style='position: absolute; top: 0; left: 0; border: 0; color: darkred; margin: 20px; font-weight: bold'>" + nx.getEnvironment().toUpperCase() + " API</span>");
        }
    }

});;
this["HBtemplates"] = this["HBtemplates"] || {};

this["HBtemplates"]["templates/overviewProtein.tmpl"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return " "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = ((stack1 = (depth0 != null ? depth0.geneName : depth0)) != null ? stack1['0'] : stack1)) != null ? stack1.name : stack1),{"name":"if","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"2":function(depth0,helpers,partials,data) {
    var stack1;

  return this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.geneName : depth0)) != null ? stack1['0'] : stack1)) != null ? stack1.name : stack1), depth0))
    + "  →  ";
},"4":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.EC : depth0),{"name":"if","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.mainShortName : depth0),{"name":"if","hash":{},"fn":this.program(9, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"5":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "  [";
  stack1 = ((helper = (helper = helpers.EC || (depth0 != null ? depth0.EC : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"EC","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.EC) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + " ] ";
},"6":function(depth0,helpers,partials,data) {
    var stack1;

  return " "
    + ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0,"EC",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers.unless.call(depth0,(data && data.last),{"name":"unless","hash":{},"fn":this.program(7, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + " ";
},"7":function(depth0,helpers,partials,data) {
    return ",";
},"9":function(depth0,helpers,partials,data) {
    var helper;

  return "( "
    + this.escapeExpression(((helper = (helper = helpers.mainShortName || (depth0 != null ? depth0.mainShortName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"mainShortName","hash":{},"data":data}) : helper)))
    + " ) ";
},"11":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <div id=\"synonym-less\" class=\"row\">\n        <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">Protein also known as :</div>\n        <div class=\"col-md-9 col-xs-9\">";
  stack1 = ((helper = (helper = helpers.recommendedProteinName || (depth0 != null ? depth0.recommendedProteinName : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"recommendedProteinName","hash":{},"fn":this.program(12, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.recommendedProteinName) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n    </div>\n";
},"12":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=helpers.blockHelperMissing, buffer = "";

  stack1 = ((helper = (helper = helpers.mainSynonymName || (depth0 != null ? depth0.mainSynonymName : depth0)) != null ? helper : alias1),(options={"name":"mainSynonymName","hash":{},"fn":this.program(13, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.mainSynonymName) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += " "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.others : depth0),{"name":"if","hash":{},"fn":this.program(16, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
  stack1 = ((helper = (helper = helpers.others || (depth0 != null ? depth0.others : depth0)) != null ? helper : alias1),(options={"name":"others","hash":{},"fn":this.program(18, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.others) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"13":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.synonym : depth0),{"name":"if","hash":{},"fn":this.program(14, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"14":function(depth0,helpers,partials,data) {
    var helper;

  return " ("
    + this.escapeExpression(((helper = (helper = helpers.synonym || (depth0 != null ? depth0.synonym : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"synonym","hash":{},"data":data}) : helper)))
    + ") ";
},"16":function(depth0,helpers,partials,data) {
    return " ; ";
},"18":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, buffer = 
  alias3(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"type","hash":{},"data":data}) : helper)))
    + alias3((helpers.plural || (depth0 && depth0.plural) || alias1).call(depth0,(depth0 != null ? depth0.names : depth0),{"name":"plural","hash":{},"data":data}))
    + ":";
  stack1 = ((helper = (helper = helpers.names || (depth0 != null ? depth0.names : depth0)) != null ? helper : alias1),(options={"name":"names","hash":{},"fn":this.program(19, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.names) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + ((stack1 = helpers.unless.call(depth0,(data && data.last),{"name":"unless","hash":{},"fn":this.program(21, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"19":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return " "
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers.unless.call(depth0,(data && data.last),{"name":"unless","hash":{},"fn":this.program(7, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"21":function(depth0,helpers,partials,data) {
    return "; ";
},"23":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.recommendedProteinName : depth0)) != null ? stack1.others : stack1),{"name":"if","hash":{},"fn":this.program(24, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"24":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <div id=\"synonym-other-less\" class=\"row\">\n        <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">Protein also known as :</div>\n        <div class=\"col-md-9 col-xs-9\">";
  stack1 = ((helper = (helper = helpers.recommendedProteinName || (depth0 != null ? depth0.recommendedProteinName : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"recommendedProteinName","hash":{},"fn":this.program(25, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.recommendedProteinName) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n    </div>\n";
},"25":function(depth0,helpers,partials,data) {
    var stack1, helper, options;

  stack1 = ((helper = (helper = helpers.others || (depth0 != null ? depth0.others : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"others","hash":{},"fn":this.program(26, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.others) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { return stack1; }
  else { return ''; }
},"26":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, buffer = 
  " "
    + alias3(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"type","hash":{},"data":data}) : helper)))
    + alias3((helpers.plural || (depth0 && depth0.plural) || alias1).call(depth0,(depth0 != null ? depth0.names : depth0),{"name":"plural","hash":{},"data":data}))
    + ":";
  stack1 = ((helper = (helper = helpers.names || (depth0 != null ? depth0.names : depth0)) != null ? helper : alias1),(options={"name":"names","hash":{},"fn":this.program(27, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.names) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + ((stack1 = helpers.unless.call(depth0,(data && data.last),{"name":"unless","hash":{},"fn":this.program(21, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"27":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers.unless.call(depth0,(data && data.last),{"name":"unless","hash":{},"fn":this.program(7, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"29":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <div id=\"cleavage-less\" class=\"row\">\n        <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">Cleaved into :</div>\n        <div class=\"col-md-6 col-xs-6\">";
  stack1 = ((helper = (helper = helpers.cleavage || (depth0 != null ? depth0.cleavage : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"cleavage","hash":{},"fn":this.program(30, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.cleavage) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n    </div>\n";
},"30":function(depth0,helpers,partials,data) {
    var stack1, helper, options;

  stack1 = ((helper = (helper = helpers.names || (depth0 != null ? depth0.names : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"names","hash":{},"fn":this.program(31, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.names) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { return stack1; }
  else { return ''; }
},"31":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<span>"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers.unless.call(depth0,(data && data.last),{"name":"unless","hash":{},"fn":this.program(21, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</span>";
},"33":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,((stack1 = ((stack1 = (depth0 != null ? depth0.geneName : depth0)) != null ? stack1['0'] : stack1)) != null ? stack1.name : stack1),{"name":"if","hash":{},"fn":this.program(34, data, 0),"inverse":this.program(37, data, 0),"data":data})) != null ? stack1 : "");
},"34":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "            <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">Gene name :</div>\n            <div class=\"col-md-6 col-xs-6\" >";
  stack1 = ((helper = (helper = helpers.geneName || (depth0 != null ? depth0.geneName : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"geneName","hash":{},"fn":this.program(35, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.geneName) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"35":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers.unless.call(depth0,(data && data.last),{"name":"unless","hash":{},"fn":this.program(21, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"37":function(depth0,helpers,partials,data) {
    var stack1;

  return "            <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">ORF name :</div>\n            <div class=\"col-md-6 col-xs-6\">"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.geneName : depth0)) != null ? stack1['0'] : stack1)) != null ? stack1.orf : stack1)) != null ? stack1['0'] : stack1)) != null ? stack1.name : stack1), depth0))
    + "</div>\n";
},"39":function(depth0,helpers,partials,data) {
    return "            <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">Gene name :</div>\n            <div class=\"col-md-6 col-xs-6\" >None assigned yet</div>\n";
},"41":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <div id=\"family-less\" class=\"row\">\n        <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">Family name :</div>\n        <div class=\"col-md-6 col-xs-6\">";
  stack1 = ((helper = (helper = helpers.families || (depth0 != null ? depth0.families : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"families","hash":{},"fn":this.program(42, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.families) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n    </div>\n";
},"42":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "<span>";
  stack1 = ((helper = (helper = helpers.superfamily || (depth0 != null ? depth0.superfamily : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"superfamily","hash":{},"fn":this.program(43, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.superfamily) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.family : depth0),{"name":"if","hash":{},"fn":this.program(45, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.subfamily : depth0),{"name":"if","hash":{},"fn":this.program(50, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</span>";
},"43":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0,"term",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "");
},"45":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.superfamily : depth0),{"name":"if","hash":{},"fn":this.program(46, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
  stack1 = ((helper = (helper = helpers.family || (depth0 != null ? depth0.family : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"family","hash":{},"fn":this.program(48, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.family) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"46":function(depth0,helpers,partials,data) {
    return " >> ";
},"48":function(depth0,helpers,partials,data) {
    var stack1;

  return " "
    + ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0,"term",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + " ";
},"50":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.family : depth0),{"name":"if","hash":{},"fn":this.program(46, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
  stack1 = ((helper = (helper = helpers.subfamily || (depth0 != null ? depth0.subfamily : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"subfamily","hash":{},"fn":this.program(51, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.subfamily) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"51":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0,"term",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + " ";
},"53":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", buffer = 
  "                <dd>"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + " ";
  stack1 = ((helper = (helper = helpers.synonyms || (depth0 != null ? depth0.synonyms : depth0)) != null ? helper : alias1),(options={"name":"synonyms","hash":{},"fn":this.program(54, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.synonyms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</dd>\n";
},"54":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.EC : depth0),{"name":"if","hash":{},"fn":this.program(55, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0['short'] : depth0),{"name":"if","hash":{},"fn":this.program(57, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"55":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "[";
  stack1 = ((helper = (helper = helpers.EC || (depth0 != null ? depth0.EC : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"EC","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.EC) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + " ] ";
},"57":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "<span style=\"font-size:12px;\"><span style=\"color:grey\">Short: </span> ";
  stack1 = ((helper = (helper = helpers['short'] || (depth0 != null ? depth0['short'] : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"short","hash":{},"fn":this.program(58, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers['short']) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</span>";
},"58":function(depth0,helpers,partials,data) {
    var stack1;

  return this.escapeExpression(this.lambda(depth0, depth0))
    + ((stack1 = helpers.unless.call(depth0,(data && data.last),{"name":"unless","hash":{},"fn":this.program(59, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"59":function(depth0,helpers,partials,data) {
    return " , ";
},"61":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.alternativeProteinNames || (depth0 != null ? depth0.alternativeProteinNames : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"alternativeProteinNames","hash":{},"fn":this.program(62, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.alternativeProteinNames) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"62":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, buffer = 
  "                <dt>"
    + alias3(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"type","hash":{},"data":data}) : helper)))
    + alias3((helpers.plural || (depth0 && depth0.plural) || alias1).call(depth0,(depth0 != null ? depth0.names : depth0),{"name":"plural","hash":{},"data":data}))
    + "</dt>\n";
  stack1 = ((helper = (helper = helpers.names || (depth0 != null ? depth0.names : depth0)) != null ? helper : alias1),(options={"name":"names","hash":{},"fn":this.program(63, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.names) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"63":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", buffer = 
  "                <dd> "
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\n                    ";
  stack1 = ((helper = (helper = helpers.synonyms || (depth0 != null ? depth0.synonyms : depth0)) != null ? helper : alias1),(options={"name":"synonyms","hash":{},"fn":this.program(54, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.synonyms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n                </dd>\n";
},"65":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.functionalRegionNames || (depth0 != null ? depth0.functionalRegionNames : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"functionalRegionNames","hash":{},"fn":this.program(66, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.functionalRegionNames) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"66":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "                <dt>Include the following functional regions</dt>\n";
  stack1 = ((helper = (helper = helpers.names || (depth0 != null ? depth0.names : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"names","hash":{},"fn":this.program(67, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.names) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"67":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", buffer = 
  "                <dd> "
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\n                    ";
  stack1 = ((helper = (helper = helpers.synonyms || (depth0 != null ? depth0.synonyms : depth0)) != null ? helper : alias1),(options={"name":"synonyms","hash":{},"fn":this.program(68, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.synonyms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n                </dd>\n";
},"68":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.EC : depth0),{"name":"if","hash":{},"fn":this.program(55, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.full : depth0),{"name":"if","hash":{},"fn":this.program(69, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"69":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, buffer = 
  "<span style=\"font-size:12px;\"><span style=\"color:grey\">Alternative name"
    + this.escapeExpression((helpers.plural || (depth0 && depth0.plural) || alias1).call(depth0,(depth0 != null ? depth0.full : depth0),{"name":"plural","hash":{},"data":data}))
    + ":</span> ";
  stack1 = ((helper = (helper = helpers.full || (depth0 != null ? depth0.full : depth0)) != null ? helper : alias1),(options={"name":"full","hash":{},"fn":this.program(70, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.full) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</span>";
},"70":function(depth0,helpers,partials,data) {
    var stack1;

  return this.escapeExpression(this.lambda(depth0, depth0))
    + ((stack1 = helpers.unless.call(depth0,(data && data.last),{"name":"unless","hash":{},"fn":this.program(16, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"72":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.cleavage || (depth0 != null ? depth0.cleavage : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"cleavage","hash":{},"fn":this.program(73, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.cleavage) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"73":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "                <dt>Cleaved into the following "
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.names : depth0)) != null ? stack1.length : stack1), depth0))
    + " chains</dt>\n";
  stack1 = ((helper = (helper = helpers.names || (depth0 != null ? depth0.names : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"names","hash":{},"fn":this.program(74, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.names) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"74":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", buffer = 
  "                <dd>"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + " ";
  stack1 = ((helper = (helper = helpers.synonyms || (depth0 != null ? depth0.synonyms : depth0)) != null ? helper : alias1),(options={"name":"synonyms","hash":{},"fn":this.program(68, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.synonyms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</dd>\n";
},"76":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "                <dt>Spliced into the following "
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.isoforms : depth0)) != null ? stack1.length : stack1), depth0))
    + " isoforms</dt>\n";
  stack1 = ((helper = (helper = helpers.isoforms || (depth0 != null ? depth0.isoforms : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"isoforms","hash":{},"fn":this.program(77, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.isoforms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"77":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "                <dd>"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + " "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.synonyms : depth0),{"name":"if","hash":{},"fn":this.program(78, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</dd>\n";
},"78":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "<span style=\"font-size:0.9em;color:grey\"> Alternative name: </span>";
  stack1 = ((helper = (helper = helpers.synonyms || (depth0 != null ? depth0.synonyms : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"synonyms","hash":{},"fn":this.program(79, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.synonyms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"79":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers.unless.call(depth0,(data && data.last),{"name":"unless","hash":{},"fn":this.program(16, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"81":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.geneName || (depth0 != null ? depth0.geneName : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"geneName","hash":{},"fn":this.program(82, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.geneName) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"82":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.name : depth0),{"name":"if","hash":{},"fn":this.program(83, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.synonyms : depth0),{"name":"if","hash":{},"fn":this.program(85, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.orf : depth0),{"name":"if","hash":{},"fn":this.program(88, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers.unless.call(depth0,(data && data.last),{"name":"unless","hash":{},"fn":this.program(90, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"83":function(depth0,helpers,partials,data) {
    var helper;

  return "                <dt>Recommended name</dt>\n                <dd>"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</dd>\n";
},"85":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, buffer = 
  "                <dt>Alternative name"
    + this.escapeExpression((helpers.plural || (depth0 && depth0.plural) || alias1).call(depth0,(depth0 != null ? depth0.synonyms : depth0),{"name":"plural","hash":{},"data":data}))
    + "</dt>\n";
  stack1 = ((helper = (helper = helpers.synonyms || (depth0 != null ? depth0.synonyms : depth0)) != null ? helper : alias1),(options={"name":"synonyms","hash":{},"fn":this.program(86, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.synonyms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"86":function(depth0,helpers,partials,data) {
    var helper;

  return "                <dd> "
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</dd>\n";
},"88":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, buffer = 
  "                <dt>ORF name"
    + this.escapeExpression((helpers.plural || (depth0 && depth0.plural) || alias1).call(depth0,(depth0 != null ? depth0.orf : depth0),{"name":"plural","hash":{},"data":data}))
    + "</dt>\n";
  stack1 = ((helper = (helper = helpers.orf || (depth0 != null ? depth0.orf : depth0)) != null ? helper : alias1),(options={"name":"orf","hash":{},"fn":this.program(86, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.orf) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"90":function(depth0,helpers,partials,data) {
    return "                <br>\n";
},"92":function(depth0,helpers,partials,data) {
    return "                <dt>Recommended name</dt>\n                <dd>None assigned yet</dd>\n";
},"94":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <div id=\"family-full\" class=\"row\">\n        <div class=\"col-md-1 col-xs-2 text-uppercase\" style=\"color: grey;\">Family</div>\n        <div class=\"col-md-9 col-xs-8\">\n            <dl>\n";
  stack1 = ((helper = (helper = helpers.families || (depth0 != null ? depth0.families : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"families","hash":{},"fn":this.program(95, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.families) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "            </dl>\n        </div>\n    </div>\n";
},"95":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.superfamily : depth0),{"name":"if","hash":{},"fn":this.program(96, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.family : depth0),{"name":"if","hash":{},"fn":this.program(99, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.subfamily : depth0),{"name":"if","hash":{},"fn":this.program(102, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"96":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.superfamily || (depth0 != null ? depth0.superfamily : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"superfamily","hash":{},"fn":this.program(97, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.superfamily) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"97":function(depth0,helpers,partials,data) {
    var stack1;

  return "                <dt>Superfamily</dt>\n                <dd>"
    + ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0,"term",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + "</dd>\n";
},"99":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.family || (depth0 != null ? depth0.family : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"family","hash":{},"fn":this.program(100, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.family) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"100":function(depth0,helpers,partials,data) {
    var stack1;

  return "                <dt>Family</dt>\n                <dd>"
    + ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0,"term",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + "</dd>\n";
},"102":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.subfamily || (depth0 != null ? depth0.subfamily : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"subfamily","hash":{},"fn":this.program(103, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.subfamily) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"103":function(depth0,helpers,partials,data) {
    var stack1;

  return "                <dt>Subfamily</dt>\n                <dd>"
    + ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0,"term",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + "</dd>\n";
},"105":function(depth0,helpers,partials,data) {
    var helper;

  return "                <dd>Last sequence update "
    + this.escapeExpression(((helper = (helper = helpers.lastSeqUpdate || (depth0 != null ? depth0.lastSeqUpdate : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"lastSeqUpdate","hash":{},"data":data}) : helper)))
    + "</dd>\n";
},"107":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0,"history",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "");
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, alias4=helpers.blockHelperMissing, buffer = 
  "<style>\ndd{\n margin-left:15px;\n}\n</style>\n<div id=\"proteinTitle\">\n    <button id=\"extender\" class=\"btn btn-default\" style=\"float:right;margin-top:-5px;\">Extend overview</button>\n    <h3>"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.geneName : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n    "
    + alias3(((helper = (helper = helpers.entryName || (depth0 != null ? depth0.entryName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"entryName","hash":{},"data":data}) : helper)))
    + " ";
  stack1 = ((helper = (helper = helpers.recommendedProteinName || (depth0 != null ? depth0.recommendedProteinName : depth0)) != null ? helper : alias1),(options={"name":"recommendedProteinName","hash":{},"fn":this.program(4, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.recommendedProteinName) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "</h3>\n</div>\n<div id=\"INFOS-LESS\" style=\"display:block;margin-top:15px;\">\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.recommendedProteinName : depth0)) != null ? stack1.mainSynonymName : stack1),{"name":"if","hash":{},"fn":this.program(11, data, 0),"inverse":this.program(23, data, 0),"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.cleavage : depth0),{"name":"if","hash":{},"fn":this.program(29, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    <div id=\"gene-less\" class=\"row\">\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.geneName : depth0),{"name":"if","hash":{},"fn":this.program(33, data, 0),"inverse":this.program(39, data, 0),"data":data})) != null ? stack1 : "")
    + "\n    </div>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.families : depth0),{"name":"if","hash":{},"fn":this.program(41, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</div>\n<div id=\"INFOS-FULL\" style=\"display:none\">\n    <div id=\"protein-full\" class=\"row\">\n        <div class=\"col-md-1 col-xs-2 text-uppercase\" style=\"color: grey;\">Protein</div>\n        <div class=\"col-md-9 col-xs-8\">\n            <dl>\n                <dt>Recommended name</dt>\n";
  stack1 = ((helper = (helper = helpers.recommendedProteinName || (depth0 != null ? depth0.recommendedProteinName : depth0)) != null ? helper : alias1),(options={"name":"recommendedProteinName","hash":{},"fn":this.program(53, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.recommendedProteinName) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.alternativeProteinNames : depth0),{"name":"if","hash":{},"fn":this.program(61, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.functionalRegionNames : depth0),{"name":"if","hash":{},"fn":this.program(65, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.cleavage : depth0),{"name":"if","hash":{},"fn":this.program(72, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isoforms : depth0),{"name":"if","hash":{},"fn":this.program(76, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "            </dl>\n        </div>\n    </div>\n    <div id=\"gene-full\" class=\"row\">\n        <div class=\"col-md-1 col-xs-2 text-uppercase\" style=\"color: grey;\">Gene</div>\n        <div class=\"col-md-9 col-xs-8\">\n            <dl>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.geneName : depth0),{"name":"if","hash":{},"fn":this.program(81, data, 0),"inverse":this.program(92, data, 0),"data":data})) != null ? stack1 : "")
    + "            </dl>\n        </div>\n    </div>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.families : depth0),{"name":"if","hash":{},"fn":this.program(94, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    <div id=\"History-full\" class=\"row\">\n        <div class=\"col-md-1 col-xs-2 text-uppercase\" style=\"color: grey;\">History</div>\n        <div class=\"col-md-9 col-xs-8\">\n            <dl>\n                <dt>neXtProt</dt>\n                <dd>Integrated "
    + alias3(((helper = (helper = helpers.integDate || (depth0 != null ? depth0.integDate : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"integDate","hash":{},"data":data}) : helper)))
    + "</dd>\n                <dd>Last updated "
    + alias3(((helper = (helper = helpers.lastUpdate || (depth0 != null ? depth0.lastUpdate : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"lastUpdate","hash":{},"data":data}) : helper)))
    + "</dd>\n                <dt>UniProtKB</dt>\n                <dd>Integrated "
    + alias3(((helper = (helper = helpers.UniprotIntegDate || (depth0 != null ? depth0.UniprotIntegDate : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"UniprotIntegDate","hash":{},"data":data}) : helper)))
    + "</dd>\n                <dd>Last updated "
    + alias3(((helper = (helper = helpers.UniprotLastUpdate || (depth0 != null ? depth0.UniprotLastUpdate : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"UniprotLastUpdate","hash":{},"data":data}) : helper)))
    + "</dd>\n                <dd>Entry version "
    + alias3(((helper = (helper = helpers.version || (depth0 != null ? depth0.version : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"version","hash":{},"data":data}) : helper)))
    + "</dd>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.lastSeqUpdate : depth0),{"name":"if","hash":{},"fn":this.program(105, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                <dd>Sequence version "
    + alias3(((helper = (helper = helpers.seqVersion || (depth0 != null ? depth0.seqVersion : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"seqVersion","hash":{},"data":data}) : helper)))
    + "</dd>\n                <dd>";
  stack1 = ((helper = (helper = helpers.accessionNumber || (depth0 != null ? depth0.accessionNumber : depth0)) != null ? helper : alias1),(options={"name":"accessionNumber","hash":{},"fn":this.program(107, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.accessionNumber) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</dd>\n            </dl>\n        </div>\n    </div>\n</div>\n<p style=\"margin:10px 10px;\">"
    + alias3(((helper = (helper = helpers.proteineEvidence || (depth0 != null ? depth0.proteineEvidence : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"proteineEvidence","hash":{},"data":data}) : helper)))
    + ". "
    + alias3(((helper = (helper = helpers.proteineEvidenceCaution || (depth0 != null ? depth0.proteineEvidenceCaution : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"proteineEvidenceCaution","hash":{},"data":data}) : helper)))
    + "</p>";
},"useData":true});