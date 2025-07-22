import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Server, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Globe, 
  Database,
  Shield,
  Zap,
  Users,
  FileText,
  Network
} from "lucide-react";

interface NetworkNode {
  id: string;
  name: string;
  type: "order" | "logistics" | "seller" | "auditor";
  status: "online" | "offline" | "syncing";
  location: string;
  transactions: number;
  lastBlock: number;
}

interface SmartContract {
  name: string;
  address: string;
  status: "active" | "deployed" | "updating";
  transactions: number;
  gasUsed: number;
}

export const BlockchainNetwork = () => {
  const [networkHealth, setNetworkHealth] = useState(98);
  const [totalTransactions, setTotalTransactions] = useState(47823);
  const [blocksGenerated, setBlocksGenerated] = useState(1247);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        setTotalTransactions(prev => prev + Math.floor(Math.random() * 5) + 1);
        if (Math.random() > 0.8) {
          setBlocksGenerated(prev => prev + 1);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const nodes: NetworkNode[] = [
    {
      id: "NODE001",
      name: "Order Service Peer",
      type: "order",
      status: "online",
      location: "Bangalore DC",
      transactions: 15847,
      lastBlock: 1247
    },
    {
      id: "NODE002", 
      name: "Logistics Peer",
      type: "logistics",
      status: "online",
      location: "Mumbai Hub",
      transactions: 12456,
      lastBlock: 1247
    },
    {
      id: "NODE003",
      name: "Seller Partner",
      type: "seller", 
      status: "syncing",
      location: "Delhi NCR",
      transactions: 9834,
      lastBlock: 1246
    },
    {
      id: "NODE004",
      name: "Audit Node",
      type: "auditor",
      status: "online",
      location: "Chennai",
      transactions: 7421,
      lastBlock: 1247
    }
  ];

  const smartContracts: SmartContract[] = [
    {
      name: "Deposit Contract",
      address: "0x1a2b3c...4d5e",
      status: "active",
      transactions: 18945,
      gasUsed: 2847362
    },
    {
      name: "Rewards Contract", 
      address: "0x2b3c4d...5e6f",
      status: "active",
      transactions: 15672,
      gasUsed: 2156789
    },
    {
      name: "Redemption Contract",
      address: "0x3c4d5e...6f7g",
      status: "active",
      transactions: 8234,
      gasUsed: 1534298
    },
    {
      name: "Audit Contract",
      address: "0x4d5e6f...7g8h", 
      status: "deployed",
      transactions: 5467,
      gasUsed: 987456
    }
  ];

  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "offline": return "bg-red-500";
      case "syncing": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getNodeStatusIcon = (status: string) => {
    switch (status) {
      case "online": return <CheckCircle className="h-4 w-4" />;
      case "offline": return <AlertTriangle className="h-4 w-4" />;
      case "syncing": return <Activity className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "deployed": return "bg-blue-100 text-blue-800";
      case "updating": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Health</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkHealth}%</div>
            <Progress value={networkHealth} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Database className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocks Generated</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blocksGenerated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Latest: Block #{blocksGenerated}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Nodes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              Network Nodes
            </CardTitle>
            <CardDescription>
              Hyperledger Fabric peer nodes status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nodes.map((node) => (
                <div key={node.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${getNodeStatusColor(node.status)} bg-opacity-20`}>
                      <div className={`${getNodeStatusColor(node.status)} p-1 rounded-full text-white`}>
                        {getNodeStatusIcon(node.status)}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-medium">{node.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {node.type}
                        </Badge>
                        <span>{node.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <Badge className={getNodeStatusColor(node.status) + " text-white"}>
                      {node.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Block #{node.lastBlock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Smart Contracts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Smart Contracts
            </CardTitle>
            <CardDescription>
              Deployed chaincode contracts status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {smartContracts.map((contract, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{contract.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {contract.address}
                      </p>
                    </div>
                    <Badge className={getContractStatusColor(contract.status)}>
                      {contract.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Transactions</p>
                      <p className="font-medium">{contract.transactions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gas Used</p>
                      <p className="font-medium">{contract.gasUsed.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Architecture Overview
          </CardTitle>
          <CardDescription>
            PackChain network architecture and data flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-6 rounded-lg">
            <div className="text-center space-y-4">
              <div className="flex justify-center items-center gap-8 flex-wrap">
                <div className="text-center space-y-2">
                  <div className="p-4 bg-gradient-eco rounded-xl">
                    <Zap className="h-6 w-6 text-white mx-auto" />
                  </div>
                  <p className="text-sm font-medium">IoT Layer</p>
                  <p className="text-xs text-muted-foreground">NFC/RFID Tags</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="p-4 bg-gradient-accent rounded-xl">
                    <Server className="h-6 w-6 text-white mx-auto" />
                  </div>
                  <p className="text-sm font-medium">API Gateway</p>
                  <p className="text-xs text-muted-foreground">Microservices</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="p-4 bg-gradient-eco rounded-xl">
                    <Network className="h-6 w-6 text-white mx-auto" />
                  </div>
                  <p className="text-sm font-medium">Blockchain</p>
                  <p className="text-xs text-muted-foreground">Hyperledger Fabric</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="p-4 bg-gradient-accent rounded-xl">
                    <Users className="h-6 w-6 text-white mx-auto" />
                  </div>
                  <p className="text-sm font-medium">Frontend</p>
                  <p className="text-xs text-muted-foreground">React App</p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                PackChain uses a permissioned blockchain network with RAFT consensus, 
                supporting 1000+ TPS for real-time package tracking and token transactions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};