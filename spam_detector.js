/**
 * Analyze incoming emails and tag them if identified as scam or threat.
 */
function analyzeIncomingEmails() {
  // Search for emails in the inbox received in the last 7 days
  var threads = GmailApp.search('newer_than:7d'); 
  var messages = GmailApp.getMessagesForThreads(threads);

  messages.forEach(function(thread) {
    thread.forEach(function(message) {
      var subject = message.getSubject();
      var sender = message.getFrom();
      var body = message.getPlainBody();
      
      // Analyze the email content
      var analysis = analyzeEmailContent(body);

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
 * Analyze email content for scam or threat language.
 * @param {string} content - The email body text
 * @return {object} Analysis results
 */
function analyzeEmailContent(content) {
  // Keywords commonly found in scam or threat emails
  var scamKeywords = ['urgent', 'immediate action', 'transfer funds', 'confidential', 'password', 'account locked'];
  var threatKeywords = ['pay or else', 'consequences', 'legal action', 'hacked', 'blackmail', 'ransom'];

  // Count the occurrences of each keyword type
  var scamCount = countKeywordOccurrences(content, scamKeywords);
  var threatCount = countKeywordOccurrences(content, threatKeywords);

  // Determine if the email is suspicious
  var isThreat = threatCount > 0 || scamCount > 2;

  return {
    scamCount: scamCount,
    threatCount: threatCount,
    isThreat: isThreat,
    message: isThreat ? "Potential scam or threat detected." : "No threat detected."
  };
}

/**
 * Count occurrences of keywords in a text.
 * @param {string} text - The text to analyze
 * @param {Array} keywords - Array of keywords to search for
 * @return {number} Total occurrences of the keywords
 */
function countKeywordOccurrences(text, keywords) {
  var count = 0;
  keywords.forEach(function(keyword) {
    var regex = new RegExp('\\b' + keyword + '\\b', 'gi');
    var matches = text.match(regex);
    count += matches ? matches.length : 0;
  });
  return count;
}

/**
 * Apply a label to a Gmail thread.
 * @param {GmailThread} thread - The Gmail thread to label
 * @param {string} labelName - The name of the label to apply
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
