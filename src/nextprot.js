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
            sparqlPrefixPromise = sparqlPrefixPromise || _getJSON(apiBaseUrl + "/sparql-prefixes").then(_transformPrefixesFunction, 
                                                                                                        function (){ 
            //assures backward compatibility with old API
                return "PREFIX :<http://nextprot.org/rdf#> "+
            "PREFIX annotation:<http://nextprot.org/rdf/annotation/> "+
            "PREFIX context:<http://nextprot.org/rdf/context/> "+
            "PREFIX cv:<http://nextprot.org/rdf/terminology/> "+
            "PREFIX db:<http://nextprot.org/rdf/db/> "+
            "PREFIX dc:<http://purl.org/dc/elements/1.1/> "+
            "PREFIX dcterms:<http://purl.org/dc/terms/> "+
            "PREFIX entry:<http://nextprot.org/rdf/entry/> "+
            "PREFIX evidence:<http://nextprot.org/rdf/evidence/> "+
            "PREFIX foaf:<http://xmlns.com/foaf/0.1/> "+
            "PREFIX gene:<http://nextprot.org/rdf/gene/> "+
            "PREFIX identifier:<http://nextprot.org/rdf/identifier/> "+
            "PREFIX isoform:<http://nextprot.org/rdf/isoform/> "+
            "PREFIX mo:<http://purl.org/ontology/mo/> "+
            "PREFIX ov:<http://open.vocab.org/terms/> "+
            "PREFIX owl:<http://www.w3.org/2002/07/owl#> "+
            "PREFIX publication:<http://nextprot.org/rdf/publication/> "+
            "PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> "+
            "PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> "+
            "PREFIX sim:<http://purl.org/ontology/similarity/> "+
            "PREFIX source:<http://nextprot.org/rdf/source/> "+
            "PREFIX xref:<http://nextprot.org/rdf/xref/> "+
            "PREFIX xsd:<http://www.w3.org/2001/XMLSchema#> ";
                
            });
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


        // NEEEDS REVIEW ///////////////////////////////////////////////////////////////////////////////////////////////
        //TODO where is this needed?
        NextprotClient.prototype.getIsoformMapping = function (entry) {
            return _getEntry(entry, "isoform/mapping").then(function (data) {
                return data;
            });
        };

        //TODO This is extracting information from the first gene only!
        NextprotClient.prototype.getExons = function (entry) {
            return _getEntry(entry, "genomic-mapping").then(function (data) {
                return data.entry.genomicMappings[0].isoformMappings;
            });
        };

        //TODO not a good name if it return properties???????
        NextprotClient.prototype.getAccession = function (entry) {
            console.log("Use getEntryProperties instead");
            return _getEntry(entry, "accession").then(function (data) {
                return data.entry.properties;
            });
        };

        // NEEEDS REVIEW ///////////////////////////////////////////////////////////////////////////////////////////////


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