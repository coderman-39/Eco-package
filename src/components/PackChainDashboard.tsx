import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  Recycle, 
  Award, 
  TrendingUp, 
  Smartphone, 
  Truck, 
  Leaf,
  Users,
  BarChart3,
  Coins,
  Target,
  Globe
} from "lucide-react";
import { PackageTracker } from "./PackageTracker";
import { TokenWallet } from "./TokenWallet";
import { LeaderBoard } from "./LeaderBoard";
import { BlockchainNetwork } from "./BlockchainNetwork";
import { useApi } from "@/hooks/useApi";
import api from "@/lib/api";

// Define interfaces for our data
interface AnalyticsData {
  totalPackages: number;
  totalReturns: number;
  tokensIssued: number;
  carbonSaved: number;
}

interface Activity {
  action: string;
  user: string;
  tokens: number;
  time: string;
}

const PackChainDashboard = () => {
  // Fetch initial analytics data
  const { data: analytics, isLoading: isLoadingAnalytics } = useApi<AnalyticsData>('/analytics/summary');

  // State for real-time data
  const [liveStats, setLiveStats] = useState<AnalyticsData | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  useEffect(() => {
    if (analytics) {
      setLiveStats(analytics);
    }
  }, [analytics]);
  
  // Connect to the IoT event stream
  useEffect(() => {
    const eventSource = new EventSource(`${api.defaults.baseURL}/iot/events`);

    eventSource.onopen = () => {
      console.log('SSE connection opened.');
    };

    // Listen for telemetry data
    eventSource.addEventListener('telemetry', (event) => {
      const data = JSON.parse(event.data);
      console.log('Received telemetry event:', data);
      // Here you could update a specific device's status in a more complex state
    });
    
    // Listen for NFC scans, which might represent a package return
    eventSource.addEventListener('nfc_scan', (event) => {
      const scan = JSON.parse(event.data);
      console.log('Received NFC scan event:', scan);
      
      setLiveStats(prev => prev ? { ...prev, totalReturns: prev.totalReturns + 1 } : null);

      const newActivity: Activity = {
        action: "Package Returned",
        user: `Device #${scan.readerId.slice(0, 6)}`,
        tokens: 5, // This would ideally come from the backend
        time: "Just now"
      };
      setRecentActivity(prev => [newActivity, ...prev.slice(0, 3)]);
    });

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const stats = [
    {
      title: "Active Packages",
      value: liveStats?.totalPackages?.toLocaleString() || '---',
      icon: Package,
    },
    {
      title: "Total Returns",
      value: liveStats?.totalReturns?.toLocaleString() || '---',
      icon: Recycle,
    },
    {
      title: "Green Tokens Issued",
      value: liveStats?.tokensIssued?.toLocaleString() || '---',
      icon: Coins,
    },
    {
      title: "Carbon Saved (Tons)",
      value: liveStats?.carbonSaved?.toFixed(1) || '---',
      icon: Leaf,
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-eco rounded-2xl shadow-eco">
                    <Package className="h-8 w-8 text-primary-foreground" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-eco bg-clip-text text-transparent">
                    PackChain
                </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transforming packaging into a trackable, sustainable ecosystem powered by Hyperledger Fabric and real-time IoT.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
                <Badge variant="secondary" className="flex items-center gap-1"><Globe className="h-3 w-3" />Hyperledger Fabric</Badge>
                <Badge variant="secondary" className="flex items-center gap-1"><Smartphone className="h-3 w-3" />MQTT & IoT</Badge>
                <Badge variant="secondary" className="flex items-center gap-1"><Award className="h-3 w-3" />Tokenized Rewards</Badge>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoadingAnalytics ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-1/3" />
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-eco transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className="p-2 rounded-lg bg-gradient-eco opacity-80 group-hover:opacity-100 transition-opacity">
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="dashboard" className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />Dashboard</TabsTrigger>
                <TabsTrigger value="tracker" className="flex items-center gap-2"><Package className="h-4 w-4" />Package Tracker</TabsTrigger>
                <TabsTrigger value="wallet" className="flex items-center gap-2"><Coins className="h-4 w-4" />Token Wallet</TabsTrigger>
                <TabsTrigger value="leaderboard" className="flex items-center gap-2"><Award className="h-4 w-4" />Leaderboard</TabsTrigger>
                <TabsTrigger value="network" className="flex items-center gap-2"><Globe className="h-4 w-4" />Network</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" />Environmental Impact</CardTitle>
                            <CardDescription>Real-time sustainability metrics based on returns</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* ... Impact content can be made dynamic later ... */}
                        </CardContent>
                    </Card>

                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Live Activity</CardTitle>
                            <CardDescription>Latest package returns and rewards from the network</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((activity, index) => (
                                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="space-y-1">
                                          <p className="text-sm font-medium">{activity.action}</p>
                                          <p className="text-xs text-muted-foreground">{activity.user} • {activity.time}</p>
                                        </div>
                                        <Badge variant="secondary" className="bg-gradient-eco text-white">
                                          +{activity.tokens} tokens
                                        </Badge>
                                      </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">Awaiting network activity...</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="tracker"><PackageTracker /></TabsContent>
            <TabsContent value="wallet"><TokenWallet balance={liveStats?.tokensIssued || 0} /></TabsContent>
            <TabsContent value="leaderboard"><LeaderBoard /></TabsContent>
            <TabsContent value="network"><BlockchainNetwork /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PackChainDashboard;