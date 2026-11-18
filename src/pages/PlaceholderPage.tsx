import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { MESSAGES } from '@/ui/messages';

type PlaceholderPageProps = { title: string; hasBackButton?: boolean };

/** Tela ainda não construída; cada uma é substituída no seu card. */
export function PlaceholderPage({ title, hasBackButton }: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} hasBackButton={hasBackButton} />
      <Card>
        <CardContent>
          <p className="text-muted-foreground">{MESSAGES.underConstruction}</p>
        </CardContent>
      </Card>
    </>
  );
}
