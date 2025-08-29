import React from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InventorInfo } from '@/types/patent';

interface InventorInformationFormProps {
  inventors: InventorInfo[];
  onInventorsChange: (inventors: InventorInfo[]) => void;
}

const InventorInformationForm = ({ inventors, onInventorsChange }: InventorInformationFormProps) => {
  const addInventor = () => {
    const newInventor: InventorInfo = {
      id: `inventor-${Date.now()}`,
      firstName: '',
      lastName: '',
      address: '',
      citizenship: 'US',
      inventorshipDeclaration: false
    };
    onInventorsChange([...inventors, newInventor]);
  };

  const removeInventor = (id: string) => {
    onInventorsChange(inventors.filter(inv => inv.id !== id));
  };

  const updateInventor = (id: string, field: keyof InventorInfo, value: string | boolean) => {
    onInventorsChange(inventors.map(inv => 
      inv.id === id ? { ...inv, [field]: value } : inv
    ));
  };

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' },
    { code: 'IN', name: 'India' },
    { code: 'AU', name: 'Australia' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Inventor Information
        </CardTitle>
        <CardDescription>
          Add all inventors for this patent application. Each inventor must provide a declaration of inventorship.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {inventors.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No inventors added yet. Click "Add Inventor" to get started.</p>
          </div>
        )}

        {inventors.map((inventor, index) => (
          <Card key={inventor.id} className="border-l-4 border-l-primary">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Inventor {index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInventor(inventor.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`firstName-${inventor.id}`}>First Name *</Label>
                  <Input
                    id={`firstName-${inventor.id}`}
                    value={inventor.firstName}
                    onChange={(e) => updateInventor(inventor.id, 'firstName', e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`lastName-${inventor.id}`}>Last Name *</Label>
                  <Input
                    id={`lastName-${inventor.id}`}
                    value={inventor.lastName}
                    onChange={(e) => updateInventor(inventor.id, 'lastName', e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`address-${inventor.id}`}>Full Address *</Label>
                <Input
                  id={`address-${inventor.id}`}
                  value={inventor.address}
                  onChange={(e) => updateInventor(inventor.id, 'address', e.target.value)}
                  placeholder="Street address, city, state/province, postal code"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`citizenship-${inventor.id}`}>Citizenship *</Label>
                <Select 
                  value={inventor.citizenship} 
                  onValueChange={(value) => updateInventor(inventor.id, 'citizenship', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select citizenship" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`declaration-${inventor.id}`}
                  checked={inventor.inventorshipDeclaration}
                  onCheckedChange={(checked) => 
                    updateInventor(inventor.id, 'inventorshipDeclaration', checked as boolean)
                  }
                />
                <Label htmlFor={`declaration-${inventor.id}`} className="text-sm">
                  I declare that I am an inventor of the subject matter disclosed and claimed in this application
                </Label>
              </div>

              {!inventor.inventorshipDeclaration && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Inventorship declaration is required for USPTO filing
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <Button onClick={addInventor} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Inventor
        </Button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">USPTO Requirements</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• All inventors must be named in the application</li>
            <li>• Each inventor must sign an inventorship declaration</li>
            <li>• Joint inventors need not make the same type or amount of contribution</li>
            <li>• Correcting inventorship after filing requires additional fees</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventorInformationForm;