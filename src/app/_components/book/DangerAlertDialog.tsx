import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DangerAlertDialogProps {
  title: string;
  text: string;
  additionalClassesForButton: string;
  disabled: boolean;
  onClick: () => void;
}

export default function DangerAlertDialog({
  title,
  text,
  additionalClassesForButton,
  disabled,
  onClick,
}: DangerAlertDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className={`h-11 px-4 rounded-md whitespace-nowrap cursor-pointer hover:opacity-90 ${additionalClassesForButton}`}
          disabled
        >
          {title}
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-lg bg-surface-container border border-border shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading text-headline-md text-on-surface">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="font-body text-body-sm text-on-surface-variant">
            {text}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-sm h-10 px-4 min-w-22 cursor-pointer border border-outline-variant text-on-surface hover:bg-surface-high transition-colors">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-sm h-10 px-4 min-w-24 cursor-pointer bg-error text-error-foreground hover:opacity-90 transition-opacity"
            onClick={onClick}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
