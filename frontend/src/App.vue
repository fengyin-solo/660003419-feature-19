<template>
  <div class="min-h-screen bg-slate-900 text-slate-200">
    <header class="border-b border-slate-700 px-6 py-4">
      <h1 class="text-2xl font-bold text-cyan-400">语言词源图谱与多语系演化追踪</h1>
      <p class="text-sm text-slate-500 mt-1">D3.js力导向图 · 印欧语系演化 · 同源词对照 · 500+词根</p>
    </header>
    <div class="p-4 space-y-4">
      <div class="grid lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-slate-400">词源力导向网络</h3>
            <div class="flex gap-3 text-xs">
              <span v-for="f in LANGUAGE_FAMILIES" :key="f.id" class="flex items-center gap-1">
                <span class="w-3 h-3 rounded-full" :style="{backgroundColor: f.color}"></span>{{ f.name }}
              </span>
            </div>
          </div>
          <svg ref="svgRef" class="w-full bg-slate-900 rounded" style="height:460px"></svg>
        </div>
        <div class="space-y-4">
          <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 class="text-sm font-bold text-slate-400 mb-3">语系概览</h3>
            <div class="space-y-2">
              <div v-for="f in LANGUAGE_FAMILIES" :key="f.id" class="flex items-start gap-2 text-sm">
                <span class="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" :style="{backgroundColor: f.color}"></span>
                <div><div class="font-bold">{{ f.name }}</div><div class="text-xs text-slate-500">{{ f.era }} · {{ f.languages.join('/') }}</div></div>
              </div>
            </div>
          </div>
          <div v-if="store.selectedNode" class="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 class="text-sm font-bold text-slate-400 mb-2">选中节点</h3>
            <div class="text-lg font-bold text-cyan-400">{{ store.selectedNode.word }}</div>
            <div class="text-sm text-slate-400">{{ store.selectedNode.language }} — {{ store.selectedNode.meaning }}</div>
          </div>
          <div class="bg-slate-800 rounded-lg p-4 border border-slate-700 text-xs text-slate-400">
            <h3 class="text-sm font-bold text-slate-400 mb-2">Grimm定律</h3>
            <div class="space-y-1">
              <div class="bg-slate-900 rounded p-2"><span class="text-cyan-400">p→f: </span>pater → father</div>
              <div class="bg-slate-900 rounded p-2"><span class="text-green-400">t→θ: </span>tres → three</div>
              <div class="bg-slate-900 rounded p-2"><span class="text-orange-400">k→h: </span>cord → heart</div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-sm font-bold text-slate-400 mb-3">同源词对照表</h3>
        <div class="flex gap-2 mb-3">
          <input v-model="store.searchQuery" placeholder="搜索词根/含义..." class="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-500" />
          <select v-model="store.selectedFamily" class="bg-slate-900 border border-slate-600 rounded px-2 text-sm text-slate-300">
            <option value="all">全部语系</option>
            <option v-for="f in LANGUAGE_FAMILIES" :key="f.id" :value="f.id">{{ f.name }}</option>
          </select>
          <button @click="onAddToCompare" :disabled="!store.filteredCognates.length"
            class="px-3 py-1.5 text-sm rounded bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white whitespace-nowrap">
            加入比较清单 ({{ store.filteredCognates.length }})
          </button>
          <span v-if="compareHint" class="self-center text-xs whitespace-nowrap" :class="compareHintOk ? 'text-green-400' : 'text-amber-400'">{{ compareHint }}</span>
        </div>
        <div class="overflow-x-auto max-h-64 overflow-y-auto">
          <table class="w-full text-xs">
            <thead class="sticky top-0 bg-slate-700">
              <tr>
                <th class="px-2 py-2 text-left text-slate-300">词根</th>
                <th class="px-2 py-2 text-left text-slate-300">含义</th>
                <th class="px-2 py-2 text-left text-cyan-400">英语</th>
                <th class="px-2 py-2 text-left text-blue-400">法语</th>
                <th class="px-2 py-2 text-left text-green-400">德语</th>
                <th class="px-2 py-2 text-left text-orange-400">西班牙语</th>
                <th class="px-2 py-2 text-left text-purple-400">俄语</th>
                <th class="px-2 py-2 text-left text-yellow-400">拉丁语</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cs in store.filteredCognates" :key="cs.root" class="border-t border-slate-700 hover:bg-slate-700">
                <td class="px-2 py-1.5 font-mono text-slate-200 font-bold">{{ cs.root }}</td>
                <td class="px-2 py-1.5 text-slate-400">{{ cs.meaning }}</td>
                <td class="px-2 py-1.5 font-mono text-cyan-300">{{ cs.languages['英语'] || '—' }}</td>
                <td class="px-2 py-1.5 font-mono text-blue-300">{{ cs.languages['法语'] || '—' }}</td>
                <td class="px-2 py-1.5 font-mono text-green-300">{{ cs.languages['德语'] || '—' }}</td>
                <td class="px-2 py-1.5 font-mono text-orange-300">{{ cs.languages['西班牙语'] || '—' }}</td>
                <td class="px-2 py-1.5 font-mono text-purple-300">{{ cs.languages['俄语'] || '—' }}</td>
                <td class="px-2 py-1.5 font-mono text-yellow-300">{{ cs.languages['拉丁语'] || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="store.compareList.length" class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-bold text-slate-400">比较清单 · 差异对照</h3>
          <button @click="store.clearCompare()" class="text-xs text-slate-500 hover:text-red-400">清空清单</button>
        </div>
        <div class="flex flex-wrap gap-2 mb-3">
          <span v-for="(s, i) in store.compareList" :key="s.id" class="flex items-center gap-2 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs">
            <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: SNAP_COLORS[i % SNAP_COLORS.length] }"></span>
            <span class="text-slate-300">{{ s.label }}</span>
            <span class="text-slate-500">{{ s.items.length }} 条<template v-if="store.compareList.length >= 2"> · 独有 {{ store.compareDiff.uniqueCounts[i] }}</template></span>
            <button @click="store.removeFromCompare(s.id)" class="text-slate-500 hover:text-red-400 leading-none">×</button>
          </span>
        </div>
        <template v-if="store.compareList.length >= 2">
          <div class="flex items-center gap-4 text-xs text-slate-400 mb-2">
            <span>并集 {{ store.compareDiff.total }} 个词根 · 共有 {{ store.compareDiff.common }} 个 · 差异 {{ store.compareDiff.total - store.compareDiff.common }} 个</span>
            <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" v-model="onlyDiff" class="accent-cyan-500" /> 只看差异行</label>
          </div>
          <div class="overflow-x-auto max-h-64 overflow-y-auto">
            <table class="w-full text-xs">
              <thead class="sticky top-0 bg-slate-700">
                <tr>
                  <th class="px-2 py-2 text-left text-slate-300">词根</th>
                  <th class="px-2 py-2 text-left text-slate-300">含义</th>
                  <th v-for="(s, i) in store.compareList" :key="s.id" class="px-2 py-2 text-left" :style="{ color: SNAP_COLORS[i % SNAP_COLORS.length] }">{{ s.label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in diffRows" :key="row.root" class="border-t border-slate-700" :class="row.inAll ? '' : 'bg-amber-900/10'">
                  <td class="px-2 py-1.5 font-mono text-slate-200 font-bold">{{ row.root }}</td>
                  <td class="px-2 py-1.5 text-slate-400">{{ row.meaning }}</td>
                  <td v-for="(cell, i) in row.cells" :key="i" class="px-2 py-1.5">
                    <span v-if="cell" class="text-green-400">✓</span>
                    <span v-else class="text-slate-600">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <p v-else class="text-xs text-slate-500">再调整筛选条件并「加入比较清单」，即可集中对照多次筛选的差异。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as d3 from 'd3'
import { useEtymologyStore, LANGUAGE_FAMILIES } from './store/etymology'

const store = useEtymologyStore()
const svgRef = ref<SVGSVGElement | null>(null)
const COLORS: Record<string, string> = { ie: '#3b82f6', st: '#22c55e', aa: '#f59e0b', ural: '#8b5cf6' }
const SNAP_COLORS = ['#22d3ee', '#f59e0b', '#a78bfa', '#34d399', '#f472b6', '#f87171']

const compareHint = ref('')
const compareHintOk = ref(true)
let hintTimer: ReturnType<typeof setTimeout> | undefined
function onAddToCompare() {
  const r = store.addToCompare()
  compareHintOk.value = r === 'added'
  compareHint.value = r === 'added' ? '已加入比较清单' : r === 'duplicate' ? '相同筛选已在清单中' : '当前筛选无结果'
  clearTimeout(hintTimer)
  hintTimer = setTimeout(() => { compareHint.value = '' }, 2000)
}

const onlyDiff = ref(false)
const diffRows = computed(() => {
  const rows = store.compareDiff.rows
  return onlyDiff.value ? rows.filter(r => !r.inAll) : rows
})

function drawGraph() {
  if (!svgRef.value) return
  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()
  const W = svgRef.value.getBoundingClientRect().width || 700, H = 460
  const nodes = store.graph.nodes.map((n: any) => ({ ...n }))
  const links = store.graph.links.map((l: any) => ({ ...l }))
  const sim = d3.forceSimulation(nodes as any)
    .force('link', d3.forceLink(links as any).id((d: any) => d.id).distance(55))
    .force('charge', d3.forceManyBody().strength(-100))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide(22))
  const g = svg.append('g')
  svg.call(d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.2, 3]).on('zoom', (e) => g.attr('transform', e.transform)) as any)
  const link = g.append('g').selectAll('line').data(links).join('line')
    .attr('stroke', '#475569').attr('stroke-width', 1).attr('opacity', 0.5)
  const node = g.append('g').selectAll('g').data(nodes).join('g')
    .call(d3.drag<any, any>()
      .on('start', (e, d: any) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
      .on('drag', (e, d: any) => { d.fx = e.x; d.fy = e.y })
      .on('end', (e, d: any) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null }))
    .on('click', (_: any, d: any) => { store.selectedNode = d })
  node.append('circle')
    .attr('r', (d: any) => d.language === 'Proto-IE' ? 12 : 7)
    .attr('fill', (d: any) => COLORS[d.family] || '#64748b')
    .attr('stroke', '#1e293b').attr('stroke-width', 1.5)
  node.append('text').attr('dy', -14).attr('text-anchor', 'middle').attr('font-size', 9).attr('fill', '#e2e8f0')
    .text((d: any) => d.word.length > 8 ? d.word.slice(0, 8) + '…' : d.word)
  node.append('title').text((d: any) => `${d.word} (${d.language}): ${d.meaning}`)
  sim.on('tick', () => {
    link.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y)
    node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
  })
}

onMounted(() => { setTimeout(drawGraph, 100) })
</script>
