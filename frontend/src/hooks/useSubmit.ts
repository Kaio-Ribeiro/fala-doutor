import { toast } from 'react-toastify';

export function useSubmit<T>(endpoint: string, refetch: () => void, onSuccess?: () => void) {
    return async (isEdit: boolean, id?: string | number, payload?: T) => {
        try {
            const base = 'http://localhost:3000';
            const url = isEdit && id ? `${base}/api${endpoint}/${id}` : `${base}/api${endpoint}`;
            const method = isEdit ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const json = await res.json();

            if (!res.ok) throw new Error(json.error || 'Falha ao salvar doutor');

            if (onSuccess) onSuccess();
            refetch();
            toast.success(isEdit ? 'Doutor atualizado com sucesso!' : 'Doutor criado com sucesso!');
        } catch (error) {
            console.error(error);
            const msg = error instanceof Error ? error.message : (isEdit ? "Erro ao atualizar doutor!" : "Erro ao criar doutor!");
            toast.error(msg);
        }
    }
}