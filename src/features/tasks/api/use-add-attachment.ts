import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)["attachment"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)["attachment"]["$post"]
>;

export const useAddAttachment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (formData) => {
      const response = await client.api.tasks["attachment"]["$post"](formData);

      if (!response.ok) {
        throw new Error("Failed to updated case");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Attachment Added");

      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
    onError: () => {
      toast.error("Failed to add attachment");
    },
  });

  return mutation;
};
