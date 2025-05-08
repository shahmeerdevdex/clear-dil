import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)["examine"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)["examine"]["$post"]
>;

export const useExamineTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.tasks["examine"]["$post"]({ json });

      if (!response.ok) {
        throw new Error("Failed to updated case");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Case updated");

      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
    onError: () => {
      toast.error("This action cannot be performed by this user");
    },
  });

  return mutation;
};
