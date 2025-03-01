import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Client, Asset } from "@hiveio/dhive";
// import { DatePicker } from "@/components/ui/date-picker";

const client = new Client([
  "https://api.hive.blog",
  "https://api.hivekings.com",
  "https://anyx.io",
  "https://api.openhive.network",
]);

interface HiveKeychain {
  requestHandshake: () => void;
  requestCustomJson: (
    username: string,
    id: string,
    keyType: string,
    json: string,
    displayName: string,
    callback: (response: any) => void
  ) => void;
  requestSignBuffer: (
    username: string,
    message: string,
    key: string,
    callback: (response: any) => void
  ) => void;
}

declare global {
  interface Window {
    hive_keychain: HiveKeychain;
  }
}

function CarbonCreditManagement() {
  const [username, setUsername] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [balance, setBalance] = useState<Asset | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);
  // const [tokenId, setTokenId] = useState<string>("");
  // const [newMinter, setNewMinter] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const { toast } = useToast();
  const [to, setTo] = useState<string>("");
  const [typeofcredit, setTypeOfCredit] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [certificateURI, setCertificateURI] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);

  const contractName = "carbon_credit_nft";

  const connectToKeychain = async () => {
    try {
      if (!username.trim()) {
        toast({
          title: "Username Required",
          description: "Please enter your Hive username first",
          variant: "destructive",
        });
        return;
      }

      if (typeof window === "undefined" || !window.hive_keychain) {
        toast({
          title: "Keychain Not Found",
          description: "Please install Hive Keychain extension",
          variant: "destructive",
        });
        return;
      }

      window.hive_keychain.requestHandshake();

      window.hive_keychain.requestSignBuffer(
        username,
        "Login to Carbon Credit Management App",
        "Posting",
        (response: any) => {
          if (response.success) {
            setIsConnected(true);
            localStorage.setItem("hive_username", username);

            toast({
              title: "Connected",
              description: `Successfully connected as ${username}`,
            });

            getBalance();
          } else {
            toast({
              title: "Connection Failed",
              description:
                response.message || "Failed to connect to Hive Keychain",
              variant: "destructive",
            });
          }
        }
      );
    } catch (error) {
      console.error("Error connecting to Hive Keychain:", error);
      toast({
        title: "Connection Error",
        description: "An error occurred while connecting to Hive Keychain",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = () => {
    if (typeof window !== "undefined" && window.hive_keychain) {
      const storedUsername = localStorage.getItem("hive_username");
      if (storedUsername) {
        setUsername(storedUsername);
        setIsConnected(true);
        getBalance(storedUsername);
      }
    }
  };

  const getBalance = async (user = username) => {
    if (user) {
      try {
        const account = await client.database.getAccounts([user]);
        if (account && account.length > 0) {
          if (typeof account[0].balance === "string") {
            setBalance(Asset.fromString(account[0].balance));
          } else {
            setBalance(account[0].balance);
          }
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
        toast({
          title: "Error",
          description: "Failed to fetch balance",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    if (username) {
      localStorage.setItem("hive_username", username);
    }
  }, [username]);

  const mintNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !to ||
      !typeofcredit ||
      !quantity ||
      !certificateURI ||
      !expiryDate ||
      !rate
    )
      return;

    const expiryTimestamp = Math.floor(expiryDate.getTime() / 1000);
    setIsPending(true);

    const json = JSON.stringify({
      contractName: contractName,
      contractAction: "mint",
      contractPayload: {
        to,
        typeofcredit,
        quantity,
        certificateURI,
        expiryDate: expiryTimestamp,
        rate,
      },
    });

    window.hive_keychain.requestCustomJson(
      username,
      "ssc-mainnet-hive",
      "Active",
      json,
      "Mint Carbon Credit NFT",
      (response) => {
        if (response.success) {
          console.log(response);
          toast({
            title: "NFT Minted Successfully",
            description: `Transaction ID: ${response.result.id}`,
          });
        } else {
          console.log(response);
          toast({
            title: "Error Minting NFT",
            description: response.message,
            variant: "destructive",
          });
        }
        setIsPending(false);
      }
    );
  };

  return (
    <Card className="w-[350px] mx-auto">
      <CardHeader>
        <CardTitle>Carbon Credit Management</CardTitle>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="flex flex-col space-y-2 mb-4">
            <p className="text-sm">
              Connected as: <span className="font-bold">{username}</span>
            </p>
            <Button
              onClick={() => {
                setUsername("");
                setIsConnected(false);
                localStorage.removeItem("hive_username");
                setBalance(null);
              }}
              variant="outline"
              size="sm"
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="mb-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="username">Hive Username</Label>
              <Input
                id="username"
                placeholder="Enter your Hive username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <Button
              onClick={connectToKeychain}
              className="w-full"
              disabled={!username.trim()}
            >
              Connect with Hive Keychain
            </Button>
          </div>
        )}

        {isConnected && (
          <>
            <div className="grid w-full items-center gap-4">
              <Button onClick={() => getBalance()}>Refresh Balance</Button>
              {balance && (
                <div className="bg-muted p-2 rounded-md text-center">
                  <p>
                    Balance:{" "}
                    <span className="font-bold">{balance.amount} HIVE</span>
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={mintNFT} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="to">Recipient</Label>
                <Input
                  id="to"
                  placeholder="Recipient username"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="typeofcredit">Credit Type</Label>
                <Input
                  id="typeofcredit"
                  placeholder="Type of carbon credit"
                  value={typeofcredit}
                  onChange={(e) => setTypeOfCredit(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  placeholder="Amount of credits"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate">Rate</Label>
                <Input
                  id="rate"
                  placeholder="Rate in HIVE"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificateURI">Certificate URI</Label>
                <Input
                  id="certificateURI"
                  placeholder="URL to certificate"
                  value={certificateURI}
                  onChange={(e) => setCertificateURI(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  onChange={(e) => setExpiryDate(new Date(e.target.value))}
                />
              </div>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Minting..." : "Mint Carbon Credit NFT"}
              </Button>
            </form>
          </>
        )}
      </CardContent>
      <Toaster />
    </Card>
  );
}

export default CarbonCreditManagement;
