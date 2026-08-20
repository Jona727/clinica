import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useTurnos = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['turnos'],
    queryFn: async () => {
      // Idealmente podríamos pasar params ?fechaInicio=&fechaFin=
      const { data } = await api.get('/turnos');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newTurno: any) => {
      const { data } = await api.post('/turnos', newTurno);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
    },
  });

  return {
    turnos: query.data || [],
    isLoading: query.isPending,
    error: query.error,
    createTurno: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
};
