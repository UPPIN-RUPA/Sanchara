import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function ContentContainer({ children }: Props) {
  return <section className="content-container">{children}</section>;
}
