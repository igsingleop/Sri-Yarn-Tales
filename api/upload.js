// Vercel Serverless Function: Backblaze B2 Image Upload
// Keeps credentials 100% secret on the server side with zero client exposure

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const keyId = process.env.B2_KEY_ID || process.env.VITE_B2_KEY_ID;
  const appKey = process.env.B2_APPLICATION_KEY || process.env.VITE_B2_APPLICATION_KEY;
  const bucketId = process.env.B2_BUCKET_ID || "0c11ec2b45748acfa41b061f";
  const bucketName = process.env.B2_BUCKET_NAME || "Sri-Yarn-Tales";

  if (!keyId || !appKey) {
    return res.status(500).json({ error: "Backblaze B2 credentials not configured on server." });
  }

  try {
    // 1. Authorize with Backblaze B2
    const authRes = await fetch("https://api.backblazeb2.com/b2api/v3/b2_authorize_account", {
      headers: {
        Authorization: "Basic " + Buffer.from(`${keyId}:${appKey}`).toString("base64"),
      },
    });

    if (!authRes.ok) {
      const errBody = await authRes.text();
      return res.status(401).json({ error: "B2 authorization failed", details: errBody });
    }

    const auth = await authRes.json();
    const apiUrl = auth.apiInfo?.storageApi?.apiUrl;
    const downloadUrl = auth.apiInfo?.storageApi?.downloadUrl;

    // 2. Get Upload URL
    const uploadUrlRes = await fetch(`${apiUrl}/b2api/v3/b2_get_upload_url`, {
      method: "POST",
      headers: {
        Authorization: auth.authorizationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bucketId }),
    });

    if (!uploadUrlRes.ok) {
      const errBody = await uploadUrlRes.text();
      return res.status(500).json({ error: "Failed to get B2 upload URL", details: errBody });
    }

    const { uploadUrl, authorizationToken } = await uploadUrlRes.json();

    // 3. Parse uploaded file data (buffer / base64 or binary)
    let fileBuffer;
    let contentType = "image/jpeg";
    let fileName = `products/${Date.now()}-image.jpg`;

    if (req.body?.base64) {
      const matches = req.body.base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches) {
        contentType = matches[1];
        fileBuffer = Buffer.from(matches[2], "base64");
      } else {
        fileBuffer = Buffer.from(req.body.base64, "base64");
      }
      if (req.body.fileName) {
        fileName = `products/${Date.now()}-${req.body.fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      }
    } else if (Buffer.isBuffer(req.body)) {
      fileBuffer = req.body;
    } else {
      return res.status(400).json({ error: "Invalid file payload. Send base64 or binary data." });
    }

    // 4. Upload to Backblaze B2
    const b2UploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: authorizationToken,
        "X-Bz-File-Name": encodeURIComponent(fileName),
        "Content-Type": contentType,
        "Content-Length": String(fileBuffer.length),
        "X-Bz-Content-Sha1": "do_not_verify",
      },
      body: fileBuffer,
    });

    if (!b2UploadRes.ok) {
      const errBody = await b2UploadRes.text();
      return res.status(500).json({ error: "B2 upload failed", details: errBody });
    }

    const publicUrl = `${downloadUrl}/file/${bucketName}/${fileName}`;
    return res.status(200).json({ success: true, url: publicUrl, fileName });
  } catch (error) {
    return res.status(500).json({ error: "Server upload error", message: error.message });
  }
}
