import { createClient } from '@/lib/supabase/server'
import { getLocalToday } from '@/lib/utils'
import { NextRequest } from 'next/server'

const ALLOWED_ENTITIES = ['contacts', 'organizations', 'deals'] as const
type AllowedEntity = (typeof ALLOWED_ENTITIES)[number]

/**
 * Escapes a CSV field per RFC 4180.
 * Wraps in double-quotes if the field contains a comma, newline, or double-quote.
 * Doubles up internal double-quotes.
 */
function escapeCsvField(value: string | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Builds a CSV string from an array of row objects and a column definition.
 */
function toCSV(
  rows: Record<string, unknown>[],
  columns: { header: string; key: string }[]
): string {
  const header = columns.map((c) => escapeCsvField(c.header)).join(',')
  const dataRows = rows.map((row) =>
    columns.map((c) => escapeCsvField(row[c.key] as string | null | undefined)).join(',')
  )
  return [header, ...dataRows].join('\n')
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { entity } = await params

  if (!ALLOWED_ENTITIES.includes(entity as AllowedEntity)) {
    return new Response('Bad Request: entity must be one of contacts, organizations, deals', {
      status: 400,
    })
  }

  // ISO date for filename
  const today = getLocalToday()
  // UTF-8 BOM for Excel compatibility (handles Hebrew and other non-ASCII text)
  const BOM = '\uFEFF'

  let csv = ''

  if (entity === 'contacts') {
    const { data, error } = await supabase
      .from('contacts')
      .select('*, contact_organizations(organizations(name))')
      .is('deleted_at', null)
      .order('last_name')

    if (error) {
      console.error('Export contacts error:', error)
      return new Response('Internal Server Error', { status: 500 })
    }

    const rows = (data ?? []).map((row) => {
      const orgLinks = (row.contact_organizations ?? []) as {
        organizations: { name: string } | null
      }[]
      const orgNames = orgLinks
        .map((l) => l.organizations?.name)
        .filter(Boolean)
        .join(';')

      return {
        id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email ?? '',
        phone: row.phone ?? '',
        title: row.title ?? '',
        tags: (row.tags ?? []).join(';'),
        organizations: orgNames,
        notes: row.notes ?? '',
        created_at: row.created_at,
      }
    })

    const columns = [
      { header: 'ID', key: 'id' },
      { header: 'First Name', key: 'first_name' },
      { header: 'Last Name', key: 'last_name' },
      { header: 'Email', key: 'email' },
      { header: 'Phone', key: 'phone' },
      { header: 'Title', key: 'title' },
      { header: 'Tags', key: 'tags' },
      { header: 'Organizations', key: 'organizations' },
      { header: 'Notes', key: 'notes' },
      { header: 'Created At', key: 'created_at' },
    ]

    csv = BOM + toCSV(rows, columns)

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="contacts-${today}.csv"`,
      },
    })
  }

  if (entity === 'organizations') {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .is('deleted_at', null)
      .order('name')

    if (error) {
      console.error('Export organizations error:', error)
      return new Response('Internal Server Error', { status: 500 })
    }

    const rows = (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type ?? '',
      phone: row.phone ?? '',
      website: row.website ?? '',
      address: row.address ?? '',
      city: row.city ?? '',
      state: row.state ?? '',
      tags: (row.tags ?? []).join(';'),
      notes: row.notes ?? '',
      created_at: row.created_at,
    }))

    const columns = [
      { header: 'ID', key: 'id' },
      { header: 'Name', key: 'name' },
      { header: 'Type', key: 'type' },
      { header: 'Phone', key: 'phone' },
      { header: 'Website', key: 'website' },
      { header: 'Address', key: 'address' },
      { header: 'City', key: 'city' },
      { header: 'State', key: 'state' },
      { header: 'Tags', key: 'tags' },
      { header: 'Notes', key: 'notes' },
      { header: 'Created At', key: 'created_at' },
    ]

    csv = BOM + toCSV(rows, columns)

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="organizations-${today}.csv"`,
      },
    })
  }

  // entity === 'deals'
  const { data, error } = await supabase
    .from('deals')
    .select('*, pipeline_stages(name), organizations(name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Export deals error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }

  const rows = (data ?? []).map((row) => {
    const stage = row.pipeline_stages as { name: string } | null
    const org = row.organizations as { name: string } | null
    return {
      id: row.id,
      title: row.title,
      stage: stage?.name ?? '',
      value: row.value ?? '',
      currency: row.currency ?? 'USD',
      organization: org?.name ?? '',
      expected_close: row.expected_close ?? '',
      closed_at: row.closed_at ?? '',
      notes: row.notes ?? '',
      created_at: row.created_at,
    }
  })

  const columns = [
    { header: 'ID', key: 'id' },
    { header: 'Title', key: 'title' },
    { header: 'Stage', key: 'stage' },
    { header: 'Value', key: 'value' },
    { header: 'Currency', key: 'currency' },
    { header: 'Organization', key: 'organization' },
    { header: 'Expected Close', key: 'expected_close' },
    { header: 'Closed At', key: 'closed_at' },
    { header: 'Notes', key: 'notes' },
    { header: 'Created At', key: 'created_at' },
  ]

  csv = BOM + toCSV(rows, columns)

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="deals-${today}.csv"`,
    },
  })
}
