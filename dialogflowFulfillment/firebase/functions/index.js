// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const algoliasearch = require('algoliasearch');
const ALGOLIA_ID = "X8DCYI2MXR";
const ALGOLIA_SEARCH_KEY = "a32cff5c0bc6ada897e1a5d010d8d90f";
const ALGOLIA_INDEX_NAME = 'dev_CANNABUDDY';

const client = algoliasearch(ALGOLIA_ID, ALGOLIA_SEARCH_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);


process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function handleSearch(agent) {
    const strainName = agent.parameters.strain;
    console.log(`handleSearch: looking for"${strainName}"`);   
    // Perform an Algolia search:
	return index
  	.search({
    query: strainName
  	})
  	.then(function(responses) {
    // Response from Algolia:
    // https://www.algolia.com/doc/api-reference/api-methods/search/#response-format
    console.log(responses.hits);
      if(responses.hits.length >=0) {
             agent.add("I found a result:");
             agent.add(responses.hits[0].description);
      } else {
         agent.add("Sorry, I couldn't find any results");
      }
  });
  }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('search strain by name', handleSearch);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
