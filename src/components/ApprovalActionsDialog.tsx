
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface ApprovalActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "approve" | "reject" | null;
  entryId: string;
  taskId: string;
  onConfirm: (entryId: string, comment?: string) => void;
  isLoading?: boolean;
}

export function ApprovalActionsDialog({
  open,
  onOpenChange,
  action,
  entryId,
  taskId,
  onConfirm,
  isLoading = false,
}: ApprovalActionsDialogProps) {
  const [comment, setComment] = useState("");

  const handleConfirm = () => {
    onConfirm(entryId, comment || undefined);
    setComment("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setComment("");
    onOpenChange(false);
  };

  if (!action) return null;

  const isApprove = action === "approve";
  const title = isApprove ? "Confirm Approval" : "Confirm Rejection";
  const buttonText = isApprove ? "Yes, Approve" : "Yes, Reject";
  const buttonVariant = isApprove ? "default" : "destructive";
  const Icon = isApprove ? CheckCircle : XCircle;
  const iconColor = isApprove ? 'text-green-600' : 'text-red-600';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-amber-800 mb-1">
                Are you sure you want to {action} this entry?
              </div>
              <div className="text-amber-700">
                Entry: <strong>{taskId}</strong>
              </div>
              <div className="text-amber-700 mt-1">
                This action will be logged in the audit history and cannot be undone.
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">
              Comment {isApprove ? "(Optional)" : "(Required for rejection)"}
            </Label>
            <Textarea
              id="comment"
              placeholder={`Add a ${action} comment...`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant={buttonVariant}
            onClick={handleConfirm}
            disabled={(!isApprove && !comment.trim()) || isLoading}
          >
            {isLoading ? "Processing..." : buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
