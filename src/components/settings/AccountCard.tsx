import { Copy, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { AUTH_MESSAGES, SETTINGS_MESSAGES } from '@/ui/messages';

export function AccountCard() {
  const { user, signOut } = useAuth();

  const copyAccountId = async () => {
    if (!user) return;
    try {
      await navigator.clipboard.writeText(user.uid);
      toast.success(SETTINGS_MESSAGES.accountIdCopied);
    } catch {
      toast.error(SETTINGS_MESSAGES.accountIdCopyFailed);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>{SETTINGS_MESSAGES.accountTitle}</CardDescription>
        <CardTitle className="text-lg break-all">{user?.email}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{SETTINGS_MESSAGES.accountIdLabel}</span>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-xl bg-background px-3 py-2 text-sm">{user?.uid}</code>
            <Button variant="outline" size="icon" aria-label={SETTINGS_MESSAGES.copyAccountId} onClick={copyAccountId}>
              <Copy aria-hidden="true" />
            </Button>
          </div>
        </div>
        <Button variant="outline" onClick={signOut}>
          <LogOut aria-hidden="true" /> {AUTH_MESSAGES.signOut}
        </Button>
      </CardContent>
    </Card>
  );
}
