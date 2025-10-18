import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, TrendingUp, Shield } from 'lucide-react';
import { toast } from 'sonner';

const Admin = () => {
  const [address, setAddress] = useState('');

  const handleGrantRole = (role: string) => {
    if (!address) {
      toast.error('Please enter an address');
      return;
    }
    toast.success(`${role} role granted to ${address.slice(0, 10)}...`);
    setAddress('');
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage roles, proposals, and view statistics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Proposals</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Votes</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Voters</p>
                <p className="text-2xl font-bold">456</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Participation</p>
                <p className="text-2xl font-bold">78%</p>
              </div>
              <Shield className="h-8 w-8 text-warning" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="roles">
          <TabsList className="mb-6">
            <TabsTrigger value="roles">Role Management</TabsTrigger>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
          </TabsList>

          <TabsContent value="roles">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Grant Roles</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Wallet Address</Label>
                  <Input
                    id="address"
                    placeholder="0x..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => handleGrantRole('Voter')}>
                    Grant Voter Role
                  </Button>
                  <Button onClick={() => handleGrantRole('Proposer')} variant="secondary">
                    Grant Proposer Role
                  </Button>
                  <Button onClick={() => handleGrantRole('Admin')} variant="destructive">
                    Grant Admin Role
                  </Button>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Role Holders</h3>
                <div className="space-y-3">
                  {[
                    { address: '0x1234...5678', roles: ['Admin', 'Proposer', 'Voter'] },
                    { address: '0x2345...6789', roles: ['Proposer', 'Voter'] },
                    { address: '0x3456...7890', roles: ['Voter'] },
                  ].map((holder, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border rounded-lg">
                      <span className="font-mono text-sm break-all">{holder.address}</span>
                      <div className="flex flex-wrap gap-2">
                        {holder.roles.map(role => (
                          <Badge key={role} variant={role === 'Admin' ? 'destructive' : 'default'}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="proposals">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Manage Proposals</h2>
              <div className="space-y-4">
                {[
                  { id: 1, title: 'Increase Block Gas Limit to 30M', status: 'Active' },
                  { id: 2, title: 'Treasury Allocation for Marketing', status: 'Active' },
                  { id: 3, title: 'Implement EIP-4844 Support', status: 'Ended' },
                ].map(proposal => (
                  <div key={proposal.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium">{proposal.title}</h4>
                      <Badge variant={proposal.status === 'Active' ? 'default' : 'secondary'} className="mt-1">
                        {proposal.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        Request Decryption
                      </Button>
                      <Button variant="destructive" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
