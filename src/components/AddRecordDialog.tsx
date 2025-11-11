import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Upload, FileText, X, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";

interface AddRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const recordTypes = [
  "Medical Report",
  "Lab Results",
  "Dental Record",
  "Imaging",
  "Medication Record",
  "Vaccination Record",
  "Surgery Report",
  "Prescription",
  "Other",
];

export const AddRecordDialog = ({ open, onOpenChange }: AddRecordDialogProps) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title || !type || !date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No Files",
        description: "Please upload at least one file.",
        variant: "destructive",
      });
      return;
    }

    // Simulate record creation
    toast({
      title: "Record Created Successfully",
      description: `"${title}" has been encrypted and stored securely.`,
    });

    // Reset form
    setTitle("");
    setType("");
    setDate("");
    setNotes("");
    setFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Add New Medical Record
          </DialogTitle>
          <DialogDescription>
            Upload and encrypt your medical documents. All files are automatically encrypted before storage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {/* File Upload Area */}
          <div>
            <Label>Upload Files *</Label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-1 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop files here, or click to browse
              </p>
              <Input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>Select Files</span>
                </Button>
              </Label>
              <p className="text-xs text-muted-foreground mt-2">
                Supported: PDF, JPG, PNG, DOC, DOCX (Max 20MB per file)
              </p>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <Label className="text-sm">Selected Files ({files.length})</Label>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="w-3 h-3" />
                        Will be encrypted
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Record Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Record Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Annual Physical Examination"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="type">Record Type *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {recordTypes.map((recordType) => (
                    <SelectItem key={recordType} value={recordType}>
                      {recordType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes or context..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Encryption Notice */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary">
                  Automatic Encryption Enabled
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  All uploaded files will be encrypted using AES-256 encryption before storage.
                  Only you and users you explicitly grant access can view these records.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Lock className="w-4 h-4 mr-2" />
            Encrypt & Save Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
