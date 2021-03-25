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

        var _convertToTupleMap = function (data, category, term) {
            var publiMap = {};
            var isoformMap = {};
            var xrefMap = {};
            var experimentalContexts = {};
            var mdataMap = {};
            if (data.entry.publications){
                data.entry.publications.forEach(function (p) {
                    publiMap[p.publicationId] = p;
                });
            }
            if (data.entry.isoforms){
                data.entry.isoforms.forEach(function (i) {
                    isoformMap[i.isoformAccession] = i;
                });
            }
            if (data.entry.experimentalContexts){
                data.entry.experimentalContexts.forEach(function (c) {
                    experimentalContexts[c.contextId] = c;
                });
            }
            if (data.entry.mdataList){
                data.entry.mdataList.forEach(function (c) {
                    mdataMap[c.id] = c;
                });
            }
            data.entry.xrefs.forEach(function (p) {
                xrefMap[p.dbXrefId] = p;
            });
            if (category=="keyword") category = "uniprot-keyword";
            if(category && data.entry.annotationsByCategory && Object.keys(data.entry.annotationsByCategory).length > 0){
                for(var key in data.entry.annotationsByCategory) {
                    if(!data.entry.annotations) data.entry.annotations = [];
                    data.entry.annotations = data.entry.annotations.concat(data.entry.annotationsByCategory[key]);
                }
            }
            return {
                childrenOfCvTerm: term,
                annot: (data.entry.annotations === undefined) ? [] : data.entry.annotations,
                publi: publiMap,
                xrefs: xrefMap,
                isoforms: isoformMap,
                contexts: experimentalContexts,
                mdata: mdataMap

            };
        };

        var normalizeEntry = function (entry) {
            if (entry.substring(0, 3) !== "NX_") {
                entry = "NX_" + entry;
            }
            return entry;
        };

        var goldOnly = function (annotations) {
            annotations.forEach(function(a){a.evidences = a.evidences.filter(function(e){return e.qualityQualifier === "GOLD"})});
            return annotations.filter(function(a){ return a.evidences.length > 0 });
        }


        var environment = _getURLParameter("env") || 'pro'; //By default returns the production
        var apiBaseUrl = "https://api.nextprot.org";
        var nextprotUrl = "https://www.nextprot.org";
        var sparqlEndpoint = apiBaseUrl + "/sparql";
        var sparqlFormat = "?output=json";

        var applicationName = null;
        var clientInfo = null;
        var goldOnly = null;

        function setEnvironment(env){
            environment = env||_getURLParameter("env") || 'pro'; //By default returns the production
            apiBaseUrl = "https://api.nextprot.org";
            nextprotUrl = "https://www.nextprot.org";
            if (environment !== 'pro') {
                apiBaseUrl = "https://" + environment + "-api.nextprot.org";
                nextprotUrl = "https://" + environment + "-search.nextprot.org";
                
                if (environment === 'localhost') {
                    apiBaseUrl = protocol + "localhost:8080/nextprot-api-web";
                    nextprotUrl = protocol + 'localhost:3000';
                }
            }
            //console.log("nx api base url : " + apiBaseUrl);
            sparqlEndpoint = apiBaseUrl + "/sparql";
            sparqlFormat = "?output=json";
        }
        setEnvironment();

        function _getJSON(url) {

            var finalURL = url;
            finalURL = _changeParamOrAddParamByName(finalURL, "clientInfo", clientInfo);
            finalURL = _changeParamOrAddParamByName(finalURL, "applicationName", applicationName);

            if (goldOnly) finalURL = _changeParamOrAddParamByName(finalURL, "goldOnly", goldOnly);

            return Promise.resolve($.getJSON(finalURL));
            //return get(url).then(JSON.parse);
        }


        var _getEntry = function (entry, context, term) {
            var entryName = normalizeEntry(_getURLParameter("nxentry") || (entry || 'NX_P01308'));
            var url = apiBaseUrl + "/entry/" + entryName;
            if (context) {
                url += "/" + context;
            }
            if (term) url+= "?term-child-of="+term;

            return _getJSON(url);
        };

        var _getEntryPageView = function (entry, view, part) {

            var entryName = normalizeEntry(_getURLParameter("nxentry") || (entry || 'NX_P01308'));
            var url = apiBaseUrl + "/page-view/" + view + "/" + entryName + "/" + part;

            return _getJSON(url);
        };

        var _getEntryWithProperty = function (entry, context, propertyName, propertyValue) {
            var entryName = normalizeEntry(_getURLParameter("nxentry") || (entry || 'NX_P01308'));
            var url = apiBaseUrl + "/entry/" + entryName;
            if (context) {
                url += "/" + context;
            }
            if (propertyName && propertyValue) url+= "?property-name="+propertyName+"&property-value="+propertyValue;

            return _getJSON(url);
        };


        var _getPublicationById = function (id) {
            var url = apiBaseUrl + "/publication/" + id + ".json";
            return _getJSON(url);
        };

        var _callPepX = function (seq, mode) {
            var url = apiBaseUrl + "/entries/search/peptide?peptide=" + seq + "&modeIL=" + mode;
            return _getJSON(url);
        };

        var _callTerminology = function (terminologyName) {
            var url = apiBaseUrl + "/terminology/" + terminologyName;
            return _getJSON(url);
        };

        var _callTerm = function (cvTermAccession) {
            var url = apiBaseUrl + "/term/" + cvTermAccession;
            return _getJSON(url);
        };

        var NextprotClient = function (appName, clientInformation) {
            applicationName = appName;
            clientInfo = clientInformation;
            goldOnly = _getURLParameter("goldOnly");

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
        /** By default it is set to https://api.nextprot.org */
        NextprotClient.prototype.setEnv = function (_env) {
            environment = _env;
        };
        //////////////// END Setters ////////////////////////////////////////////////////////////////////////
        NextprotClient.prototype.updateEnvironment = function(env){
            setEnvironment(env);
        }
        //Gets the entry set in the parameter
        NextprotClient.prototype.getEnvironment = function () {
            return _getURLParameter("env") || 'pro'; //By default returns the insulin
        };
        NextprotClient.prototype.getQualitySelector = function () {
            return _getURLParameter("qualitySelector") || '';
        };
        NextprotClient.prototype.getGoldOnlySelector = function () {
            return _getURLParameter("goldOnly") || ''; // GOLD || GOLD & SILVER
        };
        NextprotClient.prototype.getApiBaseUrl = function () {
            return apiBaseUrl;
        };
        NextprotClient.prototype.getNeXtProtUrl = function () {
            return nextprotUrl;
        };

        //Gets the entry set in the parameter
        NextprotClient.prototype.getEntryName = function (entry) {
            return normalizeEntry(_getURLParameter("nxentry") || entry || 'NX_P01308'); //By default returns the insulin
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
        NextprotClient.prototype.getPublicationById = function (id) {
            return _getPublicationById(id);
        };


        /** USE THIS INSTEAD OF THE OTHERS for example getEntryPart(NX_1038042, "ptm") */
        NextprotClient.prototype.getAnnotationsByCategory = function (entry, category, term) {
            return _getEntry(entry, category, term).then(function (data) {
                return _convertToTupleMap(data, category, term);
            });
        };

        NextprotClient.prototype.getEntryXrefInPageView = function (entry, view) {

            return _getEntryPageView(entry, view, "xref").then(function (data) {
                return _convertToTupleMap(data);
            });
        };

        NextprotClient.prototype.getAnnotationsWithProperty = function (entry, category, propertyName, propertyValue) {
            return _getEntryWithProperty(entry, category, propertyName, propertyValue).then(function (data) {
                return _convertToTupleMap(data, category);
            });
        };

        NextprotClient.prototype.getFullAnnotationsByCategory = function (entry, category) {
            return _getEntry(entry, category).then(function (data) {
                return data.entry;
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

        NextprotClient.prototype.filterGoldOnlyAnnotations = function (annotations) {
            return goldOnly(annotations);
        };

        NextprotClient.prototype.getBlastByIsoform = function (isoform, matrix, evalue, gapopen, gapextend, begin, end) {
            var positions = "";
            if (begin && end) positions = "&begin="+begin+"&end="+end;
            return _getJSON(apiBaseUrl+"/blast/isoform/"+isoform+"?&matrix="+matrix+"&evalue="+evalue+"&gapopen="+gapopen+"&gapextend="+gapextend+positions)
                .then(function (data) {
                    return data;
                });
        };

        NextprotClient.prototype.getBlastBySequence = function (sequence, title, matrix, evalue, gapopen, gapextend) {
            return _getJSON(apiBaseUrl+"/blast/sequence/"+sequence+"?title="+title+"&matrix="+matrix+"&evalue="+evalue+"&gapopen="+gapopen+"&gapextend="+gapextend)
                .then(function (data) {
                    return data;
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

        NextprotClient.prototype.getTerminologyByName = function (terminologyName) {
            return _callTerminology(terminologyName).then(function (data) {
                return data;
            });
        };

        NextprotClient.prototype.getTermByAccession = function (cvTermAccession) {
            return _callTerm(cvTermAccession).then(function (data) {
                return data;
            });
        };

        NextprotClient.prototype.getChromosomeNames = function () {
            return _getJSON(apiBaseUrl+"/chromosomes.json")
                .then(function (data) {
                    return data;
                });
        };

        NextprotClient.prototype.getChromosomeReportsSummary = function () {
            return _getJSON(apiBaseUrl+"/chromosome-reports/summary.json")
                .then(function (data) {
                    return data;
                });
        };

        NextprotClient.prototype.getChromosomeReportEntries = function (chromosome) {
            return _getJSON(apiBaseUrl+"/chromosome-report/"+chromosome+".json")
                .then(function (data) {
                    return data;
                });
        };

        NextprotClient.prototype.getJSON = function (path, noappend) {
            path = (!path.startsWith("/")) ? "/" + path : path;

            if((noappend === undefined) || !noappend)
		path = (!path.endsWith(".json")) ? path+".json" : path;

            return _getJSON(apiBaseUrl+path)
                .then(function (data) {
                    return data;
                });
        };

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
    getProteinExistence: function(pe){
        var description = pe.description;
        var existence = description.toLowerCase();
        var mainSentence = "Entry whose protein(s) existence is ";
        switch(existence) {
            case "uncertain":
                return mainSentence + existence;
            case "inferred from homology":
                return mainSentence + existence;
            default:
                return mainSentence + "based on " + existence;
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
    getLinkForFeature: function (domain, accession, description, type, feature, xrefDict) {

        //TOSEE WITH MATHIEU - On 15.02.2018 Daniel has added feature + xrefDict in the signature of this method. Is it still necessary to hardcode some other (resee signature because now fields are redudant)
        if (type === "Peptide" || type === "SRM Peptide") {
            if (description) {
                if(feature && feature.evidences && (feature.evidences.length > 0) && feature.evidences[0].resourceId && xrefDict){
                    if(xrefDict[feature.evidences[0].resourceId]) {
                        var url = xrefDict[feature.evidences[0].resourceId].resolvedUrl
                        return "<a class='ext-link' href='" + url + "' target='_blank'>" + description + "</a>";
                    }
                }
                console.warn("Could not find xref for evidence ", xrefDict[feature.evidences[0]]);
                return ""
            }
            else return "";
        } else if (type === "Antibody") {
            if(domain) return "<a class='ext-link' href='" + domain + "' target='_blank'>" + accession + "</a>";
//            if(domain) return "<a class='ext-link' href='" + domain + "'>" + accession + "<span class='fa fa-external-link'></span></a>";
            else return "";
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
        else if (category === "Antibody"){
            for (var ev in elem.evidences) {
                if (elem.evidences[ev].resourceDb === "HPA") {
                    return elem.evidences[ev].resourceAccession;
                }
            }
        }
        else return elem.description;
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
    getUnicity: function (elem){
        if (elem.propertiesMap.hasOwnProperty("peptide unicity")){
            var unicity = elem.propertiesMap["peptide unicity"][0].value;
            var unicityValue = unicity === "PSEUDO_UNIQUE" ? "pseudo-unique" : unicity.replace("_"," ").toLowerCase();
            return unicityValue;
        }
        if (elem.propertiesMap.hasOwnProperty("antibody unicity")){
            var unicity = elem.propertiesMap["antibody unicity"][0].value;
            var unicityValue = unicity === "PSEUDO_UNIQUE" ? "pseudo-unique" : unicity == "UNIQUE" ? "unique" : "not unique";
            return unicityValue;
        }
        return "";
    },
    truncateString: function(str, lenMax, internalString, suffixLen) {

        if (str) {
            internalString = internalString || "";
            suffixLen = suffixLen || 0;

            if (lenMax <= 0) throw new Error("maximum length should be strictly positive");

            if (str.length > lenMax) {
                if (suffixLen < 0) throw new Error("suffix length should be positive");
                if (suffixLen > lenMax) throw new Error("suffix " + suffixLen + " should be shorter than maximum length " + lenMax);

                var prefixLen = lenMax - (suffixLen + internalString.length);
                return str.substr(0, prefixLen) + internalString + str.substr(str.length - suffixLen, suffixLen);
            }
        }
        return str;
    },
    getMdataPubLink: function (pubId){
        return pubId.map(function(pb){
            if (pb.db === "PubMed"){
                return{
                    url: "https://www.ncbi.nlm.nih.gov/pubmed?cmd=search&term=" + pb.dbkey,
                    accession: pb.dbkey,
                    label: "PubMed"
                }
            }
            else if (pb.db === "DOI"){
                return{
                    url: "http://dx.doi.org/" + pb.dbkey,
                    accession:pb.dbkey,
                    label:"Full text"
                }
            }
        })
    },
    convertMappingsToIsoformMap: function (featMappings, category, group, baseUrl) {
        var xrefsDict = featMappings.xrefs;
        var domain = baseUrl ? baseUrl : baseUrl === "" ? baseUrl : "https://www.nextprot.org";
        var mappings = jQuery.extend([], featMappings);
        var publiActive = false;
        if (featMappings.hasOwnProperty("annot")) {
            publiActive = true;
            mappings = jQuery.extend([], featMappings.annot);
        }
        var result = {};

        var thisNXUtilsObject = this;

        mappings.forEach(function (mapping) {
            if (mapping.hasOwnProperty("targetingIsoformsMap")) {
                for (var name in mapping.targetingIsoformsMap) {
                    if (mapping.targetingIsoformsMap.hasOwnProperty(name)) {
                        var uniqueName = mapping.uniqueName;
                        var start = mapping.targetingIsoformsMap[name].firstPosition;
                        var end = mapping.targetingIsoformsMap[name].lastPosition;
                        var length = start && end ? end - start + 1 : null;
                        var description = NXUtils.getDescription(mapping,category);
                        var link = NXUtils.getLinkForFeature(domain, mapping.cvTermAccessionCode, description, category, mapping, xrefsDict);
                        var quality = mapping.qualityQualifier ? mapping.qualityQualifier.toLowerCase() : "";
                        var proteotypic = NXUtils.getProteotypicity(mapping.properties);
                        var unicity = NXUtils.getUnicity(mapping);;
                        var variant = false;
                        var source = mapping.evidences.map(function (d) {
                            var pub = null;
                            var xref = null;
                            var mdata = null;
                            var context = (featMappings.contexts[d.experimentalContextId]) ? featMappings.contexts[d.experimentalContextId] : false;
                            if (publiActive) {
                                if (featMappings.publi[d.resourceId]) {
                                    pub = d.resourceId;
                                }
                                if (featMappings.xrefs[d.resourceId]) {
                                    xref = featMappings.xrefs[d.resourceId];
                                }
                                if (featMappings.mdata[d.mdataId]) {
                                    mdata = featMappings.mdata[d.mdataId].mdataContext;
                                    if (mdata && mdata.publications && mdata.publications.values) {
//                                        mdata.publications = mdata.publications.values.map(function(pb){
//                                            return featMappings.publi[pb.db_xref.dbkey];
//                                        })
                                        var pubId = mdata.publications.values.map(function(pb){
//                                            return featMappings.publi[pb.db_xref.dbkey];
//                                            return pb.db_xref.dbkey;
                                            return pb.db_xref;
                                        })
                                        mdata.mdataPubLink = NXUtils.getMdataPubLink(pubId);
                                        mdata.publications = null; null;
                                    }
                                }
                                return {
                                    evidenceCodeName: d.evidenceCodeName,
                                    assignedBy: NXUtils.getAssignedBy(d.assignedBy),
                                    resourceDb: d.resourceDb,
                                    externalDb: d.resourceDb !== "UniProt",
                                    qualityQualifier: d.qualityQualifier ? d.qualityQualifier.toLowerCase() : "",
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
                                    context: context,
                                    mdata: mdata,
                                    properties: d.properties ? d.properties : null
                                }
                            } else {
                                return {
                                    evidenceCodeName: d.evidenceCodeName,
                                    assignedBy: NXUtils.getAssignedBy(d.assignedBy),
                                    publicationMD5: d.publicationMD5,
                                    title: "",
                                    authors: [],
                                    journal: "",
                                    volume: "",
                                    abstract: "",
                                    context: context,
                                    mdata: mdata,
                                    properties: d.properties ? d.properties : null
                                }
                            }
                        });

                        if (mapping.hasOwnProperty("variant") && !jQuery.isEmptyObject(mapping.variant)) {

                            function buildVariantObjectForTooltip(mapping) {

                                function cleanDescriptionText(category, rawDescription) {

                                    var formattedDescription = "";

                                    if (rawDescription) {

                                        formattedDescription = ": ";

                                        if (category === "sequence conflict") {
                                            // ex: In Ref. 3; BAG65616.
                                            // => In BAG65616.
                                            formattedDescription += rawDescription.replace(/Ref\. \d+; /, "");
                                        }
                                        else if (category === "sequence variant") {
                                            // ex: In [LQT6:UNIPROT_DISEASE:DI-00684]; may affect KCNQ1/KCNE2 channel
                                            // => In LQT6; may affect KCNQ1/KCNE2 channel
                                            var results = /In\s+\[([^:]+):[^\]]+\](.*)/.exec(rawDescription);
                                            formattedDescription += (results) ? "In "+ results[1] + results[2] : rawDescription;
                                        }
                                        else {
                                            formattedDescription += rawDescription;
                                        }
                                    }
                                    return formattedDescription;
                                }

                                var originalAAs;
                                var variantAAs;

                                if (mapping.category === "sequence variant") {
                                    originalAAs = thisNXUtilsObject.truncateString(mapping.variant.original, 9, "...", 3);
                                    variantAAs  = thisNXUtilsObject.truncateString(mapping.variant.variant, 9, "...", 3);
                                } else {
                                    originalAAs = mapping.variant.original;
                                    variantAAs  = mapping.variant.variant;
                                }

                                var descriptionFormatted = cleanDescriptionText(mapping.category, mapping.description);

                                return {
                                    original: originalAAs,
                                    variant: variantAAs,
                                    description: thisNXUtilsObject.truncateString(descriptionFormatted, 80, " ... ", 40)
                                };
                            }

                            function buildVariantDescriptionWithLinks(description) {

                                function _replacePotentialLinks(description) {

                                    var withLinksDesc = description;

                                    // ex: In [LQT6:UNIPROT_DISEASE:DI-00684]; unknown pathological significance
                                    var matchedLinks = description.match(/\[([^\]]+)\]/g);

                                    for (var m in matchedLinks) {

                                        var matchElements = matchedLinks[m].substring(1, matchedLinks[m].length - 1).split(":");
                                        withLinksDesc = withLinksDesc.replace(matchedLinks[m], NXUtils.getLinkForFeature(domain, matchElements[2], matchElements[0]));
                                    }

                                    return withLinksDesc;
                                }

                                return (description) ?  " ; " + _replacePotentialLinks(description) : "";
                            }

                            var variantObj = buildVariantObjectForTooltip(mapping);
                            var descWithPotentialLinks = buildVariantDescriptionWithLinks(mapping.description);

                            description = "<span class='variant-description'>" + variantObj.original + " → " + variantObj.variant + variantObj.description + "</span>";
                            link = "<span class='variant-description'>" + mapping.variant.original + " → " + mapping.variant.variant + "</span>" + descWithPotentialLinks;

                            variant = true;
                        }
                        else if (category === "Antibody") {
                            url = featMappings.xrefs[mapping.evidences[0].resourceId].resolvedUrl
                            link = NXUtils.getLinkForFeature(url, description, description, category);
                        }
                        else {
                            description = thisNXUtilsObject.truncateString(description, 80, " ... ", 40);
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
                            unicity: unicity,
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
                    description: annotation.description // tooltip description
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

    var loadOverview = function (overview, nxEntryName, nxUrl) {
        if ($("#nx-overview").length > 0) {
            Handlebars.registerHelper('link_to', function (type, options) {
                switch (type) {
                case "term":
                    var url = nxUrl + "/term/" + this.accession;
                    return "<a href='" + url + "'>" + this.name + "</a>";
                case "EC":
                    var url = nxUrl + "/term/" + this;
                    return "<a href='" + url + "'> EC " + this + " </a>";
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

    var Nextprot = window.Nextprot;
    var nx;
    if(nx === undefined)
        var nx = new Nextprot.Client("neXtprot overview loader", "Calipho Group");

    if ($("#nx-overview").length > 0) { // load the overview if it exists
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

});;
this["HBtemplates"] = this["HBtemplates"] || {};

this["HBtemplates"]["templates/overviewProtein.tmpl"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " "
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = ((stack1 = (depth0 != null ? depth0.geneName : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.name : stack1),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1;

  return container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.geneName : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.name : stack1), depth0))
    + "  →  ";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.EC : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.mainShortName : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "[";
  stack1 = ((helper = (helper = helpers.EC || (depth0 != null ? depth0.EC : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"EC","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.EC) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + " ] ";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return " "
    + ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(alias1,"EC",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers.unless.call(alias1,(data && data.last),{"name":"unless","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " ";
},"7":function(container,depth0,helpers,partials,data) {
    return ",";
},"9":function(container,depth0,helpers,partials,data) {
    var helper;

  return "( "
    + container.escapeExpression(((helper = (helper = helpers.mainShortName || (depth0 != null ? depth0.mainShortName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"mainShortName","hash":{},"data":data}) : helper)))
    + " ) ";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <div id=\"synonym-less\" class=\"row\">\n        <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">Protein also known as :</div>\n        <div class=\"col-md-9 col-xs-9\">";
  stack1 = ((helper = (helper = helpers.recommendedProteinName || (depth0 != null ? depth0.recommendedProteinName : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"recommendedProteinName","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.recommendedProteinName) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n    </div>\n";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=helpers.blockHelperMissing, buffer = "";

  stack1 = ((helper = (helper = helpers.mainSynonymName || (depth0 != null ? depth0.mainSynonymName : depth0)) != null ? helper : alias2),(options={"name":"mainSynonymName","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.mainSynonymName) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.others : depth0),{"name":"if","hash":{},"fn":container.program(16, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
  stack1 = ((helper = (helper = helpers.others || (depth0 != null ? depth0.others : depth0)) != null ? helper : alias2),(options={"name":"others","hash":{},"fn":container.program(18, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.others) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.synonym : depth0),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"14":function(container,depth0,helpers,partials,data) {
    var helper;

  return " ("
    + container.escapeExpression(((helper = (helper = helpers.synonym || (depth0 != null ? depth0.synonym : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"synonym","hash":{},"data":data}) : helper)))
    + ") ";
},"16":function(container,depth0,helpers,partials,data) {
    return " ; ";
},"18":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, buffer = 
  alias4(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"type","hash":{},"data":data}) : helper)))
    + alias4((helpers.plural || (depth0 && depth0.plural) || alias2).call(alias1,(depth0 != null ? depth0.names : depth0),{"name":"plural","hash":{},"data":data}))
    + ":";
  stack1 = ((helper = (helper = helpers.names || (depth0 != null ? depth0.names : depth0)) != null ? helper : alias2),(options={"name":"names","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.names) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + ((stack1 = helpers.unless.call(alias1,(data && data.last),{"name":"unless","hash":{},"fn":container.program(21, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"19":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return " "
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers.unless.call(alias1,(data && data.last),{"name":"unless","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"21":function(container,depth0,helpers,partials,data) {
    return "; ";
},"23":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? depth0.recommendedProteinName : depth0)) != null ? stack1.others : stack1),{"name":"if","hash":{},"fn":container.program(24, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"24":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <div id=\"synonym-other-less\" class=\"row\">\n        <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">Protein also known as :</div>\n        <div class=\"col-md-9 col-xs-9\">";
  stack1 = ((helper = (helper = helpers.recommendedProteinName || (depth0 != null ? depth0.recommendedProteinName : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"recommendedProteinName","hash":{},"fn":container.program(25, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.recommendedProteinName) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n    </div>\n";
},"25":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options;

  stack1 = ((helper = (helper = helpers.others || (depth0 != null ? depth0.others : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"others","hash":{},"fn":container.program(26, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.others) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { return stack1; }
  else { return ''; }
},"26":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, buffer = 
  " "
    + alias4(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"type","hash":{},"data":data}) : helper)))
    + alias4((helpers.plural || (depth0 && depth0.plural) || alias2).call(alias1,(depth0 != null ? depth0.names : depth0),{"name":"plural","hash":{},"data":data}))
    + ":";
  stack1 = ((helper = (helper = helpers.names || (depth0 != null ? depth0.names : depth0)) != null ? helper : alias2),(options={"name":"names","hash":{},"fn":container.program(27, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.names) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + ((stack1 = helpers.unless.call(alias1,(data && data.last),{"name":"unless","hash":{},"fn":container.program(21, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"27":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers.unless.call(alias1,(data && data.last),{"name":"unless","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"29":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <div id=\"cleavage-less\" class=\"row\">\n        <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">Cleaved into :</div>\n        <div class=\"col-md-6 col-xs-6\">";
  stack1 = ((helper = (helper = helpers.cleavage || (depth0 != null ? depth0.cleavage : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"cleavage","hash":{},"fn":container.program(30, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.cleavage) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n    </div>\n";
},"30":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options;

  stack1 = ((helper = (helper = helpers.names || (depth0 != null ? depth0.names : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"names","hash":{},"fn":container.program(31, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.names) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { return stack1; }
  else { return ''; }
},"31":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return "<span>"
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers.unless.call(alias1,(data && data.last),{"name":"unless","hash":{},"fn":container.program(21, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</span>";
},"33":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = ((stack1 = (depth0 != null ? depth0.geneName : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.name : stack1),{"name":"if","hash":{},"fn":container.program(34, data, 0),"inverse":container.program(37, data, 0),"data":data})) != null ? stack1 : "");
},"34":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "            <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">Gene name :</div>\n            <div class=\"col-md-6 col-xs-6\" >";
  stack1 = ((helper = (helper = helpers.geneName || (depth0 != null ? depth0.geneName : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"geneName","hash":{},"fn":container.program(35, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.geneName) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"35":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers.unless.call(alias1,(data && data.last),{"name":"unless","hash":{},"fn":container.program(21, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"37":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "            <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">ORF name :</div>\n            <div class=\"col-md-6 col-xs-6\">"
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.geneName : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.orf : stack1)) != null ? stack1["0"] : stack1)) != null ? stack1.name : stack1), depth0))
    + "</div>\n";
},"39":function(container,depth0,helpers,partials,data) {
    return "            <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">Gene name :</div>\n            <div class=\"col-md-6 col-xs-6\" >None assigned yet</div>\n";
},"41":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <div id=\"family-less\" class=\"row\">\n        <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">Family name :</div>\n        <div class=\"col-md-6 col-xs-6\">";
  stack1 = ((helper = (helper = helpers.families || (depth0 != null ? depth0.families : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"families","hash":{},"fn":container.program(42, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.families) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n    </div>\n";
},"42":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), buffer = 
  "<span>";
  stack1 = ((helper = (helper = helpers.superfamily || (depth0 != null ? depth0.superfamily : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"superfamily","hash":{},"fn":container.program(43, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(alias1,options) : helper));
  if (!helpers.superfamily) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.family : depth0),{"name":"if","hash":{},"fn":container.program(45, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.subfamily : depth0),{"name":"if","hash":{},"fn":container.program(50, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</span>";
},"43":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"term",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "");
},"45":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), buffer = 
  ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.superfamily : depth0),{"name":"if","hash":{},"fn":container.program(46, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
  stack1 = ((helper = (helper = helpers.family || (depth0 != null ? depth0.family : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"family","hash":{},"fn":container.program(48, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(alias1,options) : helper));
  if (!helpers.family) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"46":function(container,depth0,helpers,partials,data) {
    return " >> ";
},"48":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " "
    + ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"term",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + " ";
},"50":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), buffer = 
  ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.family : depth0),{"name":"if","hash":{},"fn":container.program(46, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
  stack1 = ((helper = (helper = helpers.subfamily || (depth0 != null ? depth0.subfamily : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"subfamily","hash":{},"fn":container.program(51, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(alias1,options) : helper));
  if (!helpers.subfamily) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"51":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"term",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + " ";
},"53":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", buffer = 
  "                <dd>"
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.EC : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
  stack1 = ((helper = (helper = helpers.synonyms || (depth0 != null ? depth0.synonyms : depth0)) != null ? helper : alias2),(options={"name":"synonyms","hash":{},"fn":container.program(54, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.synonyms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</dd>\n";
},"54":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " "
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0["short"] : depth0),{"name":"if","hash":{},"fn":container.program(55, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"55":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "<span><span style=\"color:grey\">Short: </span> ";
  stack1 = ((helper = (helper = helpers["short"] || (depth0 != null ? depth0["short"] : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"short","hash":{},"fn":container.program(56, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers["short"]) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</span>";
},"56":function(container,depth0,helpers,partials,data) {
    var stack1;

  return container.escapeExpression(container.lambda(depth0, depth0))
    + ((stack1 = helpers.unless.call(depth0 != null ? depth0 : (container.nullContext || {}),(data && data.last),{"name":"unless","hash":{},"fn":container.program(57, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"57":function(container,depth0,helpers,partials,data) {
    return " , ";
},"59":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.alternativeProteinNames || (depth0 != null ? depth0.alternativeProteinNames : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"alternativeProteinNames","hash":{},"fn":container.program(60, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.alternativeProteinNames) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"60":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, buffer = 
  "                <dt>"
    + alias4(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"type","hash":{},"data":data}) : helper)))
    + alias4((helpers.plural || (depth0 && depth0.plural) || alias2).call(alias1,(depth0 != null ? depth0.names : depth0),{"name":"plural","hash":{},"data":data}))
    + "</dt>\n";
  stack1 = ((helper = (helper = helpers.names || (depth0 != null ? depth0.names : depth0)) != null ? helper : alias2),(options={"name":"names","hash":{},"fn":container.program(61, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.names) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"61":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", buffer = 
  "                <dd> "
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\n                    ";
  stack1 = ((helper = (helper = helpers.synonyms || (depth0 != null ? depth0.synonyms : depth0)) != null ? helper : alias2),(options={"name":"synonyms","hash":{},"fn":container.program(62, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.synonyms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n                </dd>\n";
},"62":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.EC : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["short"] : depth0),{"name":"if","hash":{},"fn":container.program(55, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"64":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.functionalRegionNames || (depth0 != null ? depth0.functionalRegionNames : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"functionalRegionNames","hash":{},"fn":container.program(65, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.functionalRegionNames) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"65":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=container.escapeExpression, alias2=depth0 != null ? depth0 : (container.nullContext || {}), alias3=helpers.helperMissing, buffer = 
  "                <dt>Include the following "
    + alias1(container.lambda(((stack1 = (depth0 != null ? depth0.names : depth0)) != null ? stack1.length : stack1), depth0))
    + " functional region"
    + alias1((helpers.plural || (depth0 && depth0.plural) || alias3).call(alias2,(depth0 != null ? depth0.names : depth0),{"name":"plural","hash":{},"data":data}))
    + "</dt>\n";
  stack1 = ((helper = (helper = helpers.names || (depth0 != null ? depth0.names : depth0)) != null ? helper : alias3),(options={"name":"names","hash":{},"fn":container.program(66, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(alias2,options) : helper));
  if (!helpers.names) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"66":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", buffer = 
  "                <dd> "
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\n                    ";
  stack1 = ((helper = (helper = helpers.synonyms || (depth0 != null ? depth0.synonyms : depth0)) != null ? helper : alias2),(options={"name":"synonyms","hash":{},"fn":container.program(67, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.synonyms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n                </dd>\n";
},"67":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.EC : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.full : depth0),{"name":"if","hash":{},"fn":container.program(68, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"68":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, buffer = 
  "<span><span style=\"color:grey\">Alternative name"
    + container.escapeExpression((helpers.plural || (depth0 && depth0.plural) || alias2).call(alias1,(depth0 != null ? depth0.full : depth0),{"name":"plural","hash":{},"data":data}))
    + ":</span> ";
  stack1 = ((helper = (helper = helpers.full || (depth0 != null ? depth0.full : depth0)) != null ? helper : alias2),(options={"name":"full","hash":{},"fn":container.program(69, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(alias1,options) : helper));
  if (!helpers.full) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</span>";
},"69":function(container,depth0,helpers,partials,data) {
    var stack1;

  return container.escapeExpression(container.lambda(depth0, depth0))
    + ((stack1 = helpers.unless.call(depth0 != null ? depth0 : (container.nullContext || {}),(data && data.last),{"name":"unless","hash":{},"fn":container.program(16, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"71":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.cleavage || (depth0 != null ? depth0.cleavage : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"cleavage","hash":{},"fn":container.program(72, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.cleavage) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"72":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=container.escapeExpression, alias2=depth0 != null ? depth0 : (container.nullContext || {}), alias3=helpers.helperMissing, buffer = 
  "                <dt>Cleaved into the following "
    + alias1(container.lambda(((stack1 = (depth0 != null ? depth0.names : depth0)) != null ? stack1.length : stack1), depth0))
    + " chain"
    + alias1((helpers.plural || (depth0 && depth0.plural) || alias3).call(alias2,(depth0 != null ? depth0.names : depth0),{"name":"plural","hash":{},"data":data}))
    + "</dt>\n";
  stack1 = ((helper = (helper = helpers.names || (depth0 != null ? depth0.names : depth0)) != null ? helper : alias3),(options={"name":"names","hash":{},"fn":container.program(73, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(alias2,options) : helper));
  if (!helpers.names) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"73":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", buffer = 
  "                <dd>"
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + " ";
  stack1 = ((helper = (helper = helpers.synonyms || (depth0 != null ? depth0.synonyms : depth0)) != null ? helper : alias2),(options={"name":"synonyms","hash":{},"fn":container.program(67, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.synonyms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</dd>\n";
},"75":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=container.escapeExpression, alias2=depth0 != null ? depth0 : (container.nullContext || {}), alias3=helpers.helperMissing, buffer = 
  "                <dt>Spliced into the following "
    + alias1(container.lambda(((stack1 = (depth0 != null ? depth0.isoforms : depth0)) != null ? stack1.length : stack1), depth0))
    + " isoform"
    + alias1((helpers.plural || (depth0 && depth0.plural) || alias3).call(alias2,(depth0 != null ? depth0.isoforms : depth0),{"name":"plural","hash":{},"data":data}))
    + "</dt>\n";
  stack1 = ((helper = (helper = helpers.isoforms || (depth0 != null ? depth0.isoforms : depth0)) != null ? helper : alias3),(options={"name":"isoforms","hash":{},"fn":container.program(76, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(alias2,options) : helper));
  if (!helpers.isoforms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"76":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return "                <dd>"
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.synonyms : depth0),{"name":"if","hash":{},"fn":container.program(77, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</dd>\n";
},"77":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, buffer = 
  "<span style=\"color:grey\"> Alternative name"
    + container.escapeExpression((helpers.plural || (depth0 && depth0.plural) || alias2).call(alias1,(depth0 != null ? depth0.synonyms : depth0),{"name":"plural","hash":{},"data":data}))
    + ": </span>";
  stack1 = ((helper = (helper = helpers.synonyms || (depth0 != null ? depth0.synonyms : depth0)) != null ? helper : alias2),(options={"name":"synonyms","hash":{},"fn":container.program(78, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(alias1,options) : helper));
  if (!helpers.synonyms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"78":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers.unless.call(alias1,(data && data.last),{"name":"unless","hash":{},"fn":container.program(16, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"80":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.geneName || (depth0 != null ? depth0.geneName : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"geneName","hash":{},"fn":container.program(81, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.geneName) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"81":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.name : depth0),{"name":"if","hash":{},"fn":container.program(82, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.synonyms : depth0),{"name":"if","hash":{},"fn":container.program(84, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.orf : depth0),{"name":"if","hash":{},"fn":container.program(87, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers.unless.call(alias1,(data && data.last),{"name":"unless","hash":{},"fn":container.program(89, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"82":function(container,depth0,helpers,partials,data) {
    var helper;

  return "                <dt>Recommended name</dt>\n                <dd>"
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"name","hash":{},"data":data}) : helper)))
    + "</dd>\n";
},"84":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, buffer = 
  "                <dt>Alternative name"
    + container.escapeExpression((helpers.plural || (depth0 && depth0.plural) || alias2).call(alias1,(depth0 != null ? depth0.synonyms : depth0),{"name":"plural","hash":{},"data":data}))
    + "</dt>\n";
  stack1 = ((helper = (helper = helpers.synonyms || (depth0 != null ? depth0.synonyms : depth0)) != null ? helper : alias2),(options={"name":"synonyms","hash":{},"fn":container.program(85, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(alias1,options) : helper));
  if (!helpers.synonyms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"85":function(container,depth0,helpers,partials,data) {
    var helper;

  return "                <dd> "
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"name","hash":{},"data":data}) : helper)))
    + "</dd>\n";
},"87":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, buffer = 
  "                <dt>ORF name"
    + container.escapeExpression((helpers.plural || (depth0 && depth0.plural) || alias2).call(alias1,(depth0 != null ? depth0.orf : depth0),{"name":"plural","hash":{},"data":data}))
    + "</dt>\n";
  stack1 = ((helper = (helper = helpers.orf || (depth0 != null ? depth0.orf : depth0)) != null ? helper : alias2),(options={"name":"orf","hash":{},"fn":container.program(85, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(alias1,options) : helper));
  if (!helpers.orf) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"89":function(container,depth0,helpers,partials,data) {
    return "                <br>\n";
},"91":function(container,depth0,helpers,partials,data) {
    return "                <dt>Recommended name</dt>\n                <dd>None assigned yet</dd>\n";
},"93":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <div id=\"family-full\" class=\"row\">\n        <div class=\"col-md-1 col-xs-2 text-uppercase\" style=\"color: grey;\">Family</div>\n        <div class=\"col-md-9 col-xs-8\">\n            <dl>\n";
  stack1 = ((helper = (helper = helpers.families || (depth0 != null ? depth0.families : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"families","hash":{},"fn":container.program(94, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.families) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "            </dl>\n        </div>\n    </div>\n";
},"94":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.superfamily : depth0),{"name":"if","hash":{},"fn":container.program(95, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.family : depth0),{"name":"if","hash":{},"fn":container.program(98, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.subfamily : depth0),{"name":"if","hash":{},"fn":container.program(101, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"95":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.superfamily || (depth0 != null ? depth0.superfamily : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"superfamily","hash":{},"fn":container.program(96, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.superfamily) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"96":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "                <dt>Superfamily</dt>\n                <dd>"
    + ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"term",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + "</dd>\n";
},"98":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.family || (depth0 != null ? depth0.family : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"family","hash":{},"fn":container.program(99, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.family) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"99":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "                <dt>Family</dt>\n                <dd>"
    + ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"term",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + "</dd>\n";
},"101":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.subfamily || (depth0 != null ? depth0.subfamily : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"subfamily","hash":{},"fn":container.program(102, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.subfamily) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"102":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "                <dt>Subfamily</dt>\n                <dd>"
    + ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"term",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + "</dd>\n";
},"104":function(container,depth0,helpers,partials,data) {
    var helper;

  return "                <dd>Last sequence update "
    + container.escapeExpression(((helper = (helper = helpers.lastSeqUpdate || (depth0 != null ? depth0.lastSeqUpdate : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"lastSeqUpdate","hash":{},"data":data}) : helper)))
    + "</dd>\n";
},"106":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"history",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "");
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=helpers.blockHelperMissing, buffer = 
  "<style>\ndd{\n margin-left:15px;\n}\n</style>\n<div id=\"proteinTitle\">\n    <button id=\"extender\" class=\"btn btn-default\" style=\"float:right;margin-top:-5px;\">Extend overview</button>\n    <h3>"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.geneName : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n    "
    + alias4(((helper = (helper = helpers.entryName || (depth0 != null ? depth0.entryName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"entryName","hash":{},"data":data}) : helper)))
    + " ";
  stack1 = ((helper = (helper = helpers.recommendedProteinName || (depth0 != null ? depth0.recommendedProteinName : depth0)) != null ? helper : alias2),(options={"name":"recommendedProteinName","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.recommendedProteinName) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "</h3>\n</div>\n<div id=\"INFOS-LESS\" style=\"display:block;margin-top:15px;\">\n"
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.recommendedProteinName : depth0)) != null ? stack1.mainSynonymName : stack1),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.program(23, data, 0),"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.cleavage : depth0),{"name":"if","hash":{},"fn":container.program(29, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    <div id=\"gene-less\" class=\"row\">\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.geneName : depth0),{"name":"if","hash":{},"fn":container.program(33, data, 0),"inverse":container.program(39, data, 0),"data":data})) != null ? stack1 : "")
    + "\n    </div>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.families : depth0),{"name":"if","hash":{},"fn":container.program(41, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>\n<div id=\"INFOS-FULL\" style=\"display:none\">\n    <div id=\"protein-full\" class=\"row\">\n        <div class=\"col-md-1 col-xs-2 text-uppercase\" style=\"color: grey;\">Protein</div>\n        <div class=\"col-md-9 col-xs-8\">\n            <dl>\n                <dt>Recommended name</dt>\n";
  stack1 = ((helper = (helper = helpers.recommendedProteinName || (depth0 != null ? depth0.recommendedProteinName : depth0)) != null ? helper : alias2),(options={"name":"recommendedProteinName","hash":{},"fn":container.program(53, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.recommendedProteinName) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.alternativeProteinNames : depth0),{"name":"if","hash":{},"fn":container.program(59, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.functionalRegionNames : depth0),{"name":"if","hash":{},"fn":container.program(64, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.cleavage : depth0),{"name":"if","hash":{},"fn":container.program(71, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isoforms : depth0),{"name":"if","hash":{},"fn":container.program(75, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "            </dl>\n        </div>\n    </div>\n    <div id=\"gene-full\" class=\"row\">\n        <div class=\"col-md-1 col-xs-2 text-uppercase\" style=\"color: grey;\">Gene</div>\n        <div class=\"col-md-9 col-xs-8\">\n            <dl>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.geneName : depth0),{"name":"if","hash":{},"fn":container.program(80, data, 0),"inverse":container.program(91, data, 0),"data":data})) != null ? stack1 : "")
    + "            </dl>\n        </div>\n    </div>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.families : depth0),{"name":"if","hash":{},"fn":container.program(93, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    <div id=\"History-full\" class=\"row\">\n        <div class=\"col-md-1 col-xs-2 text-uppercase\" style=\"color: grey;\">History</div>\n        <div class=\"col-md-9 col-xs-8\">\n            <dl>\n                <dt>neXtProt</dt>\n                <dd>Integrated "
    + alias4(((helper = (helper = helpers.integDate || (depth0 != null ? depth0.integDate : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"integDate","hash":{},"data":data}) : helper)))
    + "</dd>\n                <dd>Last updated "
    + alias4(((helper = (helper = helpers.lastUpdate || (depth0 != null ? depth0.lastUpdate : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"lastUpdate","hash":{},"data":data}) : helper)))
    + "</dd>\n                <dt>UniProtKB</dt>\n                <dd>Integrated "
    + alias4(((helper = (helper = helpers.UniprotIntegDate || (depth0 != null ? depth0.UniprotIntegDate : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"UniprotIntegDate","hash":{},"data":data}) : helper)))
    + "</dd>\n                <dd>Last updated "
    + alias4(((helper = (helper = helpers.UniprotLastUpdate || (depth0 != null ? depth0.UniprotLastUpdate : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"UniprotLastUpdate","hash":{},"data":data}) : helper)))
    + "</dd>\n                <dd>Entry version "
    + alias4(((helper = (helper = helpers.version || (depth0 != null ? depth0.version : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"version","hash":{},"data":data}) : helper)))
    + "</dd>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.lastSeqUpdate : depth0),{"name":"if","hash":{},"fn":container.program(104, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "                <dd>Sequence version "
    + alias4(((helper = (helper = helpers.seqVersion || (depth0 != null ? depth0.seqVersion : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"seqVersion","hash":{},"data":data}) : helper)))
    + "</dd>\n                <dd>";
  stack1 = ((helper = (helper = helpers.accessionNumber || (depth0 != null ? depth0.accessionNumber : depth0)) != null ? helper : alias2),(options={"name":"accessionNumber","hash":{},"fn":container.program(106, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.accessionNumber) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</dd>\n            </dl>\n        </div>\n    </div>\n</div>\n<p style=\"margin:10px 10px;\">"
    + alias4(((helper = (helper = helpers.proteineEvidence || (depth0 != null ? depth0.proteineEvidence : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"proteineEvidence","hash":{},"data":data}) : helper)))
    + ". "
    + alias4(((helper = (helper = helpers.proteineEvidenceCaution || (depth0 != null ? depth0.proteineEvidenceCaution : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"proteineEvidenceCaution","hash":{},"data":data}) : helper)))
    + "</p>";
},"useData":true});