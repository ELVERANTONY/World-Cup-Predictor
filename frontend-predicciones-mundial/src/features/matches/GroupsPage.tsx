import { motion } from 'motion/react'
import { useGroupStats } from '@/hooks/useQueries'
import type { GroupStats } from '@/services/statistics.service'

export function GroupsPage() {
  const { data: groups = {} as Record<string, GroupStats[]>, isLoading: loading } = useGroupStats()

  if (loading) {
    return <div className="p-8">Loading groups...</div>
  }

  // Assuming data is { 'Group A': [...teams], 'Group B': [...] }
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Grupos</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Consulta las tablas oficiales de la fase de grupos del Mundial.</p>
        <p className="text-sm font-medium text-worldcup-600 dark:text-worldcup-400 mt-2 bg-worldcup-50 dark:bg-worldcup-900/20 inline-block px-3 py-1.5 rounded-lg">
          Clasifican 32 equipos a la fase eliminatoria: los dos primeros de cada grupo y los 8 mejores terceros.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([groupName, teams], idx) => (
          <motion.div key={groupName} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="px-5 py-4 bg-primary text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">{groupName}</h3>
              <span className="text-xs font-medium text-white/80">3 jugados</span>
            </div>
            
            <div className="overflow-x-auto p-4">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-zinc-800">
                  <tr>
                    <th className="px-2 py-3 font-medium w-8">#</th>
                    <th className="px-2 py-3 font-medium">EQUIPO</th>
                    <th className="px-2 py-3 font-medium text-center w-10">PJ</th>
                    <th className="px-2 py-3 font-medium text-center w-10">G</th>
                    <th className="px-2 py-3 font-medium text-center w-10">E</th>
                    <th className="px-2 py-3 font-medium text-center w-10">P</th>
                    <th className="px-2 py-3 font-medium text-center w-10 hidden sm:table-cell">GF</th>
                    <th className="px-2 py-3 font-medium text-center w-10 hidden sm:table-cell">GC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
                  {(teams as any[]).map((team, index) => (
                    <tr key={team.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="px-2 py-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < 2 ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'}`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-2 py-3 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        {team.flagUrl ? <img src={team.flagUrl.replace('w80/w80/', 'w80/')} alt={team.shortName} className="w-6 h-4 object-cover rounded-sm shadow-sm" /> : <span className="text-base">🏳</span>}
                        {team.name}
                      </td>
                      <td className="px-2 py-3 text-center font-semibold text-gray-600 dark:text-gray-400">{team.played || 3}</td>
                      <td className="px-2 py-3 text-center font-bold text-green-600">{team.won || 0}</td>
                      <td className="px-2 py-3 text-center font-bold text-gray-700 dark:text-gray-300">{team.drawn || 0}</td>
                      <td className="px-2 py-3 text-center font-bold text-red-500">{team.lost || 0}</td>
                      <td className="px-2 py-3 text-center font-semibold text-gray-800 dark:text-gray-200 hidden sm:table-cell">{team.goalsFor || 0}</td>
                      <td className="px-2 py-3 text-center font-semibold text-gray-800 dark:text-gray-200 hidden sm:table-cell">{team.goalsAgainst || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 pb-4 text-[11px] text-gray-500 font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <strong>1° y 2°</strong> Avanzan directo · terceros compiten por 8 cupos
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
