import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreHorizontal, Calendar, FileText } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { invoicesApi, gigsApi, clientsApi, type Invoice, type Gig, type Client } from '@/lib/api';
import { toast } from 'sonner';

export default function Invoices() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: invoicesApi.getAll,
  });

  const { data: gigs = [] } = useQuery({
    queryKey: ['gigs'],
    queryFn: gigsApi.getAll,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: invoicesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsDialogOpen(false);
      toast.success('Invoice created successfully');
    },
    onError: () => toast.error('Failed to create invoice'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Invoice> }) =>
      invoicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsDialogOpen(false);
      setEditingInvoice(null);
      toast.success('Invoice updated successfully');
    },
    onError: () => toast.error('Failed to update invoice'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const gigId = parseInt(formData.get('gig_id') as string);
    const selectedGig = gigs.find((g: Gig) => g.id === gigId);
    
    const data = {
      gig_id: gigId,
      client_id: selectedGig?.client_id || 0,
      amount: parseFloat(formData.get('amount') as string),
      status: (formData.get('status') as Invoice['status']) || 'draft',
      due_date: formData.get('due_date') as string || undefined,
    };

    if (editingInvoice) {
      updateMutation.mutate({ id: editingInvoice.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleStatusChange = (invoice: Invoice, status: Invoice['status']) => {
    updateMutation.mutate({ id: invoice.id, data: { status } });
  };

  const getGigTitle = (gigId: number) => {
    const gig = gigs.find((g: Gig) => g.id === gigId);
    return gig?.title || 'Unknown Gig';
  };

  const getClientName = (clientId: number) => {
    const client = clients.find((c: Client) => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Invoices"
        description="Track payments and billing"
        action={
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingInvoice(null);
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingInvoice ? 'Edit Invoice' : 'New Invoice'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gig_id">Gig *</Label>
                  <Select name="gig_id" defaultValue={editingInvoice?.gig_id?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a gig" />
                    </SelectTrigger>
                    <SelectContent>
                      {gigs.map((gig: Gig) => (
                        <SelectItem key={gig.id} value={gig.id.toString()}>
                          {gig.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($) *</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingInvoice?.amount}
                    placeholder="1500.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    name="due_date"
                    type="date"
                    defaultValue={editingInvoice?.due_date?.split('T')[0]}
                  />
                </div>
                {editingInvoice && (
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editingInvoice.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingInvoice ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-card-foreground">No invoices yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first invoice to start tracking payments.
          </p>
          <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Invoice</TableHead>
                <TableHead className="font-semibold">Client</TableHead>
                <TableHead className="font-semibold">Gig</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Due Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice: Invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">#{invoice.id}</TableCell>
                  <TableCell>{getClientName(invoice.client_id)}</TableCell>
                  <TableCell>{getGigTitle(invoice.gig_id)}</TableCell>
                  <TableCell className="font-medium">${invoice.amount?.toLocaleString()}</TableCell>
                  <TableCell>
                    {invoice.due_date ? (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingInvoice(invoice);
                          setIsDialogOpen(true);
                        }}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusChange(invoice, 'draft')}>
                          Mark as Draft
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(invoice, 'sent')}>
                          Mark as Sent
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(invoice, 'paid')}>
                          Mark as Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(invoice, 'overdue')}>
                          Mark as Overdue
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardLayout>
  );
}
