var nimn = require("../src/nimn");
var chars = require("../src/chars");

describe("Nimn Encoder", function () {

    var project = {
        "name" : {
            type : "string"
        },
        "description" : {
            type : "string"
        }
    }
    
    var sampleSchema = {
        "name" : {
            type: "object",
            properties : {
                "first" : {
                    type : "string"
                },
                "middle" : {
                    type : "string"
                },
                "last" : {
                    type : "string"
                }
            }
        },
        
        "projects" : {
            type: "array",
            properties : {
                "project" : {
                    type : "object",
                    properties : project
                }
            }
        },
        "age" : {
            type: "number"
        },
    }
    
    var schema = {
        type: "object",
        properties : sampleSchema
    }

    it("should append boundry char if last field can have dynamic value", function () {
        var schema = {
            type : "object",
            properties : {
                "name" : { type : "string"},
                "age" : { type : "number"}
            }
        }

        var nimnEncoder = new nimn(schema);

        var jData = {
            name : "gupta",
            age : 32
        }
        var expected = "gupta" + chars.boundryChar + "32";
        var result = nimnEncoder.encode(jData);
        expect(result).toEqual(expected);
    });

    it("should append undefined or null char without boundry char if last field undefined or null", function () {
        var schema = {
            type : "object",
            properties : {
                "name" : { type : "string"},
                "age" : { type : "number"}
            }
        }

        var nimnEncoder = new nimn(schema);

        var jData = {
            age : 32
        }
        //var expected = chars.missingPremitive + "32";
        var expected = chars.nilPremitive + "32";
        var result = nimnEncoder.encode(jData);
        expect(result).toEqual(expected);

        var jData = {
            name : null,
            age : 32
        }
        var expected = chars.nilPremitive + "32";
        var result = nimnEncoder.encode(jData);
        expect(result).toEqual(expected);

    }); 

    it("should append boundry char if last field can have dynamic value and not undefined or null", function () {
        var schema = {
            type : "object",
            properties : {
                "name" : {
                    type: "object",
                    properties : {
                        "first" : { type : "string" },
                        "middle" : { type : "string" },
                        "last" : { type : "string" }
                    }
                },
                "age" : { type : "number"}
            }
        }

        var nimnEncoder = new nimn(schema);

        var jData = {
            name : { first : null , middle: "kumar", last: "gupta"} ,
            age : 32
        }
        var expected = chars.nilPremitive + "kumar" + chars.boundryChar + "gupta"
            + chars.boundryChar
            + "32";
        var result = nimnEncoder.encode(jData);
        expect(result).toEqual(expected);
    });

    it("should not append boundry char if last field can have dynamic value but it is undefined or null", function () {
        var schema = {
            type : "object",
            properties : {
                "name" : {
                    type: "object",
                    properties : {
                        "first" : { type : "string" },
                        "middle" : { type : "string" },
                        "last" : { type : "string" }
                    }
                },
                "age" : { type : "number"}
            }
        }

        var nimnEncoder = new nimn(schema);
        
        var jData = {
            name : { first : null , middle: "kumar", last: null} ,
            age : 32
        }
        var expected = chars.nilPremitive + "kumar" + chars.nilPremitive
            + "32";
        var result = nimnEncoder.encode(jData);
        expect(result).toEqual(expected);

        var jData = {
            name : { first : null , middle: "kumar"} ,
            age : 32
        }
        var expected = chars.nilPremitive + "kumar" + chars.nilPremitive
            + "32";
        var result = nimnEncoder.encode(jData);
        expect(result).toEqual(expected);

        var jData = {
            name : null ,
            age : 32
        }
        var expected = chars.nilChar + "32";
        var result = nimnEncoder.encode(jData);
        expect(result).toEqual(expected);

        var jData = {
            //name : {},
            age : 32
        }
        var expected = chars.nilChar + "32";
        var result = nimnEncoder.encode(jData);
        expect(result).toEqual(expected);

    });

    it("should not append boundry char if last field is empty object", function () {
        var schema = {
            type : "object",
            properties : {
                "name" : {
                    type: "object",
                    properties : {
                        "first" : { type : "string" },
                        "middle" : { type : "string" },
                        "last" : { type : "string" }
                    }
                },
                "age" : { type : "number"}
            }
        }

        var nimnEncoder = new nimn(schema);

        var jData = {
            name : {},
            age : 32
        }
        var expected = chars.emptyChar + "32";
        var result = nimnEncoder.encode(jData);
        expect(result).toEqual(expected); 
    });

    it("should not append boundry char if last field is empty array", function () {
        var schema = {
            type : "object",
            properties : {
                "names" : {
                    type: "array",
                    properties : {
                        "name" : { type : "string" }
                    }
                },
                "age" : { type : "number"}
            }
        }

        var nimnEncoder = new nimn(schema);

        var jData = {
            names : [],
            age : 32
        }
        var expected = chars.emptyChar + "32";
        var result = nimnEncoder.encode(jData);
        expect(result).toEqual(expected); 
    });
    

    it("should encode data in the order it defines in schema", function () {
        var jData = {
            age : 32,
            name : { first : null , middle: "kumar", last: "gupta"} ,
            projects : [
                {
                    name : "Stubmatic",
                    description : "QA friendly tool to mock HTTP(s) calls"
                },{
                    name : "java aggregator",
                    description: "1"
                }
            ]
        }

        var expected = chars.nilPremitive + "kumar" + chars.boundryChar + "gupta"
            + chars.arraySepChar 
            + "Stubmatic" + chars.boundryChar + "QA friendly tool to mock HTTP(s) calls"
            + chars.arraySepChar 
            + "java aggregator" + chars.boundryChar + "1"
            + chars.boundryChar 
            + "32";

        var nimnEncoder = new nimn(schema);
        var result = nimnEncoder.encode(jData);


        //console.log(result.length);
        //console.log(result);
        expect(result).toEqual(expected);
    });

});