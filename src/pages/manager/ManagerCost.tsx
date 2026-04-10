import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ManagerCost() {
  const [users, setUsers] = useState("1000");
  const [storage, setStorage] = useState("50");
  const [tier, setTier] = useState("standard");
  const [estimate, setEstimate] = useState<number | null>(null);

  const calculate = () => {
    const base = tier === "basic" ? 29 : tier === "standard" ? 99 : 299;
    const userCost = parseInt(users) * 0.02;
    const storageCost = parseInt(storage) * 0.5;
    setEstimate(Math.round(base + userCost + storageCost));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI Cost Estimator</h1>
      <div className="max-w-lg rounded-lg border border-border bg-card p-6 space-y-5 animate-fade-in">
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Expected Users</Label>
          <Input type="number" value={users} onChange={(e) => setUsers(e.target.value)} className="bg-secondary border-border" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Storage (GB)</Label>
          <Input type="number" value={storage} onChange={(e) => setStorage(e.target.value)} className="bg-secondary border-border" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Tier</Label>
          <Select value={tier} onValueChange={setTier}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic ($29/mo)</SelectItem>
              <SelectItem value="standard">Standard ($99/mo)</SelectItem>
              <SelectItem value="enterprise">Enterprise ($299/mo)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={calculate} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          <Calculator className="h-4 w-4 mr-2" /> Calculate Estimate
        </Button>
        {estimate !== null && (
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center animate-fade-in">
            <p className="text-sm text-muted-foreground">Estimated Monthly Cost</p>
            <p className="text-3xl font-bold text-primary">${estimate}/mo</p>
          </div>
        )}
      </div>
    </div>
  );
}
