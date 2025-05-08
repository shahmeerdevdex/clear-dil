import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["invite-user"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[":workspaceId"]["invite-user"]["$post"]
>;

export const useInviteUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form, param }) => {
      const response = await client.api.workspaces[":workspaceId"][
        "invite-user"
      ]["$post"]({ form, param });

      if (!response.ok) {
        throw new Error("Failed to invite user");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Invite sent");

      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: () => {
      toast.error("Failed to reset invite code");
    },
  });

  return mutation;
};
