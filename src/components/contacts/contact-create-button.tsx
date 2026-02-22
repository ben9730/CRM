'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ContactForm } from './contact-form'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'

interface ContactCreateButtonProps {
  organizations: { id: string; name: string }[]
}

export function ContactCreateButton({ organizations }: ContactCreateButtonProps) {
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
        <UserPlus className="h-3.5 w-3.5" />
        Add Contact
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[540px] overflow-y-auto border-l border-white/6"
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
              Add Contact
            </SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6">
            <ContactForm
              organizations={organizations}
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
