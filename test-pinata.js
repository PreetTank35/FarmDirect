const fs = require('fs');

async function testNativePinata() {
  const jwt = process.env.PINATA_JWT;

  const fileBlob = new Blob(['Hello Pinata!'], { type: 'text/plain' });
  const file = new File([fileBlob], 'dummy.txt', { type: 'text/plain' });
  
  const data = new FormData();
  data.append('file', file);
  
  const pinataMetadata = JSON.stringify({ name: 'test_upload' });
  data.append('pinataMetadata', pinataMetadata);
  
  const pinataOptions = JSON.stringify({ cidVersion: 1 });
  data.append('pinataOptions', pinataOptions);

  try {
    console.log("Uploading to Pinata using Native FormData...");
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: data,
    });

    const resData = await res.json();
    if (!res.ok) {
      console.error("PINATA UPLOAD ERROR:", resData);
    } else {
      console.log("PINATA UPLOAD SUCCESS! CID:", resData.IpfsHash);
    }
  } catch (err) {
    console.error("FETCH ERROR:", err);
  }
}

testNativePinata();
