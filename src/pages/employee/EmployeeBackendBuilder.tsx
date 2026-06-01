import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function EmployeeBackendBuilder() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold">Backend Builder</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Build backend APIs, services, and integrations for your projects.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            This workspace is set up for backend feature creation. Select a
            project and define the backend capabilities you'd like to add.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Create backend task
            </Button>
            <Button
              variant="outline"
              className="border-border text-muted-foreground hover:bg-muted/50"
            >
              View backend services
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
