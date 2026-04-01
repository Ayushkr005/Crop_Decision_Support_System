import { useTranslationContext } from "@/contexts/TranslationContext";
import { ReactNode } from "react";

interface TranslatableTextProps {
  children: string | ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const TranslatableText = ({ children, className, as: Component = "span" }: TranslatableTextProps) => {
  const { translate } = useTranslationContext();

  if (typeof children !== "string") {
    return <Component className={className}>{children}</Component>;
  }

  return <Component className={className}>{translate(children)}</Component>;
};
