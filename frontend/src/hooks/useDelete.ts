import { toast } from "react-toastify";
import { useCallback } from "react";

type Item = { id: number | string }

export function useDelete(endpoint: string, refetch: () => void) {
    return useCallback(async (item: Item) => {
        try {
            const res = await fetch(`http://localhost:3000/api${endpoint}/${item.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Erro ao excluir item")
            refetch();
            toast.success("Item excluído com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir item");
        }
    }, [endpoint, refetch])

}