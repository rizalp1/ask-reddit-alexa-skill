'use strict';

/**
 * Parses the reddit response into something meaningful that Alexa can say.
**/
exports.parse = function(object, type) {
    let allResults = '<speak>';
    allResults += "Here is your " + type + " from Reddit, the homepage of the internet. ";

    let i = 1;
    object.data.children.forEach(function(child) {
        var result = parseIndividual(child, type);
        if (result != "") {
            allResults += (i++) + "<break time='1s'/>" + result;
            allResults += "<break time='1s'/>"; // break time between two results
        }
    });
    allResults += '</speak>';
    return allResults;
};

function parseIndividual(object, type) {
    switch (type) {
        case "worldnews":
            return object.data.title;
            break;
        case "news":
            return object.data.title;
            break;
        case "jokes":
            if (object.kind == "t3") {
                return object.data.title + "<break time='1s'/> " + object.data.selftext
            } else {
                return "";
            }
            break;
        default:
            return object.data.title;
            break;
    };
};


