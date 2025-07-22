import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Medal, 
  Award, 
  Users, 
  MapPin,
  Recycle,
  Crown,
  Star
} from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  score: number;
  badge?: string;
  location?: string;
}

export const LeaderBoard = () => {
  const topUsers: LeaderboardEntry[] = [
    { rank: 1, id: "U001", name: "EcoWarrior2024", score: 2847, badge: "Eco Champion", location: "Bangalore" },
    { rank: 2, id: "U002", name: "GreenHero", score: 2156, badge: "Earth Saver", location: "Mumbai" },
    { rank: 3, id: "U003", name: "PackageReturner", score: 1923, badge: "Return Master", location: "Delhi" },
    { rank: 4, id: "U004", name: "SustainableSam", score: 1745, badge: "Green Guardian", location: "Chennai" },
    { rank: 5, id: "U005", name: "EcoFriendly", score: 1598, badge: "Planet Protector", location: "Hyderabad" }
  ];

  const topCities: LeaderboardEntry[] = [
    { rank: 1, id: "C001", name: "Bangalore", score: 15847, location: "Karnataka" },
    { rank: 2, id: "C002", name: "Mumbai", score: 14235, location: "Maharashtra" },
    { rank: 3, id: "C003", name: "Delhi", score: 12456, location: "Delhi NCR" },
    { rank: 4, id: "C004", name: "Chennai", score: 11234, location: "Tamil Nadu" },
    { rank: 5, id: "C005", name: "Hyderabad", score: 9876, location: "Telangana" }
  ];

  const topSellers: LeaderboardEntry[] = [
    { rank: 1, id: "S001", name: "TechGuru Electronics", score: 8945, badge: "Eco Seller" },
    { rank: 2, id: "S002", name: "Fashion Forward", score: 7234, badge: "Green Partner" },
    { rank: 3, id: "S003", name: "Home Essentials", score: 6123, badge: "Sustainable Store" },
    { rank: 4, id: "S004", name: "BookWorld", score: 5456, badge: "Eco Champion" },
    { rank: 5, id: "S005", name: "Sports Arena", score: 4789, badge: "Green Seller" }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-orange-500" />;
      default: return <Star className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2: return "bg-gradient-to-r from-gray-400 to-gray-600 text-white";
      case 3: return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const LeaderboardCard = ({ title, entries, scoreLabel, icon: Icon }: {
    title: string;
    entries: LeaderboardEntry[];
    scoreLabel: string;
    icon: any;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>
          Top performers in sustainable packaging
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8">
                  {entry.rank <= 3 ? (
                    <div className={`p-1 rounded-full ${getRankBadgeColor(entry.rank)}`}>
                      {getRankIcon(entry.rank)}
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">#{entry.rank}</span>
                  )}
                </div>
                
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-eco text-white">
                    {entry.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-1">
                  <p className="font-medium">{entry.name}</p>
                  <div className="flex items-center gap-2">
                    {entry.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {entry.location}
                      </div>
                    )}
                    {entry.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {entry.badge}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-lg">{entry.score.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{scoreLabel}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-eco text-white">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Trophy className="h-6 w-6" />
            PackChain Champions
          </CardTitle>
          <CardDescription className="text-white/80">
            Celebrating our top contributors to sustainable packaging
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Top Users
          </TabsTrigger>
          <TabsTrigger value="cities" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Top Cities
          </TabsTrigger>
          <TabsTrigger value="sellers" className="flex items-center gap-2">
            <Recycle className="h-4 w-4" />
            Top Sellers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <LeaderboardCard
            title="Top Returners"
            entries={topUsers}
            scoreLabel="Returns"
            icon={Trophy}
          />
        </TabsContent>

        <TabsContent value="cities">
          <LeaderboardCard
            title="Leading Cities"
            entries={topCities}
            scoreLabel="Total Returns"
            icon={MapPin}
          />
        </TabsContent>

        <TabsContent value="sellers">
          <LeaderboardCard
            title="Sustainable Sellers"
            entries={topSellers}
            scoreLabel="Eco Score"
            icon={Recycle}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};