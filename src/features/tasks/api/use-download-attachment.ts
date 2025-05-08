import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)["download-attachment"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)["download-attachment"]["$post"]
>;

export const useDownloadAttachment = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.tasks["download-attachment"]["$post"]({
        json,
      });

      if (!response.ok) {
        throw new Error("Problem Downloading Attachment");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Attachment Downloaded");
    },
    onError: () => {
      toast.error("Problem Downloading Attachment");
    },
  });

  return mutation;
};
