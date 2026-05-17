import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { tauri } from "@/lib/tauri";
import type { LoginInput, SignupInput } from "@/lib/schemas";
import type { User } from "@/lib/types";

function authResultToUser(r: {
  user_id: number;
  email: string;
  display_name: string | null;
  created_at: string;
}): User {
  return {
    id: r.user_id,
    email: r.email,
    display_name: r.display_name,
    created_at: r.created_at,
    last_login_at: null,
  };
}

export function useLogin() {
  const { signin } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) => tauri.auth.login(input.email, input.password),
    onSuccess: (data) => {
      signin({ token: data.session_token, user: authResultToUser(data) });
      toast.success("Connexion réussie");
      router.replace("/");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Échec de la connexion");
    },
  });
}

export function useSignup() {
  const { signin } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: SignupInput) =>
      tauri.auth.signup({ email: input.email, password: input.password }),
    onSuccess: (data) => {
      signin({ token: data.session_token, user: authResultToUser(data) });
      toast.success("Compte créé avec succès !");
      router.replace("/database"); // Premier lancement → configurer la base
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Échec de l'inscription");
    },
  });
}
