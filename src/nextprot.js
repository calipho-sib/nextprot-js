/**
 * A neXtProt js client
 */
( function (root) {
    //
    'use strict';
    if (root.Nextprot === undefined) {
        root.Nextprot = {};
    }


    (function () {

        var nextprotApiUrl = "https://api.nextprot.org/entry/";

        var NextprotClient = function () {
        };

        //Util methods
        var _getURLParameter = function (name){
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        };

        //Gets the entry set in the parameter
        NextprotClient.prototype.getEntryName = function(){
            return _getURLParameter("nxentry") || 'NX_P01308'; //By default returns the insulin
        };

        //private method, convention use an underscore
        var _callURL = function (entryName, context){

            var me = this;

            return new Promise(function(resolve, reject) {

                var req = new XMLHttpRequest();
                var url = nextprotApiUrl + entryName + "/" + context + ".json";
                req.open("GET", url);

                req.onload = function() {
                    // This is called even on errors so check the status
                    if (req.status == 200) {
                        resolve(JSON.parse(req.responseText));
                    }else {
                        reject(Error(req.statusText));
                    }
                };

                // Handle network errors
                req.onerror = function() {
                    reject(Error("Network Error"));
                };

                // Make the request
                req.send();
            });
        };


        NextprotClient.prototype.getProteinOverview = function() {
            return _callURL(this.getEntryName(), "overview").then(function (data){
                return data.entry.overview;
            });
        };

        NextprotClient.prototype.getProteinSequence = function() {
            return _callURL(this.getEntryName(), "isoform").then(function (data){
                return data.entry.isoforms;
            });
        };

        NextprotClient.prototype.getSecondaryStructure = function() {
            return _callURL(this.getEntryName(), "secondary-structure").then(function (data){
                return data.entry.annotations;
            });
        };

        NextprotClient.prototype.getMatureProtein = function() {
            return _callURL(this.getEntryName(), "mature-protein").then(function (data){
                return data.entry.annotations;
            });
        };

        NextprotClient.prototype.getPeptide = function(entry) {
            return _callURL(entry || this.getEntryName(), "peptide").then(function (data){
                return data.entry.peptideMappings;
            });
        };



        //node.js compatibility
        if (typeof exports !== 'undefined') {
            exports.Client = NextprotClient;
        }


        root.Nextprot.Client = NextprotClient;

    }());


}(this));