QUnit.test("Should order isoform names", function (assert) {
    var isoformNames = [{name : "Iso 2"}, {name : "Iso 10"},{name : "Iso 1"}];
    var isoformNamesSorted = isoformNames.sort(NXUtils.sortIsoformNames);
    var equality = (isoformNamesSorted[0].name === "Iso 1") && (isoformNamesSorted[1].name === "Iso 2") && (isoformNamesSorted[2].name === "Iso 10");
    assert.ok(equality, "array is ordered");

});

QUnit.test("Should order isoform names", function (assert) {
    var isoformNames = [{name : "Iso 6"}, {name : "Iso 9"},{name : "Iso 1"}, {name : "Iso 10"},{name : "Iso 11"}];
    var isoformNamesSorted = isoformNames.sort(NXUtils.sortIsoformNames);
    var equality = (isoformNamesSorted[0].name === "Iso 1") && (isoformNamesSorted[1].name === "Iso 6") && (isoformNamesSorted[2].name === "Iso 9") && (isoformNamesSorted[3].name === "Iso 10") && (isoformNamesSorted[4].name === "Iso 11");
    assert.ok(equality, "array is ordered");

});


var titinNames = [ {
    "clazz" : null,
    "type" : "name",
    "qualifier" : null,
    "id" : null,
    "category" : null,
    "name" : "Iso 6",
    "parentId" : null,
    "mainEntityName" : null,
    "synonyms" : [ {
        "clazz" : null,
        "type" : null,
        "qualifier" : null,
        "id" : null,
        "category" : null,
        "name" : "Small cardiac novex-3",
        "parentId" : null,
        "mainEntityName" : null,
        "synonyms" : null,
        "composedName" : null,
        "main" : false,
        "value" : "Small cardiac novex-3"
    } ],
    "composedName" : "name",
    "main" : true,
    "value" : "Iso 6"
}, {
    "clazz" : null,
    "type" : "name",
    "qualifier" : null,
    "id" : null,
    "category" : null,
    "name" : "Iso 9",
    "parentId" : null,
    "mainEntityName" : null,
    "synonyms" : [ ],
    "composedName" : "name",
    "main" : true,
    "value" : "Iso 9"
}, {
    "clazz" : null,
    "type" : "name",
    "qualifier" : null,
    "id" : null,
    "category" : null,
    "name" : "Iso 1",
    "parentId" : null,
    "mainEntityName" : null,
    "synonyms" : [ ],
    "composedName" : "name",
    "main" : true,
    "value" : "Iso 1"
}, {
    "clazz" : null,
    "type" : "name",
    "qualifier" : null,
    "id" : null,
    "category" : null,
    "name" : "Iso 10",
    "parentId" : null,
    "mainEntityName" : null,
    "synonyms" : [ ],
    "composedName" : "name",
    "main" : true,
    "value" : "Iso 10"
}, {
    "clazz" : null,
    "type" : "name",
    "qualifier" : null,
    "id" : null,
    "category" : null,
    "name" : "Iso 11",
    "parentId" : null,
    "mainEntityName" : null,
    "synonyms" : [ ],
    "composedName" : "name",
    "main" : true,
    "value" : "Iso 11"
}, {
    "clazz" : null,
    "type" : "name",
    "qualifier" : null,
    "id" : null,
    "category" : null,
    "name" : "Iso 12",
    "parentId" : null,
    "mainEntityName" : null,
    "synonyms" : [ ],
    "composedName" : "name",
    "main" : true,
    "value" : "Iso 12"
}, {
    "clazz" : null,
    "type" : "name",
    "qualifier" : null,
    "id" : null,
    "category" : null,
    "name" : "Iso 13",
    "parentId" : null,
    "mainEntityName" : null,
    "synonyms" : [ ],
    "composedName" : "name",
    "main" : true,
    "value" : "Iso 13"
}, {
    "clazz" : null,
    "type" : "name",
    "qualifier" : null,
    "id" : null,
    "category" : null,
    "name" : "Iso 2",
    "parentId" : null,
    "mainEntityName" : null,
    "synonyms" : [ ],
    "composedName" : "name",
    "main" : true,
    "value" : "Iso 2"
}, {
    "clazz" : null,
    "type" : "name",
    "qualifier" : null,
    "id" : null,
    "category" : null,
    "name" : "Iso 3",
    "parentId" : null,
    "mainEntityName" : null,
    "synonyms" : [ {
        "clazz" : null,
        "type" : null,
        "qualifier" : null,
        "id" : null,
        "category" : null,
        "name" : "Small cardiac N2-B",
        "parentId" : null,
        "mainEntityName" : null,
        "synonyms" : null,
        "composedName" : null,
        "main" : false,
        "value" : "Small cardiac N2-B"
    } ],
    "composedName" : "name",
    "main" : true,
    "value" : "Iso 3"
}, {
    "clazz" : null,
    "type" : "name",
    "qualifier" : null,
    "id" : null,
    "category" : null,
    "name" : "Iso 5",
    "parentId" : null,
    "mainEntityName" : null,
    "synonyms" : [ ],
    "composedName" : "name",
    "main" : true,
    "value" : "Iso 5"
}, {
    "clazz" : null,
    "type" : "name",
    "qualifier" : null,
    "id" : null,
    "category" : null,
    "name" : "Iso 4",
    "parentId" : null,
    "mainEntityName" : null,
    "synonyms" : [ {
        "clazz" : null,
        "type" : null,
        "qualifier" : null,
        "id" : null,
        "category" : null,
        "name" : "Soleus",
        "parentId" : null,
        "mainEntityName" : null,
        "synonyms" : null,
        "composedName" : null,
        "main" : false,
        "value" : "Soleus"
    } ],
    "composedName" : "name",
    "main" : true,
    "value" : "Iso 4"
}, {
    "clazz" : null,
    "type" : "name",
    "qualifier" : null,
    "id" : null,
    "category" : null,
    "name" : "Iso 7",
    "parentId" : null,
    "mainEntityName" : null,
    "synonyms" : [ {
        "clazz" : null,
        "type" : null,
        "qualifier" : null,
        "id" : null,
        "category" : null,
        "name" : "Cardiac novex-2",
        "parentId" : null,
        "mainEntityName" : null,
        "synonyms" : null,
        "composedName" : null,
        "main" : false,
        "value" : "Cardiac novex-2"
    } ],
    "composedName" : "name",
    "main" : true,
    "value" : "Iso 7"
}, {
    "clazz" : null,
    "type" : "name",
    "qualifier" : null,
    "id" : null,
    "category" : null,
    "name" : "Iso 8",
    "parentId" : null,
    "mainEntityName" : null,
    "synonyms" : [ {
        "clazz" : null,
        "type" : null,
        "qualifier" : null,
        "id" : null,
        "category" : null,
        "name" : "Cardiac novex-1",
        "parentId" : null,
        "mainEntityName" : null,
        "synonyms" : null,
        "composedName" : null,
        "main" : false,
        "value" : "Cardiac novex-1"
    } ],
    "composedName" : "name",
    "main" : true,
    "value" : "Iso 8"
} ];




QUnit.test("Should order titin names", function (assert) {
    var titinNamesSorted = titinNames.sort(NXUtils.sortIsoformNames);
    var equality = (titinNamesSorted[0].name === "Iso 1") && (titinNamesSorted[1].name === "Iso 2") && (titinNamesSorted[2].name === "Iso 3") && (titinNamesSorted[3].name === "Iso 4") && (titinNamesSorted[4].name === "Iso 5");
    assert.ok(equality, "array is ordered");

});

