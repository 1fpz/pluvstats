function escapeCell(value) {
  const string = value === null || value === undefined ? '' : String(value)
  if (/[",\n;]/.test(string)) return `"${string.replace(/"/g, '""')}"`
  return string
}

export function toCsv(rows, columns) {
  const header = columns.map((column) => escapeCell(column.label)).join(';')
  const lines = rows.map((row) =>
    columns
      .map((column) => escapeCell(typeof column.value === 'function' ? column.value(row) : row[column.key]))
      .join(';'),
  )
  return [header, ...lines].join('\r\n')
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
