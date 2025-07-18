import { generateText } from "ai";
import { myProvider } from "@/chat/provider";

export async function GET() {
  const result = await generateText({
    model: myProvider.languageModel("chat-model"),
    prompt: "Hello, world!",
  });

  return Response.json(result.text);
}
