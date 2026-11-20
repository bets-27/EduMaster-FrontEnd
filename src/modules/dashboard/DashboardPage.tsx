import clsx from 'clsx'
import { useDashboard } from '../../hooks/useDashboard'
import { can } from '../../services/permissions'
import { useSessionStore } from '../../stores/sessionStore'
import PermissionGate from '../../components/ui/PermissionGate'
import FilterBar from '../../components/ui/FilterBar'
import NeuralNetworkCanvas from '../neural-visualizer/NeuralNetworkCanvas'
import TrendChart from '../../components/charts/TrendChart'
import GeoProgressMap from '../../components/charts/GeoProgressMap'
import CompletionDonut from '../../components/charts/CompletionDonut'
import SkillHeatmap from '../skill-mastery/SkillHeatmap'
import RecommendationList from '../recommendations/RecommendationList'
import ActivityFeed from '../activity/ActivityFeed'
import KpiCard from './KpiCard'

export default function DashboardPage() {
  const role = useSessionStore((s) => s.role)
  const { data: kpis, isLoading } = useDashboard((s) => s.kpis)

  return (
    <div className="space-y-4">
      <FilterBar />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {isLoading || !kpis
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-panel" />)
          : kpis.map((k) => <KpiCard key={k.id} kpi={k} />)}
      </div>

      <div className={clsx('grid gap-4', can(role, 'panel.neural') && 'xl:grid-cols-2')}>
        <PermissionGate perm="panel.neural"><NeuralNetworkCanvas /></PermissionGate>
        <TrendChart />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <CompletionDonut />
        <PermissionGate perm="panel.map"><GeoProgressMap /></PermissionGate>
        <PermissionGate perm="panel.skills"><SkillHeatmap /></PermissionGate>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PermissionGate perm="panel.reco"><RecommendationList /></PermissionGate>
        <PermissionGate perm="panel.activity"><ActivityFeed /></PermissionGate>
      </div>
    </div>
  )
}