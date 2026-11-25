import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { AUTH_MESSAGES, SETTINGS_MESSAGES } from '@/ui/messages';

export function AccountCard() {
  const { user, signOut } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardDescription>{SETTINGS_MESSAGES.accountTitle}</CardDescription>
        <CardTitle className="text-lg break-all">{user?.email}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        <Button variant="outline" onClick={signOut}>
          <LogOut aria-hidden="true" /> {AUTH_MESSAGES.signOut}
        </Button>
      </CardContent>
    </Card>
  );
}
