//Utility methods
var NXUtils = {

    checkIsoformMatch: function (isoname, isonumber) {
        return isoname.endsWith("-" + isonumber)
    },
    getIsoforms: function(isoforms){
        if (isoforms && isoforms.length > 1 ) {
            isoforms.sort(NXUtils.sortIsoformNames);
            isoforms.forEach(function(iso){
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
                        names[elem].names.push({name: an.name, synonyms: NXUtils.getSynonyms(NXUtils.mergeArraysOfObjects(an.clazz,an.synonyms, an.otherRecommendedEntityNames))});
                        found = true;
                    }
                }
                if (!found) {
                    names.push({type: type, names: [{name: an.name, synonyms: NXUtils.getSynonyms(NXUtils.mergeArraysOfObjects(an.clazz,an.synonyms, an.otherRecommendedEntityNames))}]})
                }
            });
        }
        names.map(function(n){n.names.sort(NXUtils.sortByAlphabet)});
//        names.forEach(function(n) {if (n.type === "Alternative name" && n.names.length > 1) {n.type = "Alternative names"}});
        return names;
    },
    mergeArraysOfObjects: function(type,arr1,arr2){
        if (!(arr2 && arr2.length> 0)) return arr1;
        else if (!(arr1 && arr1.length> 0)) return arr2;
        var arr3 = [];
        for(var i in arr1){
            var shared = false;
            for (var j in arr2)
                if (arr2[j].name == arr1[i].name) {
                    shared = true;
                    break;
                }
            if(!shared) arr3.push(arr1[i])
        }
        arr3 = arr3.concat(arr2);
        return arr3;
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
    getLinkForFeature: function (domain, accession, description, type) {
        if (type === "Peptide" || type === "SRM Peptide") {
            if (description) {
                var url = "https://db.systemsbiology.net/sbeams/cgi/PeptideAtlas/GetPeptide?searchWithinThis=Peptide+Name&searchForThis=" + description + ";organism_name=Human";
                return "<a class='extLink' href='" + url + "'>" + description + "</a>";
            }
        } else if (type === "antibody") {
            var url = accession;
            return "<a class='extLink' href='" + url + "'>" + description + "</a>";
        } else if (type === "publication") {
            var url = domain + "/publication/" + accession;
            return "<a href='" + url + "'>" + description + "</a>";
        } else if (accession) {
            var url = domain + "/term/" + accession;
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
    convertMappingsToIsoformMap: function (featMappings, category, group, baseUrl) {
        var domain = baseUrl ? baseUrl : baseUrl === "" ? baseUrl : "https://www.nextprot.org";
        var mappings = jQuery.extend([], featMappings);
        var publiActive = false;
        if (featMappings.hasOwnProperty("annot")) {
            publiActive = true;
            mappings = jQuery.extend([], featMappings.annot);
        }
        var result = {};

        var _getMoreDescription = function(mapping) {

            if (mapping.category === "sequence conflict") {
                // ex: In Ref. 3; BAG65616. => In BAG65616.
                return mapping.description.replace(/Ref\. \d+; /, "");
            }
            else if (mapping.category !== "sequence variant") {
                return mapping.description;
            }
            return "";
        };

        mappings.forEach(function (mapping) {
            if (mapping.hasOwnProperty("targetingIsoformsMap")) {
                for (var name in mapping.targetingIsoformsMap) {
                    if (mapping.targetingIsoformsMap.hasOwnProperty(name)) {
                        var uniqueName = mapping.uniqueName;
                        var start = mapping.targetingIsoformsMap[name].firstPosition;
                        var end = mapping.targetingIsoformsMap[name].lastPosition;
                        var length = start && end ? end - start + 1 : null;
                        var description = NXUtils.getDescription(mapping,category);
                        var link = NXUtils.getLinkForFeature(domain, mapping.cvTermAccessionCode, description, category);
                        var quality = mapping.qualityQualifier ? mapping.qualityQualifier.toLowerCase() : "";
                        var proteotypic = NXUtils.getProteotypicity(mapping.properties);
                        var variant = false;
                        var source = mapping.evidences.map(function (d) {
                            var pub = null;
                            var xref = null;
                            var context = (featMappings.contexts[d.experimentalContextId]) ? featMappings.contexts[d.experimentalContextId] : false;
                            if (publiActive) {
                                if (featMappings.publi[d.resourceId]) {
                                    pub = d.resourceId;
                                }
                                if (featMappings.xrefs[d.resourceId]) {
                                    xref = featMappings.xrefs[d.resourceId];
                                }
                                return {
                                    evidenceCodeName: NXUtils.getEvidenceCodeName(d,category),
                                    assignedBy: NXUtils.getAssignedBy(d.assignedBy),
                                    resourceDb: d.resourceDb,
                                    externalDb: d.resourceDb !== "UniProt",
                                    qualityQualifier: d.qualityQualifier.toLowerCase(),
                                    publicationMD5: d.publicationMD5,
                                    publication: pub ? featMappings.publi[pub]: null,
                                    dbXrefs: pub ? featMappings.publi[pub].dbXrefs ?featMappings.publi[pub].dbXrefs.map(function (o) {
                                        return {
                                            name: o.databaseName === "DOI" ? "Full Text" : o.databaseName,
                                            url: o.resolvedUrl,
                                            accession: o.accession
                                        }
                                    }) : [] : [],
                                    crossRef: xref ? {
                                        dbName: xref.databaseName,
                                        name: xref.accession,
                                        url: xref.resolvedUrl
                                    } : null,
                                    context: context
                                }
                            } else {
                                return {
                                    evidenceCodeName: NXUtils.getEvidenceCodeName(d, category),
                                    assignedBy: NXUtils.getAssignedBy(d.assignedBy),
                                    publicationMD5: d.publicationMD5,
                                    title: "",
                                    authors: [],
                                    journal: "",
                                    volume: "",
                                    abstract: "",
                                    context: context
                                }
                            }
                        });

                        if (mapping.hasOwnProperty("variant") && !jQuery.isEmptyObject(mapping.variant)) {

                            link = "<span class='variant-description'>" + mapping.variant.original + " → " + mapping.variant.variant + "</span>";

                            var moreDescription = _getMoreDescription(mapping);

                            description = "<span class='variant-description'>" + mapping.variant.original + " → " + mapping.variant.variant +
                                ((moreDescription) ? ": "+ moreDescription : "") + "</span>  ";

                            variant = true;

                            if (mapping.description) {
                                var reg = /\[(.*?)\]/g;
                                var matches = mapping.description.match(reg);
                                var desc = mapping.description;
                                for (var m in matches) {
                                    var matchElements = matches[m].substring(1, matches[m].length - 1).split(":");
                                    var desc = desc.replace(matches[m], NXUtils.getLinkForFeature(domain, matchElements[2], matchElements[0]));

                                }
                                link += " ; " + desc;
                            }
                        }
                        if (!result[name]) result[name] = [];
                        var idStart = start ? start.toString() : "NA";
                        var idEnd = end ? end.toString() : "NA";
                        result[name].push({
                            start: start,
                            end: end,
                            length: length,
                            id: category.replace(/\s/g, '') + "_" + idStart + "_" + idEnd + "_" + uniqueName,
                            description: description,
                            quality: quality,
                            proteotypicity: proteotypic,
                            category: category,
                            group: group,
                            link: link,
                            evidenceLength: source.length,
                            source: source,
                            variant: variant,
                            context: featMappings.contexts
                        });
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
                if (a.start === null) return 0;
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
    convertNXAnnotations: function (annotations, metadata, isoLengths) {
        if (!annotations) return "Cannot load this";
        var result = {};
        for (name in annotations) {
            var meta = jQuery.extend({}, metadata);
            meta.data = annotations[name].map(function (annotation) {
                return {
                    x: annotation.start ? annotation.start : 1,
                    y: annotation.end ? annotation.end : isoLengths && isoLengths[name] ? isoLengths[name] : 100000,
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
}