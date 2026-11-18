import { Calculator } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { PATHS } from '@/app/paths';
import { PageHeader } from '@/components/PageHeader';
import { AccountCard } from '@/components/settings/AccountCard';
import { BusinessSettingsCard } from '@/components/settings/BusinessSettingsCard';
import { CatalogSection } from '@/components/settings/CatalogSection';
import { ProductSheet } from '@/components/settings/ProductSheet';
import { ServiceSheet } from '@/components/settings/ServiceSheet';
import { Button } from '@/components/ui/button';
import type { Product, Service } from '@/domain/schemas';
import { useProducts, useServices } from '@/hooks/useCatalog';
import { formatCurrency } from '@/ui/format';
import { PAGE_TITLES, SETTINGS_MESSAGES } from '@/ui/messages';

type Editing = { kind: 'service'; service: Service | null } | { kind: 'product'; product: Product | null } | null;

const getNextSortOrder = (items: { sortOrder: number }[]) =>
  items.reduce((highest, item) => Math.max(highest, item.sortOrder + 1), 0);

export function SettingsPage() {
  const services = useServices();
  const products = useProducts();
  const [editing, setEditing] = useState<Editing>(null);
  const closeEditor = () => setEditing(null);

  return (
    <>
      <PageHeader title={PAGE_TITLES.settings} />

      <CatalogSection
        title={SETTINGS_MESSAGES.servicesTitle}
        addLabel={SETTINGS_MESSAGES.addService}
        emptyMessage={SETTINGS_MESSAGES.emptyServices}
        rows={services.data.map((service) => ({
          id: service.id,
          name: service.name,
          detail: formatCurrency(service.priceCents),
          isActive: service.isActive,
        }))}
        isLoading={services.isLoading}
        error={services.error}
        onAdd={() => setEditing({ kind: 'service', service: null })}
        onSelect={(id) =>
          setEditing({ kind: 'service', service: services.data.find((item) => item.id === id) ?? null })
        }
      />

      <CatalogSection
        title={SETTINGS_MESSAGES.productsTitle}
        addLabel={SETTINGS_MESSAGES.addProduct}
        emptyMessage={SETTINGS_MESSAGES.emptyProducts}
        rows={products.data.map((product) => ({
          id: product.id,
          name: product.name,
          detail: `${formatCurrency(product.salePriceCents)} · ${SETTINGS_MESSAGES.stockCount(product.quantity)}`,
          isActive: product.isActive,
        }))}
        isLoading={products.isLoading}
        error={products.error}
        onAdd={() => setEditing({ kind: 'product', product: null })}
        onSelect={(id) =>
          setEditing({ kind: 'product', product: products.data.find((item) => item.id === id) ?? null })
        }
      />

      <BusinessSettingsCard />

      <section aria-labelledby="tools-title" className="flex flex-col gap-3">
        <h2 id="tools-title" className="text-xl font-semibold">
          {SETTINGS_MESSAGES.toolsTitle}
        </h2>
        <Button asChild variant="outline" size="lg">
          <Link to={PATHS.importPricing}>
            <Calculator aria-hidden="true" /> {PAGE_TITLES.importPricing}
          </Link>
        </Button>
      </section>

      <AccountCard />

      {editing?.kind === 'service' && (
        <ServiceSheet
          key={editing.service?.id ?? 'new'}
          service={editing.service}
          nextSortOrder={getNextSortOrder(services.data)}
          onClose={closeEditor}
        />
      )}
      {editing?.kind === 'product' && (
        <ProductSheet
          key={editing.product?.id ?? 'new'}
          product={editing.product}
          nextSortOrder={getNextSortOrder(products.data)}
          onClose={closeEditor}
        />
      )}
    </>
  );
}
