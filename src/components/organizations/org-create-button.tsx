'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OrgForm } from './org-form'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function OrgCreateButton() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <Button
        size="sm"
        className="gap-1.5 font-medium"
        onClick={() => setOpen(true)}
        style={{
          background: 'linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.50 0.25 300))',
          boxShadow: '0 0 16px -4px oklch(0.65 0.24 280 / 25%)',
          border: '1px solid oklch(0.65 0.24 280 / 20%)',
        }}
      >
        <Plus className="h-3.5 w-3.5" />
        New Organization
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[520px] overflow-y-auto border-l border-white/6"
          style={{ background: 'oklch(0.10 0.003 280)' }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, oklch(0.65 0.24 280 / 50%), transparent)',
            }}
          />
          <SheetHeader className="px-6 pt-8 pb-6">
            <SheetTitle className="text-lg font-bold text-gradient-violet">
              New Organization
            </SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6">
            <OrgForm
              onSuccess={() => {
                setOpen(false)
                router.refresh()
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
