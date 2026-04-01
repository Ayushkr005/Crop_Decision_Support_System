import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  LogOut, 
  Shield, 
  Settings, 
  ChevronDown,
  Crown,
  Tractor
} from 'lucide-react';

const UserMenu = () => {
  const navigate = useNavigate();
  const { user, profile, role, isAdmin, signOut } = useAuth();

  if (!user) {
    return (
      <Button
        onClick={() => navigate('/auth')}
        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 transform hover:scale-105 shadow-md"
      >
        Sign In
      </Button>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() || 'U';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 px-2 hover:bg-primary/10 transition-all duration-300 group"
        >
          <Avatar className="h-8 w-8 border-2 border-primary/30 group-hover:border-primary transition-colors">
            <AvatarFallback className={`${isAdmin ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground' : 'bg-muted'} text-sm font-semibold`}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium">{profile?.full_name || 'User'}</span>
            <Badge 
              variant={isAdmin ? 'default' : 'secondary'} 
              className={`text-xs h-5 ${isAdmin ? 'bg-gradient-to-r from-primary to-accent' : ''}`}
            >
              {isAdmin && <Crown className="h-3 w-3 mr-1" />}
              {role || 'customer'}
            </Badge>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 animate-scale-in">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => navigate('/predict')}
          className="cursor-pointer hover:bg-primary/10 transition-colors"
        >
          <User className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => navigate('/farmer')}
          className="cursor-pointer hover:bg-primary/10 transition-colors"
        >
          <Tractor className="mr-2 h-4 w-4" />
          My Farm
        </DropdownMenuItem>

        {isAdmin && (
          <DropdownMenuItem 
            onClick={() => navigate('/admin')}
            className="cursor-pointer hover:bg-primary/10 transition-colors"
          >
            <Shield className="mr-2 h-4 w-4" />
            Admin Panel
          </DropdownMenuItem>
        )}

        <DropdownMenuItem 
          disabled
          className="cursor-not-allowed opacity-50"
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings (Coming Soon)
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
