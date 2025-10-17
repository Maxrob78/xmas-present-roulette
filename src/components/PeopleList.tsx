import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Person {
  id: string;
  available: boolean;
  assignedTo: string | null;
}

interface PeopleListProps {
  people: Record<string, Person>;
  currentUserId: string | null;
}

const PeopleList = ({ people, currentUserId }: PeopleListProps) => {
  const sortedPeople = Object.entries(people).sort(([a], [b]) => a.localeCompare(b));

  return (
    <Card className="w-full max-w-md bg-card/40 backdrop-blur-md border-border/30 p-4 max-h-[350px] overflow-y-auto">
      <h3 className="text-lg font-bold mb-3 text-foreground">🎄 Participants</h3>
      <div className="space-y-2">
        {sortedPeople.map(([id, person]) => (
          <div
            key={id}
            className="flex justify-between items-center p-3 rounded-lg bg-background/30 border border-border/20"
          >
            <span className="font-medium text-foreground">{id}</span>
            {person.available ? (
              <Badge className="bg-secondary/80 text-secondary-foreground hover:bg-secondary">
                ✓ Disponible
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-destructive/80">
                {id === currentUserId 
                  ? `Vous → ${person.assignedTo}`
                  : '✗ Attribué'}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PeopleList;
