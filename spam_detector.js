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
                /**
         * Analyze incoming emails and tag them if identified as scam or threat using Mini GPT.
         */
        function analyzeIncomingEmails() {
            // Retrieve API endpoint and API key from Properties Service
            var config = getConfig();
          
            // Search for emails in the inbox received in the last 7 days
            var threads = GmailApp.search('newer_than:7d');
            var messages = GmailApp.getMessagesForThreads(threads);
          
            var rateLimit = 100; // Example rate limit for the subscription
            var count = 0;
          
            messages.forEach(function(thread) {
              if (count >= rateLimit) {
                Logger.log("Rate limit reached. Consider upgrading your subscription for more analyses.");
                return;
              }
              thread.forEach(function(message) {
                if (count >= rateLimit) {
                  Logger.log("Rate limit reached. Consider upgrading your subscription for more analyses.");
                  return;
                }
                count++;
                
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

  /**
 * Analyze incoming emails and suggest appropriate actions for scams or threats.
 */
function analyzeIncomingEmailsWithSuggestions() {
    var config = getConfig();
    var threads = GmailApp.search('newer_than:7d');
    var messages = GmailApp.getMessagesForThreads(threads);
  
    messages.forEach(function (thread) {
      thread.forEach(function (message) {
        var subject = message.getSubject();
        var sender = message.getFrom();
        var body = message.getPlainBody();
  
        // Call Mini GPT API for analysis
        var analysis = analyzeWithMiniGPT(body, config.apiEndpoint, config.apiKey);
  
        // Log the result and suggest actions
        Logger.log({
          subject: subject,
          sender: sender,
          analysis: analysis,
          suggestion: suggestAction(analysis)
        });
  
        // Add labels and notify if necessary
        if (analysis.isThreat) {
          Logger.log("Potential threat detected: " + sender + " | Subject: " + subject);
          applyLabelToThread(thread[0], 'Potential Threat');
  
          // Send an email to notify the user
          GmailApp.sendEmail(Session.getActiveUser().getEmail(), 
            "Alert: Threat Detected in Email", 
            "A potential scam or threat was detected in an email from: " + sender + "\n\n" +
            "Subject: " + subject + "\n\n" +
            "Suggested Action: " + suggestAction(analysis)
          );
        }
      });
    });
  }
  
  /**
   * Provide suggestions for handling scams or threats.
   * @param {object} analysis - Analysis result from Mini GPT API.
   * @return {string} Suggested action.
   */
  function suggestAction(analysis) {
    if (!analysis.isThreat) {
      return "No action needed. This email appears to be safe.";
    }
  
    var message = analysis.message.toLowerCase();
  
    if (message.includes('phishing')) {
      return "This email seems to be a phishing attempt. Do not click on any links or provide personal information. Mark it as spam and delete it.";
    } else if (message.includes('malware')) {
      return "This email might contain malware. Avoid downloading attachments or clicking on links. Mark it as spam and delete it.";
    } else if (message.includes('extortion') || message.includes('blackmail')) {
      return "This email appears to be an extortion or blackmail attempt. Do not respond or send money. Report it to your local authorities or cybersecurity team.";
    } else if (message.includes('fake invoice')) {
      return "This email might be a fake invoice scam. Verify the sender and check for authenticity. If in doubt, do not make any payments or download attachments.";
    } else if (message.includes('lottery')) {
      return "This email seems to be a lottery scam. Remember, legitimate lotteries do not require payments or bank details to claim prizes. Mark it as spam.";
    } else if (message.includes('threat')) {
      return "This email contains threatening language. Do not engage with the sender. Report it to your local authorities or cybersecurity team.";
    } else {
      return "A potential threat was detected. Exercise caution. Avoid interacting with the sender or email until verified.";
    }
  }
  
