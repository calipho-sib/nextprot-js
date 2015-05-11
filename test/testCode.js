var isNeXtProt = function (prot) {
    return (prot.substring(0, 3) === "NX_");
};
var existOverview = function (nx) {
    return Promise.resolve(nx.getProteinOverview()).then(function (data) {
        console.log(data.proteinNames);
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


QUnit.test("should do a native API call", function (assert) {
    var d = assert.async();

    var req = new XMLHttpRequest();
    
    
        req.onreadystatechange = function() {
            if (req.readyState == 4 && req.status == 200) {
                 var object = JSON.parse(req.responseText);
                	assert.ok(object.entry.isoforms.length, "should get a sequence length");
                	d();
            }
        }     
    
    req.open('GET', 'https://api.nextprot.org/entry/NX_P46976/isoform.json');
        req.send();

});


QUnit.test("should do a jquery API call", function (assert) {
    var d = assert.async();
    $.ajax('https://api.nextprot.org/entry/NX_P46976/isoform.json').then(function (data){
        console.log(data.entry);
        assert.ok(data.entry.isoforms.length, "should get a sequence length");
        d();
    });
});

QUnit.test("API calls test", function (assert) {
    assert.expect(1);
    var done1 = assert.async();
    //var done2 = assert.async();
    //var done3 = assert.async();
    //var done4 = assert.async();
    //var done5 = assert.async();
    nx.getProteinOverview().then(function (data) {
        console.log("why is it not woorkiiiing !!");
        assert.ok(data.proteinNames, 'Overview Json filled');
        console.log("oh COME ON !!");
        done1();
    });
    //var promise2 = nx.getProteinSequence();
    //promise2.then(function (data) {
    //    assert.ok(data.length, 'should get a Sequence Json filled');
    //    done2();
    //}, function (error) {
    //    assert.notOk("failed to load protein sequence");
    //});
    //var promise3 = nx.getPeptide();
    //promise3.then(function (data) {
    //    assert.ok(data, 'should get a Peptide Json filled');
    //    done3();
    //}, function(message) {
    //    assert.equal(message, "failed to load peptides");
    //    done3();
    //});
    //
    //var promise4 = nx.getSrmPeptide();
    //promise4.then(function (data) {
    //    assert.ok(data, 'should get a Srm Peptide Json filled');
    //    done4();
    //}, function(message) {
    //    assert.equal(message, "failed to load srm peptides");
    //    done4();
    //});
    //
    //var promise5 = nx.getMatureProtein();
    //promise5.then(function (data) {
    //    assert.ok(data, 'should get a Mature-Prot Json filled');
    //    done5();
    //}, function(message) {
    //    assert.equal(message, "failed to load mature protein");
    //    done5();
    //})
});

// OVERVIEW JSON TEST
QUnit.test("Overview Json test", function (assert) {
    var done6 = assert.async();
    var promise6 = nx.getProteinOverview();
    promise6.then(function (data) {
        console.log(data);
        assert.ok(data.proteinNames, 'should get a Overview Json filled');
        if (data.proteinNames) {
            assert.ok(data.proteinNames[0].synonymName, 'Expect a protein name to exist');
            assert.ok(data.history.formattedNextprotIntegrationDate, 'Expect a integration date to exist');
            assert.ok(data.history.formattedNextprotUpdateDate, 'Expect a update date to exist');
            assert.ok(data.history.uniprotVersion, 'Expect a version to exist');
        }
//            assert.ok(data.cleavedRegionNames, 'cleaved region exist');
//            assert.ok(data.bioPhyChemProps.length, 'biofichemprops exist');
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
        console.log(data);
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
        assert.notOk("failed to load protein sequence");
        done7();
    });
});

//PEPTIDE JSON TEST
QUnit.test("Peptide Json test", function (assert) {
    var done8 = assert.async();
    var promise8 = nx.getPeptide();
    promise8.then(function (data) {
        console.log(data);
        assert.ok(data, 'should get a Peptide Json filled');
        if (data) {
            assert.ok(data[0].peptideUniqueName, 'Expect a peptide unique name to exist');
            assert.ok(data[0].isoformSpecificity[Object.keys(data[0].isoformSpecificity)[0]].positions.length, 'Expect a peptide positions to exist');
            assert.ok(data[0].evidences.length, 'Expect a peptide positions to exist');
        }
//            assert.ok(data[0].uniqueName, 'iso unique name exists');
//            assert.ok(data.cleavedRegionNames, 'cleaved region exist      ');
//            assert.ok(data.bioPhyChemProps.length, 'biofichemprops exist');
        done8();
    }, function(message) {
        assert.equal(message, "failed to load peptide");
        done8();
    });
});

QUnit.test("SRM Peptide Json test", function (assert) {
    var done9 = assert.async();
    var promise9 = nx.getSrmPeptide();
    promise9.then(function (data) {
        console.log(data);
        assert.ok(data, 'should get a Srm peptide Json filled');
        if (data) {
            assert.ok(data[0].peptideUniqueName, 'Expect a peptide unique name to exist');
            assert.ok(data[0].isoformSpecificity[Object.keys(data[0].isoformSpecificity)[0]].positions.length, 'Expect a peptide positions to exist');
            assert.ok(data[0].evidences.length, 'Expect a peptide positions to exist');
        }
//            assert.ok(data[0].uniqueName, 'iso unique name exists');
//            assert.ok(data.cleavedRegionNames, 'cleaved region exist');
//            assert.ok(data.bioPhyChemProps.length, 'biofichemprops exist');
        done9();
    }, function(message) {
        assert.equal(message, "failed to load srm peptide");
        done9();
    });
});

QUnit.test("Mature protein Json test", function (assert) {
    var done10 = assert.async();
    var promise10 = nx.getMatureProtein();
    promise10.then(function (data) {
        console.log(data);
        console.log(data[0]);
        assert.ok(data.length, 'should get a Mature protein Json filled');
        if (data.length) {
            assert.ok(data[0].targetingIsoformsMap, 'Expect a  isoform specificity exists');
            //            assert.ok(data[0].cvTermName, 'cvTermName exists');
            assert.ok(data[0].targetingIsoformsMap[Object.keys(data[0].targetingIsoformsMap)[0]].isoformName, 'Expect a isoformName to exist');
            assert.ok(data[0].targetingIsoformsMap[Object.keys(data[0].targetingIsoformsMap)[0]].firstPosition, 'Expect a first position to exist');
            assert.ok(data[0].targetingIsoformsMap[Object.keys(data[0].targetingIsoformsMap)[0]].lastPosition, 'Expect a last position to exist');
        }
//            assert.ok(data[0].uniqueName, 'iso unique name exists');
//            assert.ok(data.cleavedRegionNames, 'cleaved region exist      ');
//            assert.ok(data.bioPhyChemProps.length, 'biofichemprops exist');
        done10();
    }, function(message) {
        assert.equal(message, "failed to load mature protein");
        done10();
    });
});

//  Qunit async test with start & stop : deprecated
//    QUnit.test("promise test 1", 1, function (assert) {
//        QUnit.stop();
//        var promise = nx.getProteinOverview();
//        promise.then(function (data) {
//            assert.ok(data.proteinNames, 'json filled');
//        }).then(QUnit.start);
//    });

//  Qunit async test inside promise
//    Promise.resolve(nx.getProteinOverview()).then(function (data) {
//        QUnit.test("Api call tests", function (assert) {
//            assert.expect(1);
//            console.log(data.proteinNames);
//            assert.ok(data.proteinNames, "expected data");
//        });
//
//    });