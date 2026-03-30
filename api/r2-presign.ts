import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const accountId = process.env.R2_ACCOUNT_ID!;
const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
const bucket = process.env.R2_BUCKET!;

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, contentType, caseId } = req.body || {};

    if (!fileName || !contentType || !caseId) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName}`;
    const key = `${caseId}/${safeName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });

    return res.status(200).json({
      uploadUrl,
      key,
      publicUrl: `${process.env.R2_PUBLIC_BASE_URL}/${key}`
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to sign upload' });
  }
}