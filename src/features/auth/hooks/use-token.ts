import { useSearchParam } from "react-use";

export const useResetToken = () => {
  const username = useSearchParam("username");
  const password = useSearchParam("password");
  return { username, password };
};
