import {setGlobalOptions} from "firebase-functions";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import * as puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// Initialize Firebase Admin
admin.initializeApp();

// Set global options for cost control
setGlobalOptions({maxInstances: 10});

/**
 * Cloud Function to generate Open Graph images for shared code snippets
 * Accepts: { fileId, code, fileName }
 * Returns: { imageUrl }
 */
export const generateShareImage = onCall(
  {
    maxInstances: 5,
    memory: "1GiB",
    timeoutSeconds: 60,
  },
  async (request) => {
    const {fileId, code, fileName} = request.data || {};

    if (!fileId || !code) {
      logger.error("Missing required fields", {fileId, code: !!code, fileName});
      throw new HttpsError("invalid-argument", "Missing fileId or code");
    }

    try {
      // Check if image already exists in cache
      const bucket = admin.storage().bucket();
      const imagePath = `og-images/${fileId}.png`;
      const file = bucket.file(imagePath);
      const [exists] = await file.exists();

      if (exists) {
        logger.info("Returning cached OG image", {fileId});
        const [url] = await file.getSignedUrl({
          action: "read",
          expires: "03-01-2500",
        });
        return {imageUrl: url};
      }

      logger.info("Generating new OG image", {fileId, fileName});

      // Generate new image with Puppeteer (Serverless)
      const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: {width: 1200, height: 630},
        executablePath: await chromium.executablePath(),
        headless: true,
      });

      const page = await browser.newPage();
      await page.setViewport({width: 1200, height: 630});

      // Create HTML template for the OG image
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                width: 1200px;
                height: 630px;
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-family: 'JetBrains Mono', monospace;
                padding: 60px;
              }
              .header {
                position: absolute;
                top: 40px;
                left: 60px;
                display: flex;
                align-items: center;
                gap: 15px;
              }
              .logo {
                width: 50px;
                height: 50px;
                background: #06b6d4;
                border-radius: 12px;
              }
              .brand {
                font-size: 32px;
                font-weight: 700;
                color: white;
              }
              .code-container {
                background: #1e293b;
                border: 2px solid #334155;
                border-radius: 16px;
                padding: 30px;
                width: 100%;
                max-height: 450px;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
              }
              .file-name {
                color: #94a3b8;
                font-size: 18px;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #334155;
              }
              .code {
                color: #e2e8f0;
                font-size: 20px;
                line-height: 1.6;
                white-space: pre-wrap;
                word-wrap: break-word;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo"></div>
              <div class="brand">CodeToCoder</div>
            </div>
            <div class="code-container">
              <div class="file-name">${escapeHtml(fileName || "Untitled.py")}</div>
              <div class="code">${escapeHtml(code.substring(0, 500))}</div>
            </div>
          </body>
        </html>
      `;

      await page.setContent(html);
      const screenshot = await page.screenshot({type: "png"});
      await browser.close();

      // Upload to Cloud Storage
      await file.save(screenshot, {
        metadata: {contentType: "image/png"},
        public: true,
      });

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${imagePath}`;

      logger.info("OG image generated successfully", {fileId, publicUrl});
      return {imageUrl: publicUrl};
    } catch (error) {
      logger.error("Error generating OG image", error);
      throw new HttpsError("internal", "Failed to generate image");
    }
  }
);

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
