/**
 * Analyze incoming emails and tag them if identified as scam or threat using Mini GPT.
 */
function analyzeIncomingEmails() {
    // Retrieve API endpoint and API key from Properties Service
    var config = getConfig();
  
    // Search for emails in the inbox received in the last 7 days
    var threads = GmailApp.search('newer_than:7d');
    var messages = GmailApp.getMessagesForThreads(threads);
  
    messages.forEach(function(thread) {
      thread.forEach(function(message) {
        var subject = message.getSubject();
        var sender = message.getFrom();
        var body = message.getPlainBody();
        
        // Call external Mini GPT API for scam and threat analysis
        var analysis = analyzeWithMiniGPT(body, config.apiEndpoint, config.apiKey);
  
        // Log the result
        Logger.log({
          subject: subject,
          sender: sender,
          analysis: analysis
        });
  
        // Add tags if a threat is detected
        if (analysis.isThreat) {
          Logger.log("Potential threat detected from " + sender + ". Subject: " + subject);
          applyLabelToThread(thread[0], 'Potential Threat');
        }
      });
    });
  }
  
  /**
   * Get the configuration data (API endpoint and key) from Script Properties.
   * @return {Object} Configuration data.
   */
  function getConfig() {
    var scriptProperties = PropertiesService.getScriptProperties();
    
    // Retrieve API endpoint and key from Script Properties
    var apiEndpoint = scriptProperties.getProperty('MINI_GPT_API_ENDPOINT');
    var apiKey = scriptProperties.getProperty('MINI_GPT_API_KEY');
    
    return {
      apiEndpoint: apiEndpoint,
      apiKey: apiKey
    };
  }
  
  /**
   * Call the Mini GPT API to analyze the email content for threats or scams.
   * @param {string} content - The email body text.
   * @param {string} apiEndpoint - The API endpoint for Mini GPT.
   * @param {string} apiKey - The API key for Mini GPT.
   * @return {object} Analysis results from the Mini GPT model.
   */
  function analyzeWithMiniGPT(content, apiEndpoint, apiKey) {
    var payload = {
      content: content,
      model: 'mini-gpt', // Assuming "mini-gpt" is the model name
      task: 'detect_scam_or_threat' // Specify the task
    };
  
    // Prepare the request options
    var options = {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload)
    };
  
    try {
      // Make the API request
      var response = UrlFetchApp.fetch(apiEndpoint, options);
      var jsonResponse = JSON.parse(response.getContentText());
  
      // Determine if the email is a threat
      var isThreat = jsonResponse.result.toLowerCase().includes('scam') || jsonResponse.result.toLowerCase().includes('threat');
  
      return {
        isThreat: isThreat,
        message: jsonResponse.result
      };
    } catch (error) {
      Logger.log('Error calling Mini GPT API: ' + error.message);
      return {
        isThreat: false,
        message: 'Error analyzing content.'
      };
    }
  }
  
  /**
   * Apply a label to a Gmail thread.
   * @param {GmailThread} thread - The Gmail thread to label.
   * @param {string} labelName - The name of the label to apply.
   */
  function applyLabelToThread(thread, labelName) {
    // Check if the label exists; if not, create it
    var label = GmailApp.getUserLabelByName(labelName);
    if (!label) {
      label = GmailApp.createLabel(labelName);
    }
    // Add the label to the thread
    label.addToThread(thread);
  }
  