import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { COGNATE_SETS, LANGUAGE_FAMILIES, buildGraph } from '../mock/data'
import type { CognateSet } from '../types'
export { LANGUAGE_FAMILIES, COGNATE_SETS }

export interface CompareSnapshot {
  id: number
  label: string
  searchQuery: string
  family: string
  items: CognateSet[]
}

export const useEtymologyStore = defineStore('etymology', () => {
  const graph = ref(buildGraph())
  const selectedNode = ref<any>(null)
  const searchQuery = ref('')
  const selectedFamily = ref('all')

  const filteredCognates = computed(() =>
    COGNATE_SETS.filter(cs => {
      const q = searchQuery.value.toLowerCase()
      const matchSearch = !q || cs.root.toLowerCase().includes(q) || cs.meaning.includes(q) || Object.values(cs.languages).some((w: string) => w.toLowerCase().includes(q))
      const matchFamily = selectedFamily.value === 'all' || cs.family === selectedFamily.value
      return matchSearch && matchFamily
    })
  )

  // 比较清单：把每次筛选结果存成快照，集中对照差异
  const compareList = ref<CompareSnapshot[]>([])
  let compareSeq = 0

  function addToCompare(): 'added' | 'empty' | 'duplicate' {
    const items = filteredCognates.value
    if (!items.length) return 'empty'
    if (compareList.value.some(s => s.searchQuery === searchQuery.value && s.family === selectedFamily.value)) return 'duplicate'
    const familyName = selectedFamily.value === 'all' ? '全部语系' : (LANGUAGE_FAMILIES.find(f => f.id === selectedFamily.value)?.name ?? selectedFamily.value)
    const label = searchQuery.value ? `"${searchQuery.value}" · ${familyName}` : familyName
    compareList.value.push({ id: ++compareSeq, label, searchQuery: searchQuery.value, family: selectedFamily.value, items: [...items] })
    return 'added'
  }

  function removeFromCompare(id: number) {
    compareList.value = compareList.value.filter(s => s.id !== id)
  }

  function clearCompare() {
    compareList.value = []
  }

  // 差异矩阵：所有快照词根的并集 × 每个快照是否命中
  const compareDiff = computed(() => {
    const snaps = compareList.value
    const rootMap = new Map<string, { root: string; meaning: string; cells: (CognateSet | null)[] }>()
    snaps.forEach((s, i) => {
      s.items.forEach(cs => {
        let row = rootMap.get(cs.root)
        if (!row) {
          row = { root: cs.root, meaning: cs.meaning, cells: Array(snaps.length).fill(null) }
          rootMap.set(cs.root, row)
        }
        row.cells[i] = cs
      })
    })
    const rows = [...rootMap.values()].map(r => ({ ...r, inAll: r.cells.every(Boolean) }))
    const uniqueCounts = snaps.map((_, i) => rows.filter(r => r.cells[i] && r.cells.filter(Boolean).length === 1).length)
    return { rows, total: rows.length, common: rows.filter(r => r.inAll).length, uniqueCounts }
  })

  return { graph, selectedNode, searchQuery, selectedFamily, filteredCognates, compareList, addToCompare, removeFromCompare, clearCompare, compareDiff }
})
