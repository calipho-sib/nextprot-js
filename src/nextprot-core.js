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
                var protocol = environment === 'dev' ? "https://" : "http://";
//            console.log("api protocol : " + protocol)
                apiBaseUrl = protocol + environment + "-api.nextprot.org";
                if (environment === 'dev') nextprotUrl = 'https://dev-search.nextprot.org';
                else nextprotUrl = protocol + environment + "-search.nextprot.org";
                
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
