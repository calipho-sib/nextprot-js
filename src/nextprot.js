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
            if (href.match(tmpRegex) != null) {
                return href.replace(tmpRegex, '$1' + newVal);
            }
            return href += (((href.indexOf("?") != -1) ? "&" : "?") + paramName + "=" + newVal);
        }

        var _convertToTupleMap = function (data) {
            var publiMap = {};
            var xrefMap = {};
            data.entry.publications.forEach(function (p) {
                publiMap[p.md5] = p
            });
            data.entry.xrefs.forEach(function (p) {
                xrefMap[p.dbXrefId] = p
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
            var entryName = normalizeEntry(entry || this.getEntryName())
            var url = apiBaseUrl + "/entry/" + entryName;
            if (context) {
                url += "/" + context;
            }
            return _getJSON(url);
        }

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
            })
            return sparqlPrefixes;
        }

        // Keeps SPARQL prefixes in cache
        var sparqlPrefixPromise;
        NextprotClient.prototype.getSparqlPrefixes = function (sparql) {
            sparqlPrefixPromise = sparqlPrefixPromise || _getJSON(apiBaseUrl + "/sparql-prefixes").then(_transformPrefixesFunction);
            return sparqlPrefixPromise;
        };

        NextprotClient.prototype.executeSparql = function (sparql, includePrefixes) {
            return this.getSparqlPrefixes().then(function (sparqlPrefixes) {
                var sparqlQuery = includePrefixes ? sparqlPrefixes + sparql : sparql; //add SPARQL prefixes if flag not set to false
                var url = sparqlEndpoint + sparqlFormat + "&query=" + encodeURIComponent(sparqlQuery);
                return _getJSON(url);
            });
        };

        NextprotClient.prototype.getEntryProperties = function (entry) {
            return _getEntry(normalizeEntry(entry || this.getEntryName()), "accession").then(function (data) {
                return data.entry.properties;
            });
        };

        NextprotClient.prototype.getProteinOverview = function (entry) {
            return _getEntry(normalizeEntry(entry || this.getEntryName()), "overview").then(function (data) {
                return data.entry.overview;
            });
        };

        NextprotClient.prototype.getProteinSequence = function (entry) {
            return _getEntry(normalizeEntry(entry || this.getEntryName()), "isoform").then(function (data) {
                return data.entry.isoforms;
            });
        };
        /** USE THIS INSTEAD OF THE OTHERS for example getEntryPart(NX_1038042, "ptm") */
        NextprotClient.prototype.getAnnotoationsByCategory = function (entry, category) {
            return _getEntry(normalizeEntry(entry || this.getEntryName()), category).then(function (data) {
                return _convertToTupleMap(data);
            });
        };

        NextprotClient.prototype.getEntry = function (entry, category) {
            return _getEntry(normalizeEntry(entry || this.getEntryName()), category).then(function (data) {
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
            return _getEntry(normalizeEntry(entry || this.getEntryName()), "genomic-mapping").then(function (data) {
                return data.entry.genomicMappings[0].isoformMappings;
            });
        };

        //TODO not a good name if it return properties???????
        NextprotClient.prototype.getAccession = function (entry) {
            console.log("Use getEntryProperties instead");
            return _getEntry(normalizeEntry(entry || this.getEntryName()), "accession").then(function (data) {
                return data.entry.properties;
            });
        };

        // NEEEDS REVIEW ///////////////////////////////////////////////////////////////////////////////////////////////


        // BEGIN Special cases to be deprecated  //////////////////////////////////////////////////////////////////////////////
        NextprotClient.prototype.getPeptide = function (entry) {
            console.log("getPeptide is deprecated... use getAnnotoationsByCategory(entry, 'peptide-mapping') instead ");
            return _getEntry(normalizeEntry(entry || this.getEntryName()), "peptide-mapping").then(function (data) {
                return data.entry.peptideMappings;
            });
        };

        NextprotClient.prototype.getSrmPeptide = function (entry) {
            console.log("getSrmPeptide is deprecated. use getAnnotoationsByCategory(entry, 'srm-peptide-mapping') instead ");
            return _getEntry(normalizeEntry(entry || this.getEntryName()), "srm-peptide-mapping").then(function (data) {
                return data.entry.srmPeptideMappings;
            });
        };

        NextprotClient.prototype.getAntibody = function (entry) {
            //this is not deprecated yet
            return _getEntry(normalizeEntry(entry || this.getEntryName()), "antibody").then(function (data) {
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