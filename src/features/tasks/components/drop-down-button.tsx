import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import React, { FC } from "react";
import { Button } from "@/components/ui/button";

export const DropdownButton: FC<{
  btnText: string;
  children: React.ReactNode;
}> = ({ btnText, children }) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative w-full">
        <Button size="xs" variant="outline" className="w-full" type="button">
          {btnText}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className="w-fit"
        sideOffset={2}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
