import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Lock, Share2, FileText } from "lucide-react";
import { Badge } from "./ui/badge";

interface RecordCardProps {
  title: string;
  date: string;
  type: string;
  isEncrypted: boolean;
  sharedWith: string[];
}

export const RecordCard = ({ title, date, type, isEncrypted, sharedWith }: RecordCardProps) => {
  return (
    <Card className="hover:shadow-elevated transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="text-sm">{date}</CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isEncrypted && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="w-3 h-3" />
                Encrypted
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-medium">{type}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Shared with:</span>
            <span className="font-medium">{sharedWith.length > 0 ? sharedWith.length : 'None'}</span>
          </div>
          
          <div className="pt-2 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button variant="default" size="sm" className="flex-1">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
