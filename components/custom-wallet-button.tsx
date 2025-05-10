import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WalletIcon, ChevronDown } from "lucide-react";

export function CustomWalletButton() {
  const { wallet, connect, disconnect, publicKey } = useWallet();

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
        >
          <WalletIcon className="h-5 w-5" />
          {publicKey ? (
            <>
              {shortenAddress(publicKey.toString())}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </>
          ) : (
            "Connect Wallet"
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] p-2">
        {publicKey ? (
          <>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(publicKey.toString());
              }}
            >
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-red-500 focus:text-red-500"
              onClick={() => disconnect()}
            >
              Disconnect
            </DropdownMenuItem>
          </>
        ) : (
          wallet?.adapter && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => connect()}
            >
              Connect {wallet.adapter.name}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
