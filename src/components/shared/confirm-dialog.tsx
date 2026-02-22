'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[400px] border border-white/8"
        style={{ background: 'oklch(0.12 0.005 280)' }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px rounded-t-lg"
          style={{
            background:
              'linear-gradient(90deg, transparent, oklch(0.55 0.22 25 / 50%), transparent)',
          }}
        />

        <DialogHeader>
          <DialogTitle className="text-foreground/95">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground/70 text-sm leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-border/40 bg-transparent hover:bg-white/5 hover:border-border/60"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className="gap-1.5"
            style={{
              background: 'oklch(0.45 0.20 25)',
              color: 'white',
              border: '1px solid oklch(0.45 0.20 25 / 60%)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.50 0.22 25)'
              }
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.45 0.20 25)'
            }}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
