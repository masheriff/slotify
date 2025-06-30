export interface DeleteOrganizationDialogProps {
  organization: {
    id: string;
    name: string;
    type?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}