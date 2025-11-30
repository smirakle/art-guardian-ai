import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface AdminSectionWrapperProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function AdminSectionWrapper({ title, description, children, className }: AdminSectionWrapperProps) {
  if (!title) {
    return <>{children}</>;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
