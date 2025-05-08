import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)["bpmnDownload"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)["bpmnDownload"]["$post"]
>;

export const useGetBpmnDownload = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.tasks["bpmnDownload"]["$post"]({
        json,
      });

      if (!response.ok) {
        throw new Error("Trouble downloading BPMN");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("BPMN downloaded");
    },
    onError: () => {
      toast.error("Trouble downloading BPMN");
    },
  });

  return mutation;
};
