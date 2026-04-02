import { FileImage, FileScan, WandSparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UploadPanelProps {
  action: (formData: FormData) => void | Promise<void>;
}

export function UploadPanel({ action }: UploadPanelProps) {
  return (
    <form action={action}>
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle>Poster ingestion pipeline</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-8 p-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="poster-file">Poster file</Label>
              <Input accept=".jpeg,.jpg,.png,.pdf" id="poster-file" name="poster" required type="file" />
              <p className="text-sm text-muted-foreground">
                Accepts `.jpeg`, `.png`, and `.pdf` files. Storage, text extraction, parsing, and
                category classification run after upload inside the protected admin workflow.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] bg-muted/50 p-4 text-sm">
                <FileImage className="h-5 w-5 text-primary" />
                <p className="mt-3 font-medium">Store original file</p>
              </div>
              <div className="rounded-[22px] bg-muted/50 p-4 text-sm">
                <FileScan className="h-5 w-5 text-primary" />
                <p className="mt-3 font-medium">Extract raw poster text</p>
              </div>
              <div className="rounded-[22px] bg-muted/50 p-4 text-sm">
                <WandSparkles className="h-5 w-5 text-primary" />
                <p className="mt-3 font-medium">Parse structured metadata</p>
              </div>
            </div>
            <Button className="w-full sm:w-auto" type="submit">
              Upload and extract
            </Button>
          </div>

          <div className="rounded-[28px] bg-muted/50 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Pipeline states</p>
            <ol className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
              <li>1. Upload poster and persist file reference to storage.</li>
              <li>2. Run poster text extraction.</li>
              <li>3. Normalize title, date, time, venue, and category.</li>
              <li>4. Save as `review_required` when confidence is unclear.</li>
              <li>5. Publish only after admin verification.</li>
            </ol>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              This route is protected by the separate admin login so only admins can run the
              ingestion workflow.
            </p>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
