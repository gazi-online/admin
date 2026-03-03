/**
 * GOOGLE APPS SCRIPT DATABASE TEMPLATE
 * 
 * Instructions:
 * 1. Open Google Sheets and create a new spreadsheet.
 * 2. Rename 'Sheet1' to 'Database'.
 * 3. In Row 1, add headers corresponding to your form fields exactly:
 *    A1: timestamp, B1: name, C1: email, D1: message
 * 4. Go to Extensions > Apps Script.
 * 5. Paste this code, overwriting everything.
 * 6. Click Deploy > New deployment.
 * 7. Choose type 'Web app'.
 *    - Execute as: 'Me'
 *    - Who has access: 'Anyone'
 * 8. Click Deploy.
 * 9. Copy the generated "Web app URL" and paste it into your `app.js` file.
 */

// Define the name of your sheet tab
const SHEET_NAME = 'Database';

/**
 * Handles POST requests from the web frontend
 */
function doPost(e) {
  // Add universal CORS headers
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    // 1. Get the active spreadsheet and the specific sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    // If the sheet doesn't exist, create it (optional safety measure)
    if (!sheet) {
      throw new Error("Sheet named '" + SHEET_NAME + "' not found.");
    }
    
    // 2. Parse the incoming JSON payload string
    // Because we send text/plain from the frontend to avoid CORS preflight,
    // the data is located in e.postData.contents
    const requestData = JSON.parse(e.postData.contents);
    
    // 3. Get the headers from the first row to map the incoming JSON keys
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // 4. Create an array of values to append, matching the exact order of the columns
    const recordToInsert = headers.map(header => {
      // Return the value from requestData if the key exists, otherwise empty string
      return requestData[header] || '';
    });
    
    // 5. Append the row to the sheet
    sheet.appendRow(recordToInsert);
    
    // Return a success JSON response
    const result = {
      result: "success",
      message: "Data successfully row appended.",
      insertedData: recordToInsert
    };
    
    output.setContent(JSON.stringify(result));
    return output;
    
  } catch (error) {
    // Return an error JSON response
    const result = {
      result: "error",
      error: error.toString()
    };
    
    output.setContent(JSON.stringify(result));
    return output;
  }
}

/**
 * Handles GET requests (Optional: If you want to read data from the sheet later)
 */
function doGet(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Convert 2D array to an array of objects
    const headers = data[0];
    const rows = data.slice(1);
    
    const formattedData = rows.map(row => {
      const obj = {};
      row.forEach((value, index) => {
        obj[headers[index]] = value;
      });
      return obj;
    });
    
    output.setContent(JSON.stringify({
      result: "success",
      data: formattedData
    }));
    return output;
    
  } catch (error) {
    output.setContent(JSON.stringify({
      result: "error",
      error: error.toString()
    }));
    return output;
  }
}

/**
 * Handle initial OPTIONS preflight request (CORS handling)
 * This is sometimes needed if requests aren't simple requests.
 */
function doOptions(e) {
  // Browsers require this empty response with 200 OK for preflight checks
  return ContentService.createTextOutput("OK");
}
