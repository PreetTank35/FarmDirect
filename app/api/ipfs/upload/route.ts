// Vercel redeploy trigger
import { NextResponse } from "next/server";
import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT || "",
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY?.replace("https://", "") || "gateway.pinata.cloud",
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Use official SDK which natively handles Node/Next.js streams safely
    const upload = await pinata.upload.file(file);

    const gatewayUrl = process.env.NEXT_PUBLIC_PINATA_GATEWAY 
      ? `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${upload.IpfsHash}`
      : `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`;

    return NextResponse.json({ 
      cid: upload.IpfsHash,
      gatewayUrl: gatewayUrl
    });

  } catch (error: any) {
    console.error("IPFS Upload Error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload to Pinata" }, { status: 500 });
  }
}
