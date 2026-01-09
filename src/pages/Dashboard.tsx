import { useQuery } from '@tanstack/react-query';
import { Users, Briefcase, FileText, DollarSign } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { clientsApi, gigsApi, invoicesApi, type Gig, type Invoice } from '@/lib/api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsApi.getAll,
  });

  const { data: gigs = [] } = useQuery({
    queryKey: ['gigs'],
    queryFn: gigsApi.getAll,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: invoicesApi.getAll,
  });

  const activeGigs = gigs.filter((g: Gig) => g.status === 'active');
  const pendingInvoices = invoices.filter((i: Invoice) => i.status === 'sent' || i.status === 'overdue');
  const totalRevenue = invoices
    .filter((i: Invoice) => i.status === 'paid')
    .reduce((sum: number, i: Invoice) => sum + (i.amount || 0), 0);

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        description="Overview of your freelance business"
      />

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Clients"
          value={clients.length}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Active Gigs"
          value={activeGigs.length}
          icon={<Briefcase className="h-5 w-5" />}
        />
        <StatCard
          title="Pending Invoices"
          value={pendingInvoices.length}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Gigs */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-card-foreground">Recent Gigs</h2>
            <Link to="/gigs" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {gigs.slice(0, 5).map((gig: Gig) => (
              <div key={gig.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-card-foreground">{gig.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {gig.rate ? `$${gig.rate}/hr` : 'Rate TBD'}
                  </p>
                </div>
                <StatusBadge status={gig.status} />
              </div>
            ))}
            {gigs.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No gigs yet. <Link to="/gigs" className="text-primary hover:underline">Create your first gig</Link>
              </p>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-card-foreground">Recent Invoices</h2>
            <Link to="/invoices" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {invoices.slice(0, 5).map((invoice: Invoice) => (
              <div key={invoice.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-card-foreground">Invoice #{invoice.id}</p>
                  <p className="text-sm text-muted-foreground">
                    ${invoice.amount?.toLocaleString() || 0}
                  </p>
                </div>
                <StatusBadge status={invoice.status} />
              </div>
            ))}
            {invoices.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No invoices yet. <Link to="/invoices" className="text-primary hover:underline">Create your first invoice</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
