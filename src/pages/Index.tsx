import { useState, useEffect, useRef } from 'react';
import { collection, doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import Snowfall from '@/components/Snowfall';
import ChristmasWheel, { ChristmasWheelRef } from '@/components/ChristmasWheel';
import LoginCard from '@/components/LoginCard';
import PeopleList from '@/components/PeopleList';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Person {
  id: string;
  available: boolean;
  assignedTo: string | null;
  password?: string | null;
}

const Index = () => {
  const [people, setPeople] = useState<Record<string, Person>>({});
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelRef = useRef<ChristmasWheelRef>(null);

  useEffect(() => {
    const peopleCol = collection(db, 'people');
    const unsubscribe = onSnapshot(peopleCol, (snapshot) => {
      const peopleData: Record<string, Person> = {};
      snapshot.docs.forEach((d) => {
        peopleData[d.id] = { id: d.id, ...d.data() } as Person;
      });
      setPeople(peopleData);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (name: string, password: string) => {
    try {
      const ref = doc(db, 'people', name);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          available: true,
          assignedTo: null,
          password: password
        });
        setCurrentUser(name);
        toast.success('🎄 Compte créé avec succès !');
      } else {
        const data = snap.data();
        if (data.password === null) {
          await updateDoc(ref, { password: password });
          setCurrentUser(name);
          toast.success('🎁 Mot de passe enregistré !');
        } else if (data.password !== password) {
          toast.error('❌ Mot de passe incorrect !');
          return;
        } else {
          setCurrentUser(name);
          toast.success(`✨ Bienvenue ${name} !`);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur de connexion');
    }
  };

  const handleSpin = async () => {
    if (!currentUser) {
      toast.error('Connectez-vous d\'abord !');
      return;
    }

    const pool = Object.entries(people)
      .filter(([id, p]) => p.available && id !== currentUser)
      .map(([id]) => id);

    if (pool.length === 0) {
      toast.error('Personne n\'est disponible !');
      return;
    }

    setIsSpinning(true);
    const picked = pool[Math.floor(Math.random() * pool.length)];

    // Trigger wheel spin animation
    if (wheelRef.current) {
      wheelRef.current.spin(picked);
    }

    setTimeout(async () => {
      try {
        const targetRef = doc(db, 'people', picked);
        const meRef = doc(db, 'people', currentUser);
        
        await updateDoc(targetRef, {
          available: false,
          assignedTo: currentUser
        });
        
        await updateDoc(meRef, {
          assignedTo: picked
        });

        setResult(picked);
        toast.success(`🎁 Vous avez tiré : ${picked} !`, {
          duration: 5000,
        });
      } catch (error) {
        console.error(error);
        toast.error('Erreur lors du tirage');
      } finally {
        setIsSpinning(false);
      }
    }, 4200);
  };

  const currentPerson = currentUser ? people[currentUser] : null;
  const hasDrawn = currentPerson?.assignedTo !== null && currentPerson?.assignedTo !== undefined;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Snowfall />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8 animate-in fade-in duration-1000">
          <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent drop-shadow-lg">
            🎄 Roulette de Noël 🎁
          </h1>
          <p className="text-muted-foreground text-lg">Qui sera votre Père Noël secret ?</p>
        </header>

        {/* Login */}
        <div className="flex justify-center mb-8 animate-in slide-in-from-top duration-700">
          <LoginCard 
            people={Object.keys(people).sort()} 
            onLogin={handleLogin}
          />
        </div>

        {/* Status Card */}
        {currentUser && (
          <div className="flex justify-center mb-6 animate-in slide-in-from-bottom duration-700">
            <Card className="bg-card/60 backdrop-blur-md border-border/50 p-6 shadow-lg max-w-md w-full">
              <div className="text-center space-y-2">
                <p className="text-lg">
                  🎅 Connecté en tant que <span className="font-bold text-primary">{currentUser}</span>
                </p>
                {hasDrawn ? (
                  <p className="text-xl font-bold">
                    Vous avez tiré : <span className="text-secondary">{currentPerson.assignedTo}</span> 🎁
                  </p>
                ) : (
                  <p className="text-muted-foreground">En attente de tirage...</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Wheel and Spin */}
        {currentUser && (
          <div className="flex flex-col items-center gap-6 mb-8 animate-in zoom-in duration-1000">
            <ChristmasWheel
              ref={wheelRef}
              people={people}
              currentUser={currentUser}
              onResult={setResult}
            />
            
            <Button
              onClick={handleSpin}
              disabled={isSpinning || hasDrawn}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent text-white font-bold text-lg px-8 py-6 rounded-full hover:shadow-[0_0_30px_hsl(var(--christmas-gold)/0.6)] transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSpinning ? '🎡 En rotation...' : hasDrawn ? '✓ Tirage effectué' : '🎡 Lancer la roulette'}
            </Button>

            {result && !isSpinning && (
              <div className="text-center animate-in zoom-in duration-500">
                <p className="text-3xl font-bold text-accent drop-shadow-lg">
                  🌟 {result} 🌟
                </p>
              </div>
            )}
          </div>
        )}

        {/* People List */}
        {currentUser && (
          <div className="flex justify-center animate-in slide-in-from-bottom duration-1000 delay-300">
            <PeopleList people={people} currentUserId={currentUser} />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-12 text-sm text-muted-foreground">
          <p>⚙️ Connecté à Firebase : roulette-372ab</p>
          <p className="mt-2">✨ Joyeux Noël ! 🎅</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
