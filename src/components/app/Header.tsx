import { Zap } from 'lucide-react'; // Or any other suitable icon

export function Header() {
  return (
    <header className="py-6 bg-primary/10 shadow-md">
      <div className="container mx-auto flex items-center justify-center">
        <Zap className="h-10 w-10 mr-3 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          Day Weaver
        </h1>
      </div>
    </header>
  );
}
