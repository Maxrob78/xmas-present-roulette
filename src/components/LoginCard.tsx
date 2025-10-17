import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface LoginCardProps {
  people: string[];
  onLogin: (name: string, password: string) => void;
}

const LoginCard = ({ people, onLogin }: LoginCardProps) => {
  const [selectedName, setSelectedName] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!selectedName) {
      alert('Choisissez un nom');
      return;
    }
    if (!password) {
      alert('Entrez le mot de passe');
      return;
    }
    onLogin(selectedName, password);
    setPassword('');
  };

  return (
    <Card className="bg-card/80 backdrop-blur-md border-border/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
      <div className="flex flex-wrap gap-3 items-center justify-center">
        <label className="text-foreground font-semibold">Nom :</label>
        <Select value={selectedName} onValueChange={setSelectedName}>
          <SelectTrigger className="w-[180px] bg-input/50 border-border/50">
            <SelectValue placeholder="Sélectionner..." />
          </SelectTrigger>
          <SelectContent>
            {people.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-[180px] bg-input/50 border-border/50"
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
        />
        <Button 
          onClick={handleLogin}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold hover:shadow-[0_0_25px_hsl(var(--christmas-gold)/0.5)] transition-all hover:scale-105"
        >
          Connexion
        </Button>
      </div>
    </Card>
  );
};

export default LoginCard;
