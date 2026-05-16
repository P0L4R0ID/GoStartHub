'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, FileText, ExternalLink, Building2, User, Mail, Linkedin, Globe } from 'lucide-react';
import { Startup } from '@prisma/client';

interface StartupDetailModalProps {
    startup: Startup | null;
    isOpen: boolean;
    onClose: () => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export function StartupDetailModal({ startup, isOpen, onClose, onApprove, onReject }: StartupDetailModalProps) {
    if (!startup) return null;

    const teamMembers = JSON.parse(startup.teamMembers) as Array<{ name: string; role: string }>;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl">{startup.title}</DialogTitle>
                        <Badge
                            variant={startup.status === 'APPROVED' ? 'default' : startup.status === 'REJECTED' ? 'destructive' : 'secondary'}
                            className={startup.status === 'APPROVED' ? 'bg-green-500' : startup.status === 'PENDING' ? 'bg-yellow-500 text-white' : ''}
                        >
                            {startup.status}
                        </Badge>
                    </div>
                    <DialogDescription className="text-base mt-2">
                        {startup.category} • {startup.stage} • {startup.projectType}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6">
                    <div className="space-y-6 pb-6">
                        {/* Description */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                            <p className="text-sm leading-relaxed">{startup.description}</p>
                        </div>

                        <Separator />

                        {/* Organization & Contact */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-3">Organization</h4>
                                <div className="space-y-2">
                                    {startup.companyName && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <span>{startup.companyName}</span>
                                        </div>
                                    )}
                                    {startup.university && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <span>{startup.university}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-3">Contact</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <a href={`mailto:${startup.contactEmail}`} className="hover:underline text-blue-600">{startup.contactEmail}</a>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Linkedin className="h-4 w-4 text-muted-foreground" />
                                        <a href={startup.contactLinkedIn} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">LinkedIn Profile</a>
                                    </div>
                                    {startup.contactWebsite && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <a href={startup.contactWebsite} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">Website</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Team */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Team Members</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {teamMembers.map((member, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{member.name}</p>
                                            <p className="text-xs text-muted-foreground">{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Documents & Milestones */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Pitch Deck</h4>
                                <Button variant="outline" className="w-full sm:w-auto" asChild>
                                    <a href={startup.pitchDeck} target="_blank" rel="noopener noreferrer">
                                        <FileText className="h-4 w-4 mr-2" />
                                        View Pitch Deck (PDF)
                                        <ExternalLink className="h-3 w-3 ml-2" />
                                    </a>
                                </Button>
                            </div>

                            {startup.milestones && (
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Milestones & Updates</h4>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{startup.milestones}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 pt-2 border-t bg-gray-50">
                    <div className="flex justify-end gap-2 w-full">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                        {startup.status === 'PENDING' && (
                            <>
                                <Button
                                    variant="destructive"
                                    onClick={() => onReject(startup.id)}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                                <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => onApprove(startup.id)}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                </Button>
                            </>
                        )}
                        {startup.status === 'REJECTED' && (
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => onApprove(startup.id)}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                        )}
                        {startup.status === 'APPROVED' && (
                            <Button
                                variant="destructive"
                                onClick={() => onReject(startup.id)}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
