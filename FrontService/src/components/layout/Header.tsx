import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TT</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">TaskTrack</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {user.userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-foreground">{user.userName}</span>
              <Badge 
                variant={user.roleType === 'Admin' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {user.roleType === 'Admin' ? (
                  <><Shield className="w-3 h-3 mr-1" />Admin</>
                ) : (
                  <><User className="w-3 h-3 mr-1" />User</>
                )}
              </Badge>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};