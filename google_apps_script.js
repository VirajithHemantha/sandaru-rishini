/**
 * Google Apps Script for Sandaru & Rishini Wedding
 * 
 * Target Spreadsheet: https://docs.google.com/spreadsheets/d/1RIKNKHll_tn-zv3GCUsfnLSEeMpMUNxLCglmTdsa7dU/edit
 * 
 * Instructions:
 * 1. Open the spreadsheet above.
 * 2. Go to Extensions > App Script.
 * 3. Delete any existing code and paste this.
 * 4. Click 'Deploy' > 'New Deployment'.
 * 5. Select 'Web App'.
 * 6. Execute as: 'Me'.
 * 7. Who has access: 'Anyone'.
 * 8. Click 'Deploy' and copy the 'Web App URL'.
 * 9. Paste the URL into the 'endpoint' variable in App.tsx.
 */

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data;
  
  try {
    // Handle both JSON and Form submissions (fallback for no-cors)
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseError) {
        // Check if it's wrapped in a 'payload' parameter
        if (e.parameter && e.parameter.payload) {
          data = JSON.parse(e.parameter.payload);
        } else {
          throw parseError;
        }
      }
    } else if (e.parameter && e.parameter.payload) {
      data = JSON.parse(e.parameter.payload);
    } else {
      throw new Error("No data received");
    }

    if (data.type === "wish") {
      // SAVE TO WISHES SHEET
      var sheet = ss.getSheetByName("Wishes") || ss.insertSheet("Wishes");
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Timestamp", "Name", "Wish Message"]);
        sheet.getRange(1, 1, 1, 3).setFontWeight("bold").setBackground("#f3f3f3");
      }
      sheet.appendRow([
        data.submittedAt || new Date().toISOString(),
        data.name,
        data.wish
      ]);
      
    } else {
      // SAVE TO RSVP SHEET
      var sheet = ss.getSheetByName("RSVP") || ss.insertSheet("RSVP");
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Timestamp", "Attendance", "Type", "Guest Count", "Guest Names", "Meal Preferences"]);
        sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#f3f3f3");
      }
      
      var names = "";
      var meals = "";
      
      if (data.guests && Array.isArray(data.guests)) {
        names = data.guests.map(function(g) { return g.name; }).join(", ");
        meals = data.guests.map(function(g) { return g.meal; }).join(", ");
      }
      
      sheet.appendRow([
        data.submittedAt || new Date().toISOString(),
        data.attendance,
        data.partyType,
        data.guestCount,
        names,
        meals
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": err.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Wedding RSVP & Wishes API is active.");
}
