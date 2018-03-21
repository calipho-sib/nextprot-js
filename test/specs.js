var isNeXtProt = function (prot) {
    return (prot.substring(0, 3) === "NX_");
};
var existOverview = function (nx) {
    return Promise.resolve(nx.getProteinOverview()).then(function (data) {
        return data.proteinNames;
    })
};
var Nextprot = window.Nextprot;
var nx = new Nextprot.Client("NextprotJsTest", "nextprotTeam");

QUnit.test("should get a nextprot valid id", function (assert) {
    assert.ok(isNeXtProt(nx.getEntryName()), "Expect a neXtProt ID");
});

QUnit.test("should get a nextprot valid id again", function (assert) {
    assert.ok(isNeXtProt(nx.getEntryName()), "Expect a neXtProt ID again");
});

// OVERVIEW JSON TEST
QUnit.test("Overview Json test", function (assert) {
    var done6 = assert.async();
    var promise6 = nx.getProteinOverview();
    promise6.then(function (data) {
        assert.ok(data.proteinNames, 'should get a Overview Json filled');
        console.log(data.proteinNames);
        if (data.proteinNames) {
            assert.ok(data.proteinNames[0].name, 'Expect a protein name to exist');
            assert.ok(data.history.formattedNextprotIntegrationDate, 'Expect a integration date to exist');
            assert.ok(data.history.formattedNextprotUpdateDate, 'Expect a update date to exist');
            assert.ok(data.history.uniprotVersion, 'Expect a version to exist');
        }
        done6();
    }, function (error) {
        assert.notOk("failed to load protein overview");
        done6();
    });
});


// SEQUENCE JSON TEST
QUnit.test("Sequence Json test", function (assert) {
    var done7 = assert.async();
    var promise7 = nx.getProteinSequence();
    promise7.then(function (data) {
        assert.ok(data.length, 'should get a Sequence Json filled');
        if (data.length) {
            assert.ok(data[0].sequence.length, 'Expect a sequence to exist');
            assert.ok(data[0].sequenceLength, 'Expect a sequence-length to exist');
            assert.ok(data[0].uniqueName, 'Expect a iso unique name to exist');
        }
        //            assert.ok(data.cleavedRegionNames, 'cleaved region exist');
        //            assert.ok(data.bioPhyChemProps.length, 'biofichemprops exist');
        done7();
    }, function (error) {
        console.log(error);
        assert.notOk("failed to load protein sequence");
        done7();
    });
});

//PEPTIDE JSON TEST
QUnit.test("Peptide Json test", function (assert) {
    var done8 = assert.async();
    var promise8 = nx.getAnnotationsByCategory("NX_P01308","peptide-mapping");
    promise8.then(function (data) {
        var data = data.annot;
        console.log(data);
        assert.ok(data, 'should get a Peptide Json filled');
        if (data) {
            assert.ok(data[0].uniqueName, 'Expect a peptide unique name to exist');
            assert.ok(data[0].targetingIsoformsMap[Object.keys(data[0].targetingIsoformsMap)[0]].firstPosition, 'Expect a peptide positions to exist');
            assert.ok(data[0].evidences.length, 'Expect a peptide positions to exist');
        }
        //            assert.ok(data[0].uniqueName, 'iso unique name exists');
        //            assert.ok(data.cleavedRegionNames, 'cleaved region exist      ');
        //            assert.ok(data.bioPhyChemProps.length, 'biofichemprops exist');
        done8();
    }, function (message) {
        assert.equal(message, "failed to load peptide");
        done8();
    });
});

QUnit.test("SRM Peptide Json test", function (assert) {
    var done9 = assert.async();
    var promise9 = nx.getAnnotationsByCategory("NX_P01308","srm-peptide-mapping");
    promise9.then(function (data) {
        var data = data.annot;
        assert.ok(data, 'should get a Srm peptide Json filled');
        if (data) {
            assert.ok(data[0].uniqueName, 'Expect a peptide unique name to exist');
            assert.ok(data[0].targetingIsoformsMap[Object.keys(data[0].targetingIsoformsMap)[0]].firstPosition, 'Expect a peptide positions to exist');
            assert.ok(data[0].evidences.length, 'Expect a peptide positions to exist');
        }
        //            assert.ok(data[0].uniqueName, 'iso unique name exists');
        //            assert.ok(data.cleavedRegionNames, 'cleaved region exist');
        //            assert.ok(data.bioPhyChemProps.length, 'biofichemprops exist');
        done9();
    }, function (message) {
        assert.equal(message, "failed to load srm peptide");
        done9();
    });
});

QUnit.test("Mature protein Json test", function (assert) {
    var done10 = assert.async();
    var promise10 = nx.getAnnotationsByCategory("NX_P01308", "mature-protein");
    promise10.then(function (data) {
        assert.ok(data.annot.length, 'should get a Mature protein Json filled');
        if (data.annot.length) {
            var firstData = data.annot[0];
            assert.ok(firstData.targetingIsoformsMap, 'Expect a  isoform specificity exists');
            assert.ok(firstData.targetingIsoformsMap[Object.keys(firstData.targetingIsoformsMap)[0]].isoformName, 'Expect a isoformName to exist');
            assert.ok(firstData.targetingIsoformsMap[Object.keys(firstData.targetingIsoformsMap)[0]].firstPosition, 'Expect a first position to exist');
            assert.ok(firstData.targetingIsoformsMap[Object.keys(firstData.targetingIsoformsMap)[0]].lastPosition, 'Expect a last position to exist');
        }
        //            assert.ok(data[0].uniqueName, 'iso unique name exists');
        //            assert.ok(data.cleavedRegionNames, 'cleaved region exist      ');
        //            assert.ok(data.bioPhyChemProps.length, 'biofichemprops exist');
        done10();
    }, function (message) {
        assert.equal(message, "failed to load mature protein");
        done10();
    });


    var done11 = assert.async();
    var promise11 = nx.getTerminologyByName('nextprot-anatomy-cv');
    promise11.then(function (data) {
        assert.ok(data.cvTermList.length, 'should get a terminology Json filled');
        if (data.cvTermList.length) {
            var firstData = data.cvTermList[0];
            assert.ok(firstData.accession, 'Expect a accession exists');
            assert.ok(firstData.description, 'Expect a description to exist');
            assert.ok(firstData.name, 'Expect a name exist');
        }
        done11();
    }, function (message) {
        assert.equal(message, "failed to load terminology");
        done11();
    });

});


QUnit.test("Should get SPARQL prefixes", function (assert) {
    var done = assert.async();
    var promise = nx.getSparqlPrefixes();
    promise.then(function (data) {
        assert.ok(data.length > 100, 'expect a length bigger than 100');
        assert.ok(data.indexOf('PREFIX') !== -1, 'expect a prefix');
        done();
    }, function (message) {
        assert.equal(message, "failed to get SPARQL prefixes");
        done();
    });
});

QUnit.test("Should execute a SPARQL query without prefixes", function (assert) {
    var done = assert.async();
    var promise = nx.executeSparql("SELECT DISTINCT * WHERE {  ?s ?p ?o } LIMIT 10", false);
    promise.then(function (data) {
        assert.equal(10, data.results.bindings.length, 'expect 10 values');
        done();
    }, function (message) {
        assert.equal(message, "failed to load execute SPARQL");
        done();
    });
});


QUnit.test("Should execute a SPARQL with prefixes", function (assert) {
    var done = assert.async();
    var promise = nx.executeSparql("select ?entry where { ?entry :isoform ?iso. } limit 10", true);
    promise.then(function (data) {
        assert.equal(10, data.results.bindings.length, 'expect 10 values');
        done();
    }, function (message) {
        assert.equal(message, "failed to load execute SPARQL");
        done();
    });
});


QUnit.test("Should execute a SPARQL with prefixes by default", function (assert) {
    var done = assert.async();
    var promise = nx.executeSparql("select ?entry where { ?entry :isoform ?iso. } limit 10");
    promise.then(function (data) {
        assert.equal(10, data.results.bindings.length, 'expect 10 values');
        done();
    }, function (message) {
        assert.equal(message, "failed to load execute SPARQL");
        done();
    });
});


QUnit.test("Should fail to execute a SPARQL without prefixes", function (assert) {
    var done = assert.async();
    var promise = nx.executeSparql("select ?entry where { ?entry :isoform ?iso. } limit 10", false);
    promise.then(function (data) {
        done();
    }, function (message) {
        assert.ok(true, "failed as expected");
        done();
    });
});


// TERM test added by Daniel on 22nd of March
QUnit.test("Term  test", function (assert) {
    var done = assert.async();
    var promise = nx.getTermByAccession("TS-0079");
    promise.then(function (data) {
        assert.ok(data.cvTerm, 'should get a CV Term Json filled');
        console.log(data.cvTerm.name);
        if (data.cvTerm) {
            assert.ok(data.cvTerm.id, 38286);
            assert.ok(data.cvTerm.name, "Blood");
        }
        done();
    }, function (error) {
        assert.notOk("failed to cv term");
        done();
    });
});