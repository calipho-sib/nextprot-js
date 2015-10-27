this["HBtemplates"] = this["HBtemplates"] || {};

this["HBtemplates"]["templates/overviewProtein.tmpl"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)));
},"3":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.EC : depth0),{"name":"if","hash":{},"fn":this.program(4, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.mainShortName : depth0),{"name":"if","hash":{},"fn":this.program(8, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"4":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "  [";
  stack1 = ((helper = (helper = helpers.EC || (depth0 != null ? depth0.EC : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"EC","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.EC) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + " ] ";
},"5":function(depth0,helpers,partials,data) {
    var stack1;

  return " "
    + ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0,"EC",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers.unless.call(depth0,(data && data.last),{"name":"unless","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + " ";
},"6":function(depth0,helpers,partials,data) {
    return ",";
},"8":function(depth0,helpers,partials,data) {
    var helper;

  return "( "
    + this.escapeExpression(((helper = (helper = helpers.mainShortName || (depth0 != null ? depth0.mainShortName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"mainShortName","hash":{},"data":data}) : helper)))
    + " ) ";
},"10":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <div id=\"synonym-less\" class=\"row\">\n        <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">Protein also known as :</div>\n        <div class=\"col-md-6 col-xs-6\">";
  stack1 = ((helper = (helper = helpers.recommendedProteinName || (depth0 != null ? depth0.recommendedProteinName : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"recommendedProteinName","hash":{},"fn":this.program(11, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.recommendedProteinName) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n    </div>\n";
},"11":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", buffer = 
  this.escapeExpression(((helper = (helper = helpers.mainSynonymName || (depth0 != null ? depth0.mainSynonymName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"mainSynonymName","hash":{},"data":data}) : helper)))
    + " ";
  stack1 = ((helper = (helper = helpers.others || (depth0 != null ? depth0.others : depth0)) != null ? helper : alias1),(options={"name":"others","hash":{},"fn":this.program(12, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.others) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"12":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", buffer = 
  " ; "
    + this.escapeExpression(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"type","hash":{},"data":data}) : helper)));
  stack1 = ((helper = (helper = helpers.names || (depth0 != null ? depth0.names : depth0)) != null ? helper : alias1),(options={"name":"names","hash":{},"fn":this.program(13, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.names) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"13":function(depth0,helpers,partials,data) {
    var helper;

  return " "
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)));
},"15":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.recommendedProteinName : depth0)) != null ? stack1.others : stack1),{"name":"if","hash":{},"fn":this.program(16, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"16":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <div id=\"synonym-other-less\" class=\"row\">\n        <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">Protein also known as :</div>\n        <div class=\"col-md-6 col-xs-6\">";
  stack1 = ((helper = (helper = helpers.recommendedProteinName || (depth0 != null ? depth0.recommendedProteinName : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"recommendedProteinName","hash":{},"fn":this.program(17, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.recommendedProteinName) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n    </div>\n";
},"17":function(depth0,helpers,partials,data) {
    var stack1, helper, options;

  stack1 = ((helper = (helper = helpers.others || (depth0 != null ? depth0.others : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"others","hash":{},"fn":this.program(18, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.others) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { return stack1; }
  else { return ''; }
},"18":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", buffer = 
  " "
    + this.escapeExpression(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"type","hash":{},"data":data}) : helper)));
  stack1 = ((helper = (helper = helpers.names || (depth0 != null ? depth0.names : depth0)) != null ? helper : alias1),(options={"name":"names","hash":{},"fn":this.program(13, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.names) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + ((stack1 = helpers.unless.call(depth0,(data && data.last),{"name":"unless","hash":{},"fn":this.program(19, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"19":function(depth0,helpers,partials,data) {
    return "; ";
},"21":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <div id=\"cleavage-less\" class=\"row\">\n        <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">Cleaved into :</div>\n        <div class=\"col-md-6 col-xs-6\">";
  stack1 = ((helper = (helper = helpers.cleavage || (depth0 != null ? depth0.cleavage : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"cleavage","hash":{},"fn":this.program(22, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.cleavage) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n    </div>\n";
},"22":function(depth0,helpers,partials,data) {
    var stack1, helper, options;

  stack1 = ((helper = (helper = helpers.names || (depth0 != null ? depth0.names : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"names","hash":{},"fn":this.program(23, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.names) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { return stack1; }
  else { return ''; }
},"23":function(depth0,helpers,partials,data) {
    var helper;

  return "<span>"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + ", </span>";
},"25":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "        <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">Gene Name :</div>\n        <div class=\"col-md-6 col-xs-6\" >";
  stack1 = ((helper = (helper = helpers.geneName || (depth0 != null ? depth0.geneName : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"geneName","hash":{},"fn":this.program(26, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.geneName) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n";
},"26":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers.unless.call(depth0,(data && data.last),{"name":"unless","hash":{},"fn":this.program(27, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"27":function(depth0,helpers,partials,data) {
    return ", ";
},"29":function(depth0,helpers,partials,data) {
    var stack1;

  return "        <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">ORF Name :</div>\n        <div class=\"col-md-6 col-xs-6\">"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.geneName : depth0)) != null ? stack1['0'] : stack1)) != null ? stack1.orf : stack1)) != null ? stack1['0'] : stack1)) != null ? stack1.name : stack1), depth0))
    + "</div>\n";
},"31":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <div id=\"family-less\" class=\"row\">\n        <div class=\"col-md-3 col-xs-3\" style=\"color: grey;text-align:right\">Family Name :</div>\n        <div class=\"col-md-6 col-xs-6\">";
  stack1 = ((helper = (helper = helpers.families || (depth0 != null ? depth0.families : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"families","hash":{},"fn":this.program(32, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.families) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n    </div>\n";
},"32":function(depth0,helpers,partials,data) {
    var stack1;

  return "<span>"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.superfamily : depth0),{"name":"if","hash":{},"fn":this.program(33, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.family : depth0),{"name":"if","hash":{},"fn":this.program(36, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.subfamily : depth0),{"name":"if","hash":{},"fn":this.program(39, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</span>";
},"33":function(depth0,helpers,partials,data) {
    var stack1, helper, options;

  stack1 = ((helper = (helper = helpers.superfamily || (depth0 != null ? depth0.superfamily : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"superfamily","hash":{},"fn":this.program(34, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.superfamily) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { return stack1; }
  else { return ''; }
},"34":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0,"term",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + " >> ";
},"36":function(depth0,helpers,partials,data) {
    var stack1, helper, options;

  stack1 = ((helper = (helper = helpers.family || (depth0 != null ? depth0.family : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"family","hash":{},"fn":this.program(37, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.family) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { return stack1; }
  else { return ''; }
},"37":function(depth0,helpers,partials,data) {
    var stack1;

  return " "
    + ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0,"term",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + " ";
},"39":function(depth0,helpers,partials,data) {
    var stack1, helper, options;

  stack1 = ((helper = (helper = helpers.subfamily || (depth0 != null ? depth0.subfamily : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"subfamily","hash":{},"fn":this.program(40, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.subfamily) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { return stack1; }
  else { return ''; }
},"40":function(depth0,helpers,partials,data) {
    var stack1;

  return " >> "
    + ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0,"term",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + " ";
},"42":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", buffer = 
  "                <dd>"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + " ";
  stack1 = ((helper = (helper = helpers.synonyms || (depth0 != null ? depth0.synonyms : depth0)) != null ? helper : alias1),(options={"name":"synonyms","hash":{},"fn":this.program(43, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.synonyms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</dd>\n";
},"43":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.EC : depth0),{"name":"if","hash":{},"fn":this.program(44, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0['short'] : depth0),{"name":"if","hash":{},"fn":this.program(46, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"44":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "[";
  stack1 = ((helper = (helper = helpers.EC || (depth0 != null ? depth0.EC : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"EC","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.EC) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + " ] ";
},"46":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "<span style=\"font-size:12px;\"><span style=\"color:grey\">Short: </span> ";
  stack1 = ((helper = (helper = helpers['short'] || (depth0 != null ? depth0['short'] : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"short","hash":{},"fn":this.program(47, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers['short']) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</span>";
},"47":function(depth0,helpers,partials,data) {
    var stack1;

  return this.escapeExpression(this.lambda(depth0, depth0))
    + ((stack1 = helpers.unless.call(depth0,(data && data.last),{"name":"unless","hash":{},"fn":this.program(27, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"49":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.alternativeProteinNames || (depth0 != null ? depth0.alternativeProteinNames : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"alternativeProteinNames","hash":{},"fn":this.program(50, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.alternativeProteinNames) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"50":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", buffer = 
  "                <dt>"
    + this.escapeExpression(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"type","hash":{},"data":data}) : helper)))
    + "</dt>\n";
  stack1 = ((helper = (helper = helpers.names || (depth0 != null ? depth0.names : depth0)) != null ? helper : alias1),(options={"name":"names","hash":{},"fn":this.program(51, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.names) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"51":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", buffer = 
  "                <dd> "
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\n                    ";
  stack1 = ((helper = (helper = helpers.synonyms || (depth0 != null ? depth0.synonyms : depth0)) != null ? helper : alias1),(options={"name":"synonyms","hash":{},"fn":this.program(43, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.synonyms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n                </dd>\n";
},"53":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.functionalRegionNames || (depth0 != null ? depth0.functionalRegionNames : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"functionalRegionNames","hash":{},"fn":this.program(54, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.functionalRegionNames) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"54":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "                <dt>Include the following functional regions</dt>\n";
  stack1 = ((helper = (helper = helpers.names || (depth0 != null ? depth0.names : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"names","hash":{},"fn":this.program(55, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.names) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"55":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", buffer = 
  "                <dd> "
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\n                    ";
  stack1 = ((helper = (helper = helpers.synonyms || (depth0 != null ? depth0.synonyms : depth0)) != null ? helper : alias1),(options={"name":"synonyms","hash":{},"fn":this.program(56, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.synonyms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n                </dd>\n";
},"56":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.EC : depth0),{"name":"if","hash":{},"fn":this.program(44, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.full : depth0),{"name":"if","hash":{},"fn":this.program(57, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"57":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, buffer = 
  "<span style=\"font-size:12px;\"><span style=\"color:grey\">Alternative name"
    + this.escapeExpression((helpers.plural || (depth0 && depth0.plural) || alias1).call(depth0,(depth0 != null ? depth0.full : depth0),{"name":"plural","hash":{},"data":data}))
    + ":</span> ";
  stack1 = ((helper = (helper = helpers.full || (depth0 != null ? depth0.full : depth0)) != null ? helper : alias1),(options={"name":"full","hash":{},"fn":this.program(47, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.full) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</span>";
},"59":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.cleavage || (depth0 != null ? depth0.cleavage : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"cleavage","hash":{},"fn":this.program(60, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.cleavage) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"60":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "                <dt>Cleaved into the following "
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.names : depth0)) != null ? stack1.length : stack1), depth0))
    + " chains</dt>\n";
  stack1 = ((helper = (helper = helpers.names || (depth0 != null ? depth0.names : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"names","hash":{},"fn":this.program(61, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.names) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"61":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", buffer = 
  "                <dd>"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + " ";
  stack1 = ((helper = (helper = helpers.synonyms || (depth0 != null ? depth0.synonyms : depth0)) != null ? helper : alias1),(options={"name":"synonyms","hash":{},"fn":this.program(56, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.synonyms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</dd>\n";
},"63":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.name : depth0),{"name":"if","hash":{},"fn":this.program(64, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.synonyms : depth0),{"name":"if","hash":{},"fn":this.program(66, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.orf : depth0),{"name":"if","hash":{},"fn":this.program(69, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"64":function(depth0,helpers,partials,data) {
    var helper;

  return "                <dt>Recommended Name</dt>\n                <dd>"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</dd>\n";
},"66":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "                <dt>Alternative Names</dt>\n";
  stack1 = ((helper = (helper = helpers.synonyms || (depth0 != null ? depth0.synonyms : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"synonyms","hash":{},"fn":this.program(67, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.synonyms) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"67":function(depth0,helpers,partials,data) {
    var helper;

  return "                <dd> "
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</dd>\n";
},"69":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "                <dt>ORF names</dt>\n";
  stack1 = ((helper = (helper = helpers.orf || (depth0 != null ? depth0.orf : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"orf","hash":{},"fn":this.program(67, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.orf) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"71":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <div id=\"family-full\" class=\"row\">\n        <div class=\"col-md-1 col-xs-2 text-uppercase\" style=\"color: grey;\">Family</div>\n        <div class=\"col-md-9 col-xs-8\">\n            <dl>\n";
  stack1 = ((helper = (helper = helpers.families || (depth0 != null ? depth0.families : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"families","hash":{},"fn":this.program(72, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.families) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "            </dl>\n        </div>\n    </div>\n";
},"72":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.superfamily : depth0),{"name":"if","hash":{},"fn":this.program(73, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.family : depth0),{"name":"if","hash":{},"fn":this.program(76, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.subfamily : depth0),{"name":"if","hash":{},"fn":this.program(79, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"73":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.superfamily || (depth0 != null ? depth0.superfamily : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"superfamily","hash":{},"fn":this.program(74, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.superfamily) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"74":function(depth0,helpers,partials,data) {
    var stack1;

  return "                <dt>Superfamily</dt>\n                <dd>"
    + ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0,"term",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + "</dd>\n";
},"76":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.family || (depth0 != null ? depth0.family : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"family","hash":{},"fn":this.program(77, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.family) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"77":function(depth0,helpers,partials,data) {
    var stack1;

  return "                <dt>Family</dt>\n                <dd>"
    + ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0,"term",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + "</dd>\n";
},"79":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.subfamily || (depth0 != null ? depth0.subfamily : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"subfamily","hash":{},"fn":this.program(80, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.subfamily) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"80":function(depth0,helpers,partials,data) {
    var stack1;

  return "                <dt>Subfamily</dt>\n                <dd>"
    + ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0,"term",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "")
    + "</dd>\n";
},"82":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.link_to || (depth0 && depth0.link_to) || helpers.helperMissing).call(depth0,"history",{"name":"link_to","hash":{},"data":data})) != null ? stack1 : "");
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.blockHelperMissing, alias2=helpers.helperMissing, alias3="function", alias4=this.escapeExpression, buffer = 
  "<div id=\"proteinTitle\">\n    <button id=\"extender\" class=\"btn btn-default\" style=\"float:right\">Extend overview</button>\n    <h3>"
    + ((stack1 = alias1.call(depth0,this.lambda(((stack1 = (depth0 != null ? depth0.geneName : depth0)) != null ? stack1['0'] : stack1), depth0),{"name":"geneName.0","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + " → "
    + alias4(((helper = (helper = helpers.entryName || (depth0 != null ? depth0.entryName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(depth0,{"name":"entryName","hash":{},"data":data}) : helper)))
    + " ";
  stack1 = ((helper = (helper = helpers.recommendedProteinName || (depth0 != null ? depth0.recommendedProteinName : depth0)) != null ? helper : alias2),(options={"name":"recommendedProteinName","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias3 ? helper.call(depth0,options) : helper));
  if (!helpers.recommendedProteinName) { stack1 = alias1.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "</h3>\n</div>\n<div id=\"INFOS-LESS\" style=\"display:block\">\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.recommendedProteinName : depth0)) != null ? stack1.mainSynonymName : stack1),{"name":"if","hash":{},"fn":this.program(10, data, 0),"inverse":this.program(15, data, 0),"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.cleavage : depth0),{"name":"if","hash":{},"fn":this.program(21, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    <div id=\"gene-less\" class=\"row\">\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = ((stack1 = (depth0 != null ? depth0.geneName : depth0)) != null ? stack1['0'] : stack1)) != null ? stack1.name : stack1),{"name":"if","hash":{},"fn":this.program(25, data, 0),"inverse":this.program(29, data, 0),"data":data})) != null ? stack1 : "")
    + "\n    </div>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.families : depth0),{"name":"if","hash":{},"fn":this.program(31, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</div>\n<div id=\"INFOS-FULL\" style=\"display:none\">\n    <div id=\"protein-full\" class=\"row\">\n        <div class=\"col-md-1 col-xs-2 text-uppercase\" style=\"color: grey;\">Protein</div>\n        <div class=\"col-md-9 col-xs-8\">\n            <dl>\n                <dt>Recommended Name</dt>\n";
  stack1 = ((helper = (helper = helpers.recommendedProteinName || (depth0 != null ? depth0.recommendedProteinName : depth0)) != null ? helper : alias2),(options={"name":"recommendedProteinName","hash":{},"fn":this.program(42, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias3 ? helper.call(depth0,options) : helper));
  if (!helpers.recommendedProteinName) { stack1 = alias1.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.alternativeProteinNames : depth0),{"name":"if","hash":{},"fn":this.program(49, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.functionalRegionNames : depth0),{"name":"if","hash":{},"fn":this.program(53, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.cleavage : depth0),{"name":"if","hash":{},"fn":this.program(59, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "            </dl>\n        </div>\n    </div>\n    <div id=\"gene-full\" class=\"row\">\n        <div class=\"col-md-1 col-xs-2 text-uppercase\" style=\"color: grey;\">Gene</div>\n        <div class=\"col-md-9 col-xs-8\">\n            <dl>\n";
  stack1 = ((helper = (helper = helpers.geneName || (depth0 != null ? depth0.geneName : depth0)) != null ? helper : alias2),(options={"name":"geneName","hash":{},"fn":this.program(63, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias3 ? helper.call(depth0,options) : helper));
  if (!helpers.geneName) { stack1 = alias1.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "            </dl>\n        </div>\n    </div>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.families : depth0),{"name":"if","hash":{},"fn":this.program(71, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    <div id=\"History-full\" class=\"row\">\n        <div class=\"col-md-1 col-xs-2 text-uppercase\" style=\"color: grey;\">History</div>\n        <div class=\"col-md-9 col-xs-8\">\n            <dl>\n                <dt>neXtProt</dt>\n                <dd>Integrated "
    + alias4(((helper = (helper = helpers.integDate || (depth0 != null ? depth0.integDate : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(depth0,{"name":"integDate","hash":{},"data":data}) : helper)))
    + "</dd>\n                <dd>Last Updated "
    + alias4(((helper = (helper = helpers.lastUpdate || (depth0 != null ? depth0.lastUpdate : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(depth0,{"name":"lastUpdate","hash":{},"data":data}) : helper)))
    + "</dd>\n                <dt>UniProtKB</dt>\n                <dd>Entry version "
    + alias4(((helper = (helper = helpers.version || (depth0 != null ? depth0.version : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(depth0,{"name":"version","hash":{},"data":data}) : helper)))
    + "</dd>\n                <dd>Integration Date "
    + alias4(((helper = (helper = helpers.UniprotIntegDate || (depth0 != null ? depth0.UniprotIntegDate : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(depth0,{"name":"UniprotIntegDate","hash":{},"data":data}) : helper)))
    + "</dd>\n                <dd>Last Update "
    + alias4(((helper = (helper = helpers.UniProtLastUpdate || (depth0 != null ? depth0.UniProtLastUpdate : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(depth0,{"name":"UniProtLastUpdate","hash":{},"data":data}) : helper)))
    + "</dd>\n                <dd>Sequence version "
    + alias4(((helper = (helper = helpers.seqVersion || (depth0 != null ? depth0.seqVersion : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(depth0,{"name":"seqVersion","hash":{},"data":data}) : helper)))
    + "</dd>\n                <dd>";
  stack1 = ((helper = (helper = helpers.accessionNumber || (depth0 != null ? depth0.accessionNumber : depth0)) != null ? helper : alias2),(options={"name":"accessionNumber","hash":{},"fn":this.program(82, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias3 ? helper.call(depth0,options) : helper));
  if (!helpers.accessionNumber) { stack1 = alias1.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</dd>\n            </dl>\n        </div>\n    </div>\n</div>\n<p style=\"margin:10px 10px;\">Entry whose protein(s) existence is based on "
    + alias4(((helper = (helper = helpers.proteineEvidence || (depth0 != null ? depth0.proteineEvidence : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(depth0,{"name":"proteineEvidence","hash":{},"data":data}) : helper)))
    + "</p>";
},"useData":true});