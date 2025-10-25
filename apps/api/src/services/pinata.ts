import FormData from 'form-data';
import fetch from 'node-fetch';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud';

export async function uploadToPinata(buffer: Buffer, filename: string): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error('Pinata API keys not configured');
  }

  const formData = new FormData();
  formData.append('file', buffer, {
    filename,
    contentType: 'application/octet-stream',
  });

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
    }

    const result = await response.json() as { IpfsHash: string };
    return result.IpfsHash;
  } catch (error) {
    console.error('Pinata upload error:', error);
    throw new Error('Failed to upload to Pinata');
  }
}

export function getPinataUrl(cid: string): string {
  return `${PINATA_GATEWAY}/ipfs/${cid}`;
}
