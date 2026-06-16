// Vercel redeploy trigger
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const data = new FormData();
    data.append("file", file);

    const pinataMetadata = JSON.stringify({
      name: file.name || "Product Image",
    });
    data.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 1, // Using CID v1
    });
    data.append("pinataOptions", pinataOptions);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: data as any,
    });

    const resData = await res.json();
    
    if (!res.ok) {
      console.error("Pinata Error Details:", resData);
      return NextResponse.json({ error: "Pinata upload failed" }, { status: 500 });
    }

    const gatewayUrl = process.env.NEXT_PUBLIC_PINATA_GATEWAY 
      ? `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${resData.IpfsHash}`
      : `https://gateway.pinata.cloud/ipfs/${resData.IpfsHash}`;

    return NextResponse.json({ 
      cid: resData.IpfsHash,
      gatewayUrl: gatewayUrl
    });

  } catch (error: any) {
    console.error("IPFS Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
