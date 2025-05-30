import { NextRequest ,NextResponse } from "next/server";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
// gettigg wallet add slide 
export async function GET(req: NextRequest) {
    const ketpair = Keypair.fromSecretKey(
        bs58.decode(process.env.SOLANA_PRIVATE_KEY!)
    );
    const walletAddress = ketpair.publicKey.toBase58();
    let wallet = [
        {
            name: "Default Solana Wallet",
            slice: walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4),
        }
    ];
    return NextResponse.json({ wallet });
}