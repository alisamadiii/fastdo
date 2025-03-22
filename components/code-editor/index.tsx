import { CodeSyntax } from "@/components/magicui/code-syntax";

export function CodeSyntaxDemo({
  code,
  filename,
  onValueChange,
}: {
  code: string;
  filename: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <CodeSyntax
      code={code}
      language="typescript"
      filename={filename}
      lightTheme="github-light"
      darkTheme="github-dark"
      onValueChange={onValueChange}
    />
  );
}
