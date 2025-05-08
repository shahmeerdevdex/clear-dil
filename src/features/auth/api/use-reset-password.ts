import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<
  (typeof client.api.auth.resetPassword)["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.auth.resetPassword)["$post"]
>;

export const useResetPassword = () => {
  const router = useRouter();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth.resetPassword["$post"]({ json });

      if (!response.ok) {
        throw new Error("Failed to update password");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Password Updated");
      router.push("/sign-in");
    },
    onError: () => {
      toast.error("Failed to update password");
    },
  });

  return mutation;
};
