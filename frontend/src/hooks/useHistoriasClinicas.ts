import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useHistoriasClinicas = (pacienteId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['historiasClinicas', pacienteId],
    queryFn: async () => {
      const { data } = await api.get(`/historias-clinicas/${pacienteId}`);
      return data;
    },
    enabled: !!pacienteId,
  });

  const createMutation = useMutation({
    mutationFn: async (nuevaEvolucion: any) => {
      const { data } = await api.post('/historias-clinicas', nuevaEvolucion);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historiasClinicas'] });
    },
  });

  return {
    evoluciones: query.data || [],
    isLoading: query.isPending,
    error: query.error,
    createEvolucion: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
};
