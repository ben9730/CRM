'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExportButtonProps {
  entity: 'contacts' | 'organizations' | 'deals'
}

export function ExportButton({ entity }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    if (loading) return
    setLoading(true)
    try {
      const response = await fetch(`/api/export/${entity}`)
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // Use the filename from Content-Disposition if available; otherwise fall back
      const disposition = response.headers.get('Content-Disposition') ?? ''
      const match = disposition.match(/filename="([^"]+)"/)
      a.download = match ? match[1] : `${entity}-export.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      className="gap-1.5"
    >
      <Download className="h-3.5 w-3.5" />
      {loading ? 'Exporting...' : 'Export CSV'}
    </Button>
  )
}
