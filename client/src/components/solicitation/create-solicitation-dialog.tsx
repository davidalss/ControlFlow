import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // Added useQuery
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select components
import type { User } from "@shared/schema"; // Added User type import

const formSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  description: z.string().min(1, "A descrição é obrigatória."),
  assigneeId: z.string().optional(), // Added assigneeId
});

export default function CreateSolicitationDialog() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users for assignment
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      assigneeId: "unassigned", // Set default value for assigneeId to "unassigned"
    },
  });

  const createSolicitationMutation = useMutation({
    mutationFn: async (newSolicitation: z.infer<typeof formSchema>) => {
      const response = await apiRequest('POST', '/api/solicitations', newSolicitation);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitação criada com sucesso",
        description: "Sua solicitação foi enviada para a fila de inspeção.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/solicitations/pending'] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar solicitação",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createSolicitationMutation.mutate(values);
  };

  return (
    <DialogContent className="sm:max-w-[425px]" aria-describedby="create-solicitation-form-description">
      <DialogHeader>
        <DialogTitle>Criar Nova Solicitação</DialogTitle>
        <DialogDescription id="create-solicitation-form-description">
          Preencha os detalhes para solicitar uma nova atividade.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Título da atividade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea placeholder="Detalhes da atividade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assigneeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Atribuir a</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um usuário (opcional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingUsers ? (
                      <SelectItem value="loading" disabled>Carregando usuários...</SelectItem> // Changed value to "loading"
                    ) : (
                      <>
                        <SelectItem value="unassigned">Ninguém (fila geral)</SelectItem>
                        {users?.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={createSolicitationMutation.isPending || isLoadingUsers}>
              {createSolicitationMutation.isPending ? "Enviando..." : "Enviar Solicitação"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
