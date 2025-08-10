import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function LogsPage() {
  const { user } = useAuth();

  const { data: logs, isLoading } = useQuery({
    queryKey: ['/api/logs'],
    enabled: user?.role === 'admin',
  });

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <span className="material-icons text-6xl text-neutral-300 mb-4 block">lock</span>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">Acesso Restrito</h3>
            <p className="text-neutral-600">Apenas administradores podem visualizar os logs.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 bg-neutral-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logs do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {logs?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Data/Hora</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Usuário</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Tipo de Ação</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Descrição</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {logs.map((log: any) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{log.userName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{log.actionType}</td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{log.description}</td>
                      <td className="px-6 py-4 text-sm text-neutral-500">
                        {log.details ? <pre className="whitespace-pre-wrap text-xs bg-neutral-100 p-2 rounded">{JSON.stringify(log.details, null, 2)}</pre> : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <CardContent className="p-12 text-center">
              <span className="material-icons text-6xl text-neutral-300 mb-4 block">info</span>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">Nenhum log encontrado</h3>
              <p className="text-neutral-600">O sistema ainda não registrou nenhuma atividade.</p>
            </CardContent>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
