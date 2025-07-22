import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Coins, 
  Gift, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Heart,
  ShoppingBag,
  Award
} from "lucide-react";

interface TokenWalletProps {
  balance: number;
}

interface Transaction {
  id: string;
  type: "earned" | "redeemed" | "bonus";
  amount: number;
  description: string;
  timestamp: string;
}

interface RedemptionOption {
  id: string;
  title: string;
  description: string;
  cost: number;
  type: "voucher" | "donation" | "badge";
  icon: any;
}

export const TokenWallet = ({ balance }: TokenWalletProps) => {
  const [selectedRedemption, setSelectedRedemption] = useState<string | null>(null);

  const transactions: Transaction[] = [
    {
      id: "TX001",
      type: "earned",
      amount: 5,
      description: "Package returned - PKG001847",
      timestamp: "2024-01-15 14:30"
    },
    {
      id: "TX002",
      type: "bonus",
      amount: 25,
      description: "Milestone: 50 Returns Champion",
      timestamp: "2024-01-15 10:15"
    },
    {
      id: "TX003",
      type: "redeemed",
      amount: -20,
      description: "5% Off Voucher Redeemed",
      timestamp: "2024-01-14 16:45"
    },
    {
      id: "TX004",
      type: "earned",
      amount: 5,
      description: "Package returned - PKG002156",
      timestamp: "2024-01-14 12:30"
    }
  ];

  const redemptionOptions: RedemptionOption[] = [
    {
      id: "voucher_5",
      title: "5% Off Voucher",
      description: "Save on your next order",
      cost: 20,
      type: "voucher",
      icon: ShoppingBag
    },
    {
      id: "voucher_10",
      title: "10% Off Voucher",
      description: "Bigger savings for eco warriors",
      cost: 50,
      type: "voucher",
      icon: Gift
    },
    {
      id: "donation_trees",
      title: "Plant 5 Trees",
      description: "Donate to environmental NGO",
      cost: 30,
      type: "donation",
      icon: Heart
    },
    {
      id: "badge_eco",
      title: "Eco Warrior Badge",
      description: "Exclusive digital badge",
      cost: 75,
      type: "badge",
      icon: Award
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned": return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case "redeemed": return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case "bonus": return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default: return <Coins className="h-4 w-4" />;
    }
  };

  const nextMilestone = 200;
  const progressToMilestone = (balance / nextMilestone) * 100;

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="bg-gradient-eco text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Coins className="h-6 w-6" />
            Green Token Wallet
          </CardTitle>
          <CardDescription className="text-white/80">
            Earn tokens by returning packages, redeem for rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-4xl font-bold mb-2">{balance.toLocaleString()}</div>
              <div className="text-white/80">Green Tokens</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Next Milestone</span>
                <span>{nextMilestone} tokens</span>
              </div>
              <Progress value={progressToMilestone} className="h-2 bg-white/20" />
              <div className="text-xs text-white/60">
                {nextMilestone - balance} tokens until Eco Champion badge
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Your latest token activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(tx.type)}
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.timestamp}</p>
                    </div>
                  </div>
                  <div className={`font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Redemption Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Redeem Tokens
            </CardTitle>
            <CardDescription>
              Use your tokens for rewards and donations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {redemptionOptions.map((option) => (
                <div 
                  key={option.id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedRedemption === option.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  } ${balance < option.cost ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => balance >= option.cost && setSelectedRedemption(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <option.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{option.title}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    <Badge variant={balance >= option.cost ? "default" : "secondary"}>
                      {option.cost} tokens
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedRedemption && (
              <Button 
                className="w-full mt-4 bg-gradient-eco hover:opacity-90"
                disabled={!selectedRedemption}
              >
                Redeem Selected Reward
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};