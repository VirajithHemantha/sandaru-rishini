/**
 * Google Apps Script for Sandaru & Rishini Wedding — Photo Uploads (/memory page)
 *
 * Target Drive folder:
 * https://drive.google.com/drive/folders/16sWbp3Uydcna2PnjTiu0WnnQ0OWzLWT_
 *
 * Instructions:
 * 1. Go to https://script.google.com and click '+ New project'.
 * 2. Name it something like "Wedding Memories".
 * 3. Delete the sample code, paste this whole file, and save.
 * 4. Click 'Deploy' > 'New deployment'.
 * 5. Select type 'Web app'.
 * 6. Execute as: 'Me'.
 * 7. Who has access: 'Anyone'.
 * 8. Click 'Deploy', allow the Google Drive permission, and copy the 'Web app URL'.
 * 9. Paste the URL into MEMORY_ENDPOINT in src/Memory.tsx.
 *
 * The Google account that deploys this must own or have edit access to the folder.
 */

var FOLDER_ID = "16sWbp3Uydcna2PnjTiu0WnnQ0OWzLWT_";

function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      throw new Error("No data received");
    }
    var data = JSON.parse(e.postData.contents);

    if (!data.fileData || !data.mimeType) {
      throw new Error("Missing file");
    }
    if (data.mimeType.indexOf("image/") !== 0) {
      throw new Error("Only images are allowed");
    }

    var folder = DriveApp.getFolderById(FOLDER_ID);
    var guest = (data.name || "Guest").toString().replace(/[\\\/:*?"<>|]/g, "").trim() || "Guest";
    var stamp = Utilities.formatDate(new Date(), "Asia/Colombo", "yyyy-MM-dd_HH-mm-ss");
    var originalName = (data.fileName || "photo").toString().replace(/[\\\/:*?"<>|]/g, "");
    var fileName = guest + "_" + stamp + "_" + originalName;

    var bytes = Utilities.base64Decode(data.fileData);
    var blob = Utilities.newBlob(bytes, data.mimeType, fileName);
    var file = folder.createFile(blob);
    file.setDescription("Uploaded by " + guest + " on " + new Date().toISOString());

    return ContentService.createTextOutput(JSON.stringify({ status: "success", id: file.getId() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Wedding Memories upload API is active.");
}
