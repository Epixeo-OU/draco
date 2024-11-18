### Installation Document for SPAM_DETECTOR.JS

#### Prerequisites
1. **Google Account**: Ensure you have a Google account.
2. **Google Apps Script**: Familiarity with Google Apps Script and access to the Google Apps Script editor.

#### Steps to Install and Configure SPAM_DETECTOR.JS

1. **Open Google Apps Script Editor**:
   - Go to [Google Apps Script](https://script.google.com/).
   - Click on `New Project`.

2. **Create a New Script**:
   - Name your project (e.g., `Spam Detector`).
   - Delete any default code in the script editor.

3. **Copy and Paste the Code**:
   - Copy the entire content of `SPAM_DETECTOR.JS`.
   - Paste it into the script editor.

4. **Set Up Script Properties**:
   - Click on `File` > `Project properties`.
   - Go to the `Script properties` tab.
   - Add the following properties:
     - `MINI_GPT_API_ENDPOINT`: The endpoint URL for the Mini GPT API.
     - `MINI_GPT_API_KEY`: Your API key for accessing the Mini GPT API.

5. **Authorize the Script**:
   - Click on the `Run` menu and select `analyzeIncomingEmails`.
   - You will be prompted to authorize the script to access your Gmail account.
   - Follow the authorization steps.

6. **Set Up a Trigger**:
   - Click on the clock icon (Triggers) in the left sidebar.
   - Click on `+ Add Trigger`.
   - Set up the trigger as follows:
     - Choose which function to run: `analyzeIncomingEmails`.
     - Choose which deployment should run: `Head`.
     - Select event source: `Time-driven`.
     - Select type of time-based trigger: `Day timer`.
     - Select time of day: Choose a suitable time.

7. **Save and Test**:
   - Save your project.
   - Manually run the `analyzeIncomingEmails` function to test if it works correctly.
   - Check the logs for any errors or messages.

8. **Monitor and Maintain**:
   - Regularly check the logs to ensure the script is running smoothly.
   - Update the API endpoint or key if necessary.

#### Optional Enhancements
- **Custom Labels**: Modify the 

applyLabelToThread

 function to use custom labels.
- **Rate Limiting**: Adjust the `rateLimit` variable as per your subscription plan.
- **Error Handling**: Enhance error handling in the `analyzeWithMiniGPT` function.

#### Example Script Properties
```plaintext
MINI_GPT_API_ENDPOINT: https://api.minigpt.example.com/analyze
MINI_GPT_API_KEY: your_api_key_here
```

### Code Excerpt from SPAM_DETECTOR.JS

```javascript
// Add tags if a threat is detected
if (analysis.isThreat) {
  Logger.log("Potential threat detected from " + sender + ". Subject: " + subject);
  applyLabelToThread(thread[0], 'Potential Threat');
}
```

```javascript
/**
 * Get the configuration data (API endpoint and key) from Script Properties.
 * @return {Object} Configuration data.
 */
function getConfig() {
  var scriptProperties = PropertiesService.getScriptProperties();
  
  // Retrieve API endpoint and key from Script Properties
  var apiEndpoint = scriptProperties.getProperty('MINI_GPT_API_ENDPOINT');
  var apiKey = scriptProperties.getProperty('

MIN

I_GPT_API_KEY');
  
  return {
    apiEndpoint: apiEndpoint,
    apiKey: apiKey
  };
}
```

```javascript
/**
 * Call the Mini GPT API to analyze the email content for threats or scams.
 * @param {string} content - The email body text.
 */
```

By following these steps, you will have the `SPAM_DETECTOR.JS` script installed and configured to analyze incoming emails for potential scams or threats using the Mini GPT API.