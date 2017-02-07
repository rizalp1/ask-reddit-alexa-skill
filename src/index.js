/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This package calls reddit api to get posts about a topic pre-specified. For v1, only some text based topics are allowed.
 * The features from Alexa SDK used are:
 * - Custom slot type: demonstrates using custom slot types to handle a finite set of known values
 * - SSML: Using SSML tags to control how Alexa renders the text-to-speech.
 *
 * Examples:
 *  "Alexa, ask Reddit for world news."
 *  "Alexa, ask Reddit for top jokes."
 *  "Alexa, ask Reddit for new jokes."
 *  "Alexa, ask Reddit for news."
 */

/**
 * App ID for the skill
 */
var APP_ID = "amzn1.ask.skill.GUIDHERE";

var DEFAULT_PATH = "hot/";

/**
 * Given a phrase, this method will trim the beginning, trailing and spaces between words to create the subreddit name.
 * For instance: 'today i learned' is converted to 'todayilearned'
*/
function combinePhrase(phrase) {
    return phrase.split(" ").join("");
}

/**
 * Given a topic with spaces, this method will create the path for the subreddit, by removing spaces.
 * For instance: 'world news' is converted to 'r/worldnews'
*/
function getSubreddit(topic) {
    return "r/" + combinePhrase(topic) + "/";
}

var SUBREDDIT_MAP = new Map();
SUBREDDIT_MAP.set("news", "r/news/");
SUBREDDIT_MAP.set("joke", "r/jokes/");

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * Client for Reddit.
*/
var RedditClient = require('./reddit-client');

/** Response parser for reddit response. **/
var RedditResponseParser = require('./reddit-response-parser');

/**
 * RedditSkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var RedditSkill = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
RedditSkill.prototype = Object.create(AlexaSkill.prototype);
RedditSkill.prototype.constructor = RedditSkill;

/**
 * Overriden to show that a subclass can override this function to initialize session state.
 */
RedditSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // Any session init logic would go here.
};

/**
 * If the user launches without specifying an intent, route to the correct function.
 */
RedditSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("RedditSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);

    handleHelpIntent(session, response);
};

/**
 * Overriden to show that a subclass can override this function to teardown session state.
 */
RedditSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    //Any session cleanup logic would go here.
};

RedditSkill.prototype.intentHandlers = {
    "RedditIntent": function (intent, session, response) {
        handleRedditIntent(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        handleHelpIntent(session, response);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye, and may the force be with you!";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye, and thanks for all the fish!";
        response.tell(speechOutput);
    }
};

function handleHelpIntent(session, response) {
    var speechText = "I will read out information from Reddit. " +
                    "For example, you can say 'Ask Reddit for top news' or 'Ask Reddit for new jokes'";

    var speechOutput = {
        speech: speechText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    var repromptOutput = {
        speech: speechText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    // For the repromptText, play the speechOutput again
    response.ask(speechOutput, repromptOutput);
}

/**
 * Selects a joke randomly and starts it off by saying "Knock knock".
 */
function handleRedditIntent(intent, session, response) {
    var topic = intent.slots.Topic.value;
    var listType = intent.slots.ListType.value;
    var subredditPath = getSubreddit(topic);
    // TODO: Add listType if exists, if not, default one.

    //Reprompt speech will be triggered if the user doesn't respond.
    var repromptText = "You can say 'Ask Reddit for top news'";
    // Actual call to reddit.
    RedditClient.call(
        subredditPath,
        function(object) {
            speechText = RedditResponseParser.parse(object, topic);
            var speechOutput = {
                speech: speechText,
                type: AlexaSkill.speechOutputType.SSML
            };
            var repromptOutput = {
                speech: repromptText,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.askWithCard(speechOutput, repromptOutput, "Reddit", speechText);
        },
        function(error) {
            console.log("reddit client error " + error);
            speechText = "Sorry an error occurred while connecting to Reddit. Please try a tad bit later.";
            var speechOutput = {
                speech: speechText,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            var repromptOutput = {
                speech: repromptText,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.askWithCard(speechOutput, repromptOutput, "Reddit", speechText);
        }
    );
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the WiseGuy Skill.
    var skill = new RedditSkill();
    skill.execute(event, context);
};
