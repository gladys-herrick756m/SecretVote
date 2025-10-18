import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'react-router-dom';
import { Vote, Plus, Shield } from 'lucide-react';

export function Header() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Vote className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SecretVote</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label="Main navigation">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/') ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                Proposals
              </Link>
              <Link
                to="/create"
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/create') ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                <Plus className="h-4 w-4" />
                Create
              </Link>
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/admin') ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            </nav>
          </div>
          
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
