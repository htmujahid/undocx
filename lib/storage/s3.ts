import "server-only";

import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.S3_BUCKET || "undocx";

const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || undefined,
  region: process.env.S3_REGION || "us-east-1",
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "", secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "" },
});

export async function putObject(key: string, body: Uint8Array, contentType: string) {
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
}

export async function deleteObject(key: string) {
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function downloadUrl(key: string, filename: string, seconds = 60) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key, ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"` });
  return getSignedUrl(client, command, { expiresIn: seconds });
}

export async function deletePrefix(prefix: string) {
  let token: string | undefined;
  do {
    const page = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token }));
    const keys = (page.Contents ?? []).flatMap((object) => (object.Key ? [{ Key: object.Key }] : []));
    if (keys.length > 0) {
      const result = await client.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: keys, Quiet: true } }));
      if (result.Errors?.length) throw new Error(`Could not delete ${result.Errors.length} files`);
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
}
