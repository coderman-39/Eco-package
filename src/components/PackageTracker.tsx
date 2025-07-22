import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  MapPin, 
  Truck, 
  CheckCircle, 
  Clock, 
  Scan,
  AlertCircle
} from "lucide-react";

interface PackageStatus {
  id: string;
  status: "manufactured" | "dispatched" | "delivered" | "returned" | "processing";
  location: string;
  timestamp: string;
  rfidTag: string;
}

export const PackageTracker = () => {
  const [searchId, setSearchId] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  // Mock package data
  const packages: PackageStatus[] = [
    {
      id: "PKG001847",
      status: "returned",
      location: "Flipkart Locker - Koramangala",
      timestamp: "2024-01-15 14:30",
      rfidTag: "RFID_A847B23C"
    },
    {
      id: "PKG002156",
      status: "delivered",
      location: "Customer Address - Whitefield",
      timestamp: "2024-01-15 12:15",
      rfidTag: "RFID_B156C89D"
    },
    {
      id: "PKG003291",
      status: "dispatched",
      location: "Delivery Hub - Electronic City",
      timestamp: "2024-01-15 09:45",
      rfidTag: "RFID_C291D45E"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "manufactured": return <Package className="h-4 w-4" />;
      case "dispatched": return <Truck className="h-4 w-4" />;
      case "delivered": return <MapPin className="h-4 w-4" />;
      case "returned": return <CheckCircle className="h-4 w-4" />;
      case "processing": return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "manufactured": return "bg-blue-500";
      case "dispatched": return "bg-yellow-500";
      case "delivered": return "bg-orange-500";
      case "returned": return "bg-green-500";
      case "processing": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    // Simulate NFC scan
    setTimeout(() => {
      setSearchId("PKG001847");
      setIsScanning(false);
    }, 2000);
  };

  const filteredPackages = searchId 
    ? packages.filter(pkg => pkg.id.toLowerCase().includes(searchId.toLowerCase()))
    : packages;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Package Tracker
          </CardTitle>
          <CardDescription>
            Track IoT-tagged packages throughout their lifecycle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter Package ID or scan NFC tag..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleScan}
              disabled={isScanning}
              className="bg-gradient-eco hover:opacity-90"
            >
              <Scan className="h-4 w-4 mr-2" />
              {isScanning ? "Scanning..." : "NFC Scan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredPackages.map((pkg) => (
          <Card key={pkg.id} className="hover:shadow-eco transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${getStatusColor(pkg.status)} bg-opacity-20`}>
                    <div className={`${getStatusColor(pkg.status)} p-2 rounded-full`}>
                      {getStatusIcon(pkg.status)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{pkg.id}</h3>
                    <p className="text-sm text-muted-foreground">{pkg.location}</p>
                    <p className="text-xs text-muted-foreground">RFID: {pkg.rfidTag}</p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(pkg.status)} text-white capitalize`}
                  >
                    {pkg.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{pkg.timestamp}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-6 pl-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${pkg.status === 'manufactured' || pkg.status === 'dispatched' || pkg.status === 'delivered' || pkg.status === 'returned' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>Manufactured</span>
                  </div>
                  <div className="w-8 h-px bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${pkg.status === 'dispatched' || pkg.status === 'delivered' || pkg.status === 'returned' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>Dispatched</span>
                  </div>
                  <div className="w-8 h-px bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${pkg.status === 'delivered' || pkg.status === 'returned' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>Delivered</span>
                  </div>
                  <div className="w-8 h-px bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${pkg.status === 'returned' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>Returned</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};