'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Upload, Edit, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { Pencil } from "lucide-react";
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

function PaginationControls({
    page,
    totalPages,
    onChange,
    totalItems,
    pageSize,
}: {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
    totalItems: number;
    pageSize: number;
}) {
    if (totalItems === 0) return null;

    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalItems);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-4 border-t">
            <p className="text-sm text-gray-500">
                Mostrando {from}–{to} de {totalItems}
            </p>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => onChange(page - 1)}
                >
                    Anterior
                </Button>
                <span className="text-sm font-medium px-2">
                    {page} / {totalPages}
                </span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => onChange(page + 1)}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
}