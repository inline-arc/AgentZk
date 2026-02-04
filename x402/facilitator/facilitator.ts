import express from "express";
import { Facilitator, createExpressAdapter } from "x402-open";
import { paymentMiddleware } from "x402-express";


const app = express();
app.use(express.json());

// Create the facilitator with SVM support
const facilitator = new Facilitator({
  // EVM support (commented out)
  // evmPrivateKey: process.env.PRIVATE_KEY as `0x${string}`,
  // evmNetworks: [baseSepolia],
  
  // SVM (Solana) support
  svmPrivateKey: process.env.SOLANA_PRIVATE_KEY!,
  svmNetworks: ["solana-devnet"],
});

app.use(
  paymentMiddleware(
    "0x57DE62Ef98C6334ee545F05fd53e29586EC7d4d1",
    {
      "GET /weather": { price: "$0.0001", network: "solana-devnet" },
    },
    { url: "http://localhost:4021/facilitator" }
  )
);

app.get("/weather", (_req: any, res: any) => {
  res.send({ report: { weather: "sunny", temperature: 70 } });
});
// Exposes: GET /facilitator/supported, POST /facilitator/verify, POST /facilitator/settle
createExpressAdapter(facilitator, app, "/facilitator");

app.listen(4021, () => console.log("Node HTTP on http://localhost:4021"));