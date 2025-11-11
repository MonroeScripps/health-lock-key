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
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { X, Plus, Lock, Eye, Download, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordTitle: string;
  sharedWith: string[];
}

const availableContacts = [
  { id: 1, name: "Dr. Sarah Johnson", type: "Doctor" },
  { id: 2, name: "Dr. Michael Chen", type: "Doctor" },
  { id: 3, name: "Metro Health Insurance", type: "Insurance" },
  { id: 4, name: "Dr. Emily Roberts", type: "Doctor" },
  { id: 5, name: "City Medical Lab", type: "Laboratory" },
];

const permissionTypes = [
  { id: "view", label: "View", icon: Eye },
  { id: "download", label: "Download", icon: Download },
  { id: "edit", label: "Edit Metadata", icon: Edit },
];

export const ShareDialog = ({ open, onOpenChange, recordTitle, sharedWith }: ShareDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>(sharedWith);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const { toast } = useToast();

  const filteredContacts = availableContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleContact = (contactName: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactName)
        ? prev.filter((name) => name !== contactName)
        : [...prev, contactName]
    );
    
    if (!permissions[contactName]) {
      setPermissions((prev) => ({ ...prev, [contactName]: ["view"] }));
    }
  };

  const togglePermission = (contactName: string, permissionId: string) => {
    setPermissions((prev) => {
      const contactPerms = prev[contactName] || ["view"];
      const hasPermission = contactPerms.includes(permissionId);
      
      if (permissionId === "view" && !hasPermission) {
        return prev;
      }
      
      return {
        ...prev,
        [contactName]: hasPermission
          ? contactPerms.filter((p) => p !== permissionId)
          : [...contactPerms, permissionId],
      };
    });
  };

  const handleSave = () => {
    toast({
      title: "Permissions Updated",
      description: `Access to "${recordTitle}" has been updated successfully.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Share Medical Record
          </DialogTitle>
          <DialogDescription>
            Manage access permissions for "{recordTitle}". All access is encrypted and logged.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          <div>
            <Label htmlFor="search">Search Contacts</Label>
            <Input
              id="search"
              placeholder="Search doctors, insurers, or labs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="space-y-3">
            <Label>Grant Access To:</Label>
            {filteredContacts.map((contact) => {
              const isSelected = selectedContacts.includes(contact.name);
              const contactPerms = permissions[contact.name] || ["view"];

              return (
                <div
                  key={contact.id}
                  className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleContact(contact.name)}
                      />
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.type}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="w-3 h-3" />
                        Encrypted Access
                      </Badge>
                    )}
                  </div>

                  {isSelected && (
                    <div className="pl-9 space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Permissions:</p>
                      <div className="flex flex-wrap gap-2">
                        {permissionTypes.map((perm) => {
                          const Icon = perm.icon;
                          const hasPermission = contactPerms.includes(perm.id);
                          
                          return (
                            <Button
                              key={perm.id}
                              variant={hasPermission ? "default" : "outline"}
                              size="sm"
                              onClick={() => togglePermission(contact.name, perm.id)}
                              disabled={perm.id === "view"}
                              className="gap-2"
                            >
                              <Icon className="w-3 h-3" />
                              {perm.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedContacts.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Currently Shared With:</p>
              <div className="flex flex-wrap gap-2">
                {selectedContacts.map((contact) => (
                  <Badge key={contact} variant="secondary" className="gap-2">
                    {contact}
                    <button
                      onClick={() => toggleContact(contact)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Lock className="w-4 h-4 mr-2" />
            Save Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
