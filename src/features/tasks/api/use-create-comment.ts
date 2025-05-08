import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)["comments"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)["comments"]["$post"]
>;

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.tasks["comments"]["$post"]({ json });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Comment Added");

      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  return mutation;
};
