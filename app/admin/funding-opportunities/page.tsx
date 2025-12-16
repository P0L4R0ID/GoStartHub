'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit, DollarSign, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function FundingOpportunitiesPage() {
    const router = useRouter();
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amount: '',
        deadline: '',
        providerName: '',
        requirements: [''],
    });

    useEffect(() => {
        const session = storage.getSession();
        if (!session || session.role?.toLowerCase() !== 'admin') {
            router.push('/');
            return;
        }
        loadOpportunities();
    }, [router]);

    const loadOpportunities = () => {
        const opps = storage.getFundingOpportunities();
        setOpportunities(opps);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const opps = storage.getFundingOpportunities();
        const newOpp = {
            id: editingId || `fund${Date.now()}`,
            title: formData.title,
            description: formData.description,
            amount: parseInt(formData.amount),
            deadline: formData.deadline,
            providerName: formData.providerName,
            requirements: formData.requirements.filter(r => r.trim()),
            status: 'open' as const,
            applications: [],
            createdAt: new Date().toISOString(),
        };

        if (editingId) {
            const index = opps.findIndex(o => o.id === editingId);
            opps[index] = newOpp;
        } else {
            opps.push(newOpp);
        }

        storage.saveFundingOpportunities(opps);
        resetForm();
        loadOpportunities();
    };

    const handleDelete = (id: string) => {
        if (!confirm('Delete this funding opportunity?')) return;
        const opps = storage.getFundingOpportunities().filter(o => o.id !== id);
        storage.saveFundingOpportunities(opps);
        loadOpportunities();
    };

    const handleEdit = (opp: any) => {
        setEditingId(opp.id);
        setFormData({
            title: opp.title,
            description: opp.description,
            amount: opp.amount.toString(),
            deadline: opp.deadline,
            providerName: opp.providerName,
            requirements: opp.requirements.length > 0 ? opp.requirements : [''],
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            amount: '',
            deadline: '',
            providerName: '',
            requirements: [''],
        });
        setEditingId(null);
        setShowForm(false);
    };

    const addRequirement = () => {
        setFormData({ ...formData, requirements: [...formData.requirements, ''] });
    };

    const updateRequirement = (index: number, value: string) => {
        const newReqs = [...formData.requirements];
        newReqs[index] = value;
        setFormData({ ...formData, requirements: newReqs });
    };

    const removeRequirement = (index: number) => {
        setFormData({ ...formData, requirements: formData.requirements.filter((_, i) => i !== index) });
    };

    return (
        <div className="container mx-auto py-12 px-4 max-w-6xl">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin" className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Admin Dashboard
                </Link>
            </div>

            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Funding Opportunities</h1>
                        <p className="text-muted-foreground">Create and manage funding opportunities</p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)} className="rounded-full">
                        <Plus className="h-4 w-4 mr-2" />
                        {showForm ? 'Cancel' : 'New Opportunity'}
                    </Button>
                </div>
            </div>

            {showForm && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>{editingId ? 'Edit' : 'Create'} Funding Opportunity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Title *</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., MDEC Digital Startup Grant"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Provider Name *</Label>
                                    <Input
                                        value={formData.providerName}
                                        onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                                        placeholder="e.g., MDEC"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Funding Amount (RM) *</Label>
                                    <Input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="e.g., 50000"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Deadline *</Label>
                                    <Input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description *</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the funding opportunity..."
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Requirements</Label>
                                {formData.requirements.map((req, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={req}
                                            onChange={(e) => updateRequirement(index, e.target.value)}
                                            placeholder="e.g., Must be a registered company"
                                        />
                                        {formData.requirements.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => removeRequirement(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={addRequirement} className="w-full">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Requirement
                                </Button>
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                    {editingId ? 'Update' : 'Create'} Opportunity
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                {opportunities.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No funding opportunities yet. Create your first one!
                        </CardContent>
                    </Card>
                ) : (
                    opportunities.map((opp) => (
                        <Card key={opp.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-xl mb-2">{opp.title}</CardTitle>
                                        <CardDescription>{opp.description}</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(opp)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(opp.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Amount</p>
                                            <p className="font-semibold">RM {opp.amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Deadline</p>
                                            <p className="font-semibold">{new Date(opp.deadline).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Provider</p>
                                        <p className="font-semibold">{opp.providerName}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold mb-2">Requirements:</p>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        {opp.requirements.map((req: string, idx: number) => (
                                            <li key={idx}>{req}</li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
